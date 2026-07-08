"""seismic.utils — helpers puros compartidos (floats, booleanos, espectro)."""

import io
import traceback
import numpy as np

try:
    import openseespywin.opensees as ops
except ImportError:
    try:
        import openseespy.opensees as ops
    except ImportError:
        ops = None


__all__ = [
    "_as_bool",
    "_ms_float",
    "_to_float",
    "interpolate_spectrum",
]


def interpolate_spectrum(spectrum: list[tuple[float, float]], period: float) -> float:
    """Interpolación lineal del espectro en el periodo dado."""
    if not spectrum:
        return 0.0
    t_vals = [p[0] for p in spectrum]
    sa_vals = [p[1] for p in spectrum]

    if period <= t_vals[0]:
        return sa_vals[0]
    if period >= t_vals[-1]:
        return sa_vals[-1]

    for i in range(len(t_vals) - 1):
        if t_vals[i] <= period <= t_vals[i + 1]:
            frac = (period - t_vals[i]) / (t_vals[i + 1] - t_vals[i])
            return sa_vals[i] + frac * (sa_vals[i + 1] - sa_vals[i])

    return sa_vals[-1]

def _as_bool(value, default=False) -> bool:
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)):
        return value != 0

    if isinstance(value, str):
        text = value.strip().lower()
        if text in ["true", "1", "yes", "y", "si", "sí", "on"]:
            return True
        if text in ["false", "0", "no", "off"]:
            return False

    return default

def _ms_float(value, fallback=0.0) -> float:
    try:
        number = float(value)
        return number if number == number else fallback
    except Exception:
        return fallback

def _to_float(value, default=0.0) -> float:
    """Convierte valores a float de forma segura."""
    try:
        if value is None:
            return default
        number = float(value)
        if np.isfinite(number):
            return number
        return default
    except Exception:
        return default
