"""
Capa 1 de la red de regresión (ver project_regression_net_plan en memoria):
golden tests contra `run_full_seismic_analysis` — NO juzgan si el resultado
está bien (para eso está la Capa 2, contra ETABS, todavía no construida acá),
juzgan si CAMBIÓ. Eso es lo que hace falta antes de tocar código compartido
(p.ej. el modificador de flexión fuera-de-plano de muros de albañilería que
motivó esta red — ver project_pmm_ratio_gap).

El motor NO es determinista bit a bit (spread relativo peor medido: 5.3e-13,
puro redondeo del eigensolver) — por eso la tolerancia es 1e-9 (RTOL), no
igualdad exacta: 4 órdenes de margen sobre el ruido, sigue cazando cualquier
cambio real (un bug de refactor mueve ≥1e-6).

Correr:
    venv/Scripts/python.exe -m pytest tests/regresion -v
Regenerar los golden files a propósito (después de un cambio de física real,
NO para "arreglar" un fallo sin entenderlo):
    venv/Scripts/python.exe -m pytest tests/regresion -v --actualizar
"""

import json
import math
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]  # python-backend/
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from seismic.pipeline import run_full_seismic_analysis  # noqa: E402

PAYLOADS_DIR = Path(__file__).parent / "payloads"
GOLDEN_DIR = Path(__file__).parent / "esperado"
RTOL = 1e-9

PAYLOAD_NAMES = sorted(p.stem for p in PAYLOADS_DIR.glob("*.json"))


def _normalize_spectrum(data: dict) -> dict:
    """Mismo criterio que app.py antes de llamar a run_full_seismic_analysis:
    [{T,Sa}] (como llegan los payloads guardados desde el navegador) -> [(T,Sa)]."""
    for key in ("spectrum_x", "spectrum_y"):
        spec = data.get(key)
        if spec and isinstance(spec[0], dict):
            data[key] = [(float(p["T"]), float(p["Sa"])) for p in spec]
    return data


def _sanitize(value):
    """JSON no serializa tipos numpy (np.float64, np.int64) — el resultado del
    motor puede traerlos mezclados con floats/ints nativos. Convierte a tipos
    nativos recursivamente, dejando NaN/inf como string (json estándar no los
    admite, y romper el golden file entero por un NaN aislado no ayuda)."""
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_sanitize(v) for v in value]
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        f = float(value)
        if math.isnan(f) or math.isinf(f):
            return str(f)
        return f
    if hasattr(value, "item"):  # numpy scalar
        return _sanitize(value.item())
    return value


def _extract_golden(res: dict) -> dict:
    """Subconjunto ESTABLE del resultado completo — no todo `res` (trae cosas
    como `modal_shapes`/`seismic_animation`, pesadas y no relevantes para
    detectar regresiones de física). Si se necesita cubrir más superficie más
    adelante, ampliar acá — un golden desactualizado se regenera con
    --actualizar, no hay que tocar el JSON a mano."""
    modal = res.get("modal", {})
    modes = modal.get("modes", [])
    seismic = res.get("seismic", {})
    sx = seismic.get("x", {})
    sy = seismic.get("y", {})
    drifts = res.get("story_drifts", {})

    return _sanitize({
        "success": res.get("success"),
        "periods": [m.get("period") for m in modes],
        "mass_participation_cumulative": {
            "x": modes[-1].get("cumulative_participation_x") if modes else None,
            "y": modes[-1].get("cumulative_participation_y") if modes else None,
            "rz": modes[-1].get("cumulative_participation_rz") if modes else None,
        },
        "base_shear": {
            "x": {k: sx.get(k) for k in (
                "base_shear_fx", "base_shear_fy",
                "base_moment_mx", "base_moment_my", "base_moment_mz",
            )},
            "y": {k: sy.get(k) for k in (
                "base_shear_fx", "base_shear_fy",
                "base_moment_mx", "base_moment_my", "base_moment_mz",
            )},
        },
        "story_drift_summary": drifts.get("summary"),
        "story_shears": res.get("story_shears"),
        "effective_mass": res.get("effective_mass"),
    })


def _assert_close(actual, expected, path=""):
    """Comparación recursiva con tolerancia relativa RTOL — pytest.approx no
    baja sola por listas/dicts anidados con la profundidad que trae este
    resultado, así que se recorre a mano para poder señalar el path exacto
    que cambió (mensaje de assert útil en vez de un diff de JSON gigante)."""
    if isinstance(expected, dict):
        assert isinstance(actual, dict), f"{path}: se esperaba dict, salió {type(actual)}"
        assert set(actual.keys()) == set(expected.keys()), f"{path}: claves distintas"
        for k in expected:
            _assert_close(actual[k], expected[k], f"{path}.{k}")
    elif isinstance(expected, list):
        assert isinstance(actual, list), f"{path}: se esperaba list, salió {type(actual)}"
        assert len(actual) == len(expected), f"{path}: longitud distinta ({len(actual)} vs {len(expected)})"
        for i, (a, e) in enumerate(zip(actual, expected)):
            _assert_close(a, e, f"{path}[{i}]")
    elif isinstance(expected, float):
        assert actual == pytest.approx(expected, rel=RTOL, abs=1e-12), f"{path}: {actual} != {expected}"
    else:
        assert actual == expected, f"{path}: {actual!r} != {expected!r}"


@pytest.mark.parametrize("name", PAYLOAD_NAMES)
def test_regresion(name, request):
    payload_path = PAYLOADS_DIR / f"{name}.json"
    golden_path = GOLDEN_DIR / f"{name}.json"

    with open(payload_path, encoding="utf-8") as f:
        data = json.load(f)
    _normalize_spectrum(data)

    res = run_full_seismic_analysis(data)
    assert res.get("success"), f"El análisis falló: {res.get('error') or res.get('static', {}).get('error')}"

    golden = _extract_golden(res)

    if request.config.getoption("--actualizar") or not golden_path.exists():
        GOLDEN_DIR.mkdir(exist_ok=True)
        with open(golden_path, "w", encoding="utf-8") as f:
            json.dump(golden, f, indent=2, ensure_ascii=False, sort_keys=True)
        if not request.config.getoption("--actualizar"):
            pytest.skip(f"No existía golden para '{name}' — se generó recién. Correr de nuevo para comparar.")
        return

    with open(golden_path, encoding="utf-8") as f:
        expected = json.load(f)

    _assert_close(golden, expected)
