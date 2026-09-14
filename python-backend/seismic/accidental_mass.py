"""Excentricidad accidental: sobre QUÉ nodos se aplica y cómo se desplaza el CM.

Motivo de existir
-----------------
Las dos rutinas de torsión accidental de `solver.py` sólo miran los grupos de
diafragma que ROTAN (`rigidDiaphragm_z`). Un modelo con diafragmas **semi
rígidos** no tiene ninguno, así que las dos devuelven ``{}`` y el
`ECCENRATIOTYPICAL` que ETABS aplica a *todos* sus casos espectrales acá no se
aplica en ninguna parte.

No es hipotético: "01.MODULO 01 (1) columna L actualizado.e2k" declara
``DIAPHRAGM "D1" TYPE SEMIRIGID`` y ``ECCENRATIOTYPICAL 0.05`` en los cuatro
casos (SDX, SDX ESCALADO, SDY, SDY ESCALADO). Medido sobre ese modelo, la
excentricidad que no se estaba aplicando vale entre **+16 % y +44 %** en las
fuerzas de pier — el mismo orden que el déficit que se venía viendo contra las
tablas de ETABS.

La redistribución de masa NO necesita un diafragma rígido: es una operación
sobre la masa nodal de un grupo cualquiera. El diafragma rígido sólo hacía falta
para el método ADITIVO, que necesita un nodo maestro donde colgar el par torsor.
Por eso acá el grupo cae a NIVELES DE PISO cuando no hay diafragma que rote.
"""

from __future__ import annotations


def grupos_excentricos(data: dict) -> list[dict]:
    """Grupos de nodos sobre los que desplazar el centro de masa.

    Prioridad:
      1. Diafragmas con rotación (`rigidDiaphragm_z`) — es lo que hacía antes y
         lo que hay que preservar en los modelos ya calibrados.
      2. Si no hay ninguno (todo semi rígido), los nodos CON MASA agrupados por
         elevación. La base (z ≈ 0) se excluye: está restringida y su masa no
         participa de ningún modo.

    Requiere que `data` venga de un `build_model_3d` reciente: lee la masa ya
    resuelta en `_effective_mass_x/_y` (self-weight + Mass Source + manual).

    Devuelve ``[{"node_ids": [...], "fuente": "diafragma"|"piso"}]``.
    """
    aplicados = (data.get("_rigid_diaphragm_report") or {}).get("applied") or []
    rotantes = [g for g in aplicados if g.get("method") == "rigidDiaphragm_z"]
    if rotantes:
        return [
            {"node_ids": [int(x) for x in (g.get("node_ids") or [])],
             "fuente": "diafragma"}
            for g in rotantes
        ]

    por_z: dict[float, list[int]] = {}
    for nd in data.get("nodes", []) or []:
        mx = float(nd.get("_effective_mass_x", 0.0) or 0.0)
        my = float(nd.get("_effective_mass_y", 0.0) or 0.0)
        if max(mx, my) <= 0.0:
            continue
        z = round(float(nd.get("z", 0.0) or 0.0), 3)
        if z <= 1e-9:
            continue
        por_z.setdefault(z, []).append(int(nd["id"]))

    return [{"node_ids": nids, "fuente": "piso"} for _z, nids in sorted(por_z.items())]


def masa_redistribuida(
    data: dict,
    grupos: list[dict],
    direction: str,
    sign: int,
    ecc_ratio: float,
) -> dict[int, tuple[float, float]]:
    """``{id_nodo: (mx, my)}`` con el centroide de cada grupo corrido ±e.

    Δmᵢ = mᵢ·sign·e·M·(pᵢ−p_cm)/I_mass,  I_mass = Σ mᵢ(pᵢ−p_cm)²

    El factor M (masa total del grupo) NO es cosmético: el momento de masa que
    corre el centroide ``e`` metros es ``M·e``, no ``e``. Sin él el
    desplazamiento real sale ``e/M`` — micras, con pisos de decenas de toneladas
    — y las cuatro variantes corren para aportar exactamente 0.0 %.

    Devuelve ``{}`` si ningún grupo tiene brazo o masa utilizable.
    """
    if ecc_ratio <= 0 or not grupos:
        return {}

    nodos = {}
    for nd in data.get("nodes", []) or []:
        try:
            nodos[int(nd["id"])] = nd
        except Exception:
            continue

    fuera: dict[int, tuple[float, float]] = {}

    for grupo in grupos:
        miembros = [nodos[i] for i in grupo.get("node_ids", []) if i in nodos]
        if not miembros:
            continue

        def masa(nd):
            mx = float(nd.get("_effective_mass_x", 0.0) or 0.0)
            my = float(nd.get("_effective_mass_y", 0.0) or 0.0)
            return max(mx, my, 0.0)

        pesos = [masa(m) for m in miembros]
        xs = [float(m.get("x", 0.0)) for m in miembros]
        ys = [float(m.get("y", 0.0)) for m in miembros]
        total = sum(pesos)
        if total <= 1e-9:
            continue  # grupo sin masa resuelta: no hay centroide que desplazar

        x_cm = sum(w * x for w, x in zip(pesos, xs)) / total
        y_cm = sum(w * y for w, y in zip(pesos, ys)) / total

        # B_perp: la dimensión de la planta PERPENDICULAR a la excitación, que es
        # sobre la que la norma mide el 5 %.
        b_perp = (max(ys) - min(ys)) if direction == "x" else (max(xs) - min(xs))
        if b_perp <= 1e-9:
            continue
        e = ecc_ratio * b_perp

        posiciones = ys if direction == "x" else xs
        p_cm = y_cm if direction == "x" else x_cm
        i_mass = sum(w * (p - p_cm) ** 2 for w, p in zip(pesos, posiciones))
        if i_mass <= 1e-9:
            continue  # todo el grupo sobre la misma línea: no hay brazo

        for nd, p in zip(miembros, posiciones):
            factor = 1.0 + sign * e * total * (p - p_cm) / i_mass
            factor = max(factor, 0.0)  # nunca masa negativa
            fuera[int(nd["id"])] = (
                float(nd.get("_effective_mass_x", 0.0) or 0.0) * factor,
                float(nd.get("_effective_mass_y", 0.0) or 0.0) * factor,
            )

    return fuera


def payload_con_cm_desplazado(data: dict, escalada: dict[int, tuple[float, float]]) -> dict:
    """Copia de `data` cuya masa nodal es la redistribuida, lista para re-correr.

    TODOS los nodos pasan su masa efectiva ya resuelta como masa MANUAL y se
    apaga el Mass Source: si no, `build_model_3d` recalcularía el automático y lo
    SUMARÍA encima (masa duplicada). Los nodos del grupo excéntrico llevan la
    versión redistribuida; el resto del edificio conserva la suya — si se dejara
    sólo el grupo tocado, el resto quedaría sin masa.
    """
    nuevos = []
    for nd in data.get("nodes", []) or []:
        nid = int(nd.get("id"))
        n2 = dict(nd)
        if nid in escalada:
            n2["mass_x"], n2["mass_y"] = escalada[nid]
        else:
            n2["mass_x"] = float(nd.get("_effective_mass_x", 0.0) or 0.0)
            n2["mass_y"] = float(nd.get("_effective_mass_y", 0.0) or 0.0)
        n2["mass_z"] = float(nd.get("_effective_mass_z", 0.0) or 0.0)
        nuevos.append(n2)

    variante = dict(data)
    variante["nodes"] = nuevos
    ms = dict(data.get("massSource") or data.get("mass_source") or {})
    ms["enabled"] = False
    ms["include_self_weight"] = False
    variante["massSource"] = ms
    variante["mass_source"] = ms
    return variante


def cuplas_nodales(data: dict, grupos: list[dict], direction: str,
                   ecc_ratio: float) -> list[dict]:
    """El par torsor accidental repartido como fuerzas nodales en el plano.

    El metodo ADITIVO de `run_accidental_torsion_rsa` cuelga ``M_z = e*F_piso``
    de un nodo MAESTRO de diafragma rigido. Un modelo semi rigido no tiene
    maestro, y hasta aca eso significaba no aplicar nada. Pero un par no necesita
    un nodo donde colgarse: se reparte como una cupla sobre los nodos del piso.

    Para un grupo con centroide de masa (x_cm, y_cm) y radios r_i:

        f_i = (M_z / D) * m_i * (-r_iy, +r_ix),   D = Sum m_i * |r_i|^2

    Fuerza neta CERO (Sum m_i*r_i = 0 por definicion de centroide) y momento neto
    EXACTAMENTE M_z. Es el mismo par, sin diafragma rigido de por medio.

    Devuelve ``[{"node_ids": [...], "e": float, "coef": {id: (cx, cy)}}]``: las
    fuerzas del piso son ``M_z * coef[i]``, y ``e = ecc_ratio * B_perp``.
    """
    if ecc_ratio <= 0 or not grupos:
        return []

    nodos = {}
    for nd in data.get("nodes", []) or []:
        try:
            nodos[int(nd["id"])] = nd
        except Exception:
            continue

    fuera = []
    for grupo in grupos:
        miembros = [nodos[i] for i in grupo.get("node_ids", []) if i in nodos]
        if not miembros:
            continue

        pesos, xs, ys = [], [], []
        for nd in miembros:
            mx = float(nd.get("_effective_mass_x", 0.0) or 0.0)
            my = float(nd.get("_effective_mass_y", 0.0) or 0.0)
            pesos.append(max(mx, my, 0.0))
            xs.append(float(nd.get("x", 0.0)))
            ys.append(float(nd.get("y", 0.0)))

        total = sum(pesos)
        if total <= 1e-9:
            continue

        x_cm = sum(w * v for w, v in zip(pesos, xs)) / total
        y_cm = sum(w * v for w, v in zip(pesos, ys)) / total

        b_perp = (max(ys) - min(ys)) if direction == "x" else (max(xs) - min(xs))
        if b_perp <= 1e-9:
            continue

        denom = sum(w * ((x - x_cm) ** 2 + (y - y_cm) ** 2)
                    for w, x, y in zip(pesos, xs, ys))
        if denom <= 1e-9:
            continue  # todo el grupo en un punto: no hay brazo para la cupla

        coef = {}
        for nd, w, x, y in zip(miembros, pesos, xs, ys):
            if w <= 0.0:
                continue
            coef[int(nd["id"])] = (-w * (y - y_cm) / denom, w * (x - x_cm) / denom)

        if coef:
            fuera.append({
                "node_ids": [int(n["id"]) for n in miembros],
                "e": ecc_ratio * b_perp,
                "coef": coef,
            })

    return fuera
