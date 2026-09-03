# -*- coding: utf-8 -*-
"""Ratio D/C contra la superficie (design/column_ratio.py).

Lo que cuidan estos tests, en orden de importancia:

1. **Autoconsistencia.** Un punto que ESTÁ sobre la superficie tiene que dar
   ratio 1.000. Es la prueba que no depende de ningún dato externo y la que
   realmente dice si el corte del rayo y el refinamiento están bien.

2. **No romper lo ya validado.** En una sección doblemente simétrica el método
   nuevo tiene que dar lo MISMO que `capacity_ratio_radial`, que está validada
   contra el diálogo real de ETABS. Si esto se rompe, el cambio dejó de ser
   seguro.

3. **Que el arreglo pase.** En una L y una T el eje neutro real no apunta como
   el vector momento, y el ratio tiene que subir respecto del método viejo.
"""

import math

import pytest

from design.column_interaction import (
    _armar_seccion,
    balanced_pn,
    bars_with_area,
    beta1_from_fc,
    capacity_ratio_radial,
    compute_pn_mn_at,
    normalize_design_code,
)
from design.column_ratio import limpiar_cache, ratio_pmm

KGCM2 = 98066.5
TONF = 9806.65
FC, FY = 210 * KGCM2, 4200 * KGCM2

# Armado despejado del `rho` y el `dc` que reporta el Column Element Details de
# ETABS para las dos columnas de referencia (ver project-etabs-lt-rebar-layout):
# la T da rho 1.03 % con 20 varillas #5, y la L 1.43 % con 15 de 20 mm.
#
# OJO: la CT y la CL de acá son de OTRO modelo (con otro recubrimiento) que el
# de la referencia real de mas abajo. Sirven para los tests de forma —el eje
# neutro no apunta como el momento, la autoconsistencia— no para comparar
# numeros contra ETABS.
CT = dict(shape="tee", b=0.60, h=1.00, flange_thick=0.30, web_thick=0.30,
          n2=4, n3=6, bar_diameter=0.015875, bar_area=0.31 * 0.0254 ** 2,
          cover=0.06394 - 0.015875 / 2)
CL = dict(shape="l", b=0.70, h=0.70, flange_thick=0.30, web_thick=0.30,
          n2=4, n3=4, bar_diameter=0.020, bar_area=math.pi * 0.020 ** 2 / 4,
          cover=0.03857 - 0.010)
RECT = dict(shape="rect", b=0.45, h=0.45, flange_thick=None, web_thick=None,
            n2=4, n3=4, bar_diameter=0.0254, bar_area=math.pi * 0.0254 ** 2 / 4,
            cover=0.04)

COMUN = dict(fc=FC, fy=FY, nx=30, ny=30, confine_bar_diameter=0.0)


@pytest.fixture(autouse=True)
def _cache_limpio():
    limpiar_cache()
    yield
    limpiar_cache()


def _kw(sec, p, m2, m3, code="E060"):
    return dict(COMUN, code=code, target_p=p, target_m2=m2, target_m3=m3,
                **sec)


def _puntos_de_la_superficie(sec, code="E060", n=12):
    """Puntos de la superficie, DADOS VUELTA a convención del análisis.

    El motor acumula `M2 += -force * y`, o sea que su M2 sale invertido
    respecto de la convención de ETABS (ver el encabezado de column_ratio.py).
    `ratio_pmm` habla la convención del análisis, así que acá se niega M2 al
    entregar el punto — y eso deja la convención CLAVADA: si alguien saca el
    cambio de signo del motor, este test avisa.
    """
    bars, fibers, fdx, fdy, ag, _md = _armar_seccion(
        sec["b"], sec["h"], sec["cover"], sec["bar_diameter"], sec["n3"],
        sec["n2"], 0.0, 30, 30, shape=sec["shape"], diameter=None,
        num_bars=None, flange_thick=sec["flange_thick"],
        web_thick=sec["web_thick"])
    ba = bars_with_area(bars, sec["bar_area"])
    beta1 = beta1_from_fc(FC)
    es_e060 = normalize_design_code(code) == "E060"
    kw = dict(code=code, gross_area=ag, tied=True, fiber_dx=fdx, fiber_dy=fdy)
    radio = max(math.hypot(f[0], f[1]) for f in fibers)

    salida = []
    for k in range(n):
        theta = 2.0 * math.pi * k / n
        pb = balanced_pn(FC, FY, fibers, ba, 0.0, theta, beta1, code) if es_e060 else None
        for c in (radio * 0.25, radio * 0.6, radio * 1.3):
            pt = compute_pn_mn_at(FC, FY, fibers, ba, 0.0, theta, c, beta1,
                                  pb=pb, **kw)
            f = pt["phi"]
            salida.append((f * pt["Pn"], -f * pt["M2n"], f * pt["M3n"]))
    return salida


@pytest.mark.parametrize("nombre,sec", [("T", CT), ("L", CL), ("rect", RECT)])
def test_un_punto_de_la_superficie_da_ratio_uno(nombre, sec):
    """La prueba que no depende de ningún dato externo."""
    peor = 0.0
    for p, m2, m3 in _puntos_de_la_superficie(sec):
        if math.sqrt(p * p + m2 * m2 + m3 * m3) < 1e3:
            continue          # el polo de tracción de una simétrica es (0,0,0)
        r = ratio_pmm(**_kw(sec, p, m2, m3))
        assert r is not None, f"{nombre}: el rayo no cortó la superficie"
        peor = max(peor, abs(r["ratio"] - 1.0))
    assert peor < 0.005, f"{nombre}: peor error {peor:.4%} sobre la superficie"


@pytest.mark.parametrize("code", ["E060", "ACI318"])
@pytest.mark.parametrize("p,m2,m3", [(44.59, 0.0, 10.0),    # M3 puro
                                     (25.0, 8.0, 0.0),      # M2 puro
                                     (30.0, 7.0, 7.0)])     # la diagonal
def test_sobre_un_eje_de_simetria_da_lo_mismo_que_el_metodo_viejo(p, m2, m3, code):
    """`capacity_ratio_radial` está validada contra ETABS en rectangulares.

    Sobre un eje de simetría de la sección el ángulo del momento y el del eje
    neutro COINCIDEN, así que los dos métodos tienen que dar lo mismo. Si esto
    se rompe, el cambio dejó de ser seguro para los casos ya validados.
    """
    kw = _kw(RECT, p * TONF, m2 * TONF, m3 * TONF, code)
    viejo = capacity_ratio_radial(**kw)
    nuevo = ratio_pmm(**kw)
    assert nuevo["ratio"] == pytest.approx(viejo["ratio"], rel=2e-3), (
        f"P={p} M2={m2} M3={m3}: viejo {viejo['ratio']:.4f} "
        f"nuevo {nuevo['ratio']:.4f}"
    )


@pytest.mark.parametrize("p,m2,m3", [(60.0, -5.0, 12.0), (10.0, 3.0, -9.0)])
def test_fuera_de_los_ejes_de_simetria_difieren_poco_pero_difieren(p, m2, m3):
    """La doble simetría NO alcanza en cualquier dirección.

    Con 12 varillas discretas, el eje neutro y el vector momento coinciden solo
    sobre los ejes de simetría (0, 45, 90 grados...). A -22.6 grados ya no, y
    ahí el método nuevo se separa ~1.5 %: es una diferencia REAL y va del lado
    correcto, no ruido. Se acota para que no crezca sin que nadie se entere.
    """
    kw = _kw(RECT, p * TONF, m2 * TONF, m3 * TONF)
    viejo = capacity_ratio_radial(**kw)["ratio"]
    nuevo = ratio_pmm(**kw)["ratio"]
    dif = abs(nuevo - viejo) / viejo
    assert 1e-3 < dif < 0.04, (
        f"P={p} M2={m2} M3={m3}: viejo {viejo:.4f} nuevo {nuevo:.4f} "
        f"({dif:.2%})"
    )


@pytest.mark.parametrize("nombre,sec,p,m2,m3", [
    ("CT 100x60x30", CT, 40.3814, -6.4244, -7.7889),
    ("CL 70x70x30", CL, 16.533, 9.9258, 4.9256),
])
def test_en_l_y_t_el_eje_neutro_no_apunta_como_el_momento(nombre, sec, p, m2, m3):
    """El defecto que se arregló, medido.

    En una sección asimétrica el eje neutro que produce el momento pedido está
    lejos de la dirección del momento, así que el método viejo comparaba contra
    OTRO meridiano de la superficie y subestimaba el ratio.
    """
    kw = _kw(sec, p * TONF, m2 * TONF, m3 * TONF)
    nuevo = ratio_pmm(**kw)
    viejo = capacity_ratio_radial(**kw)

    theta_m = math.degrees(math.atan2(m2, m3)) % 360.0
    # El eje neutro es el mismo para theta y theta+180: se compara módulo 180.
    dif = abs(nuevo["thetaDeg"] - theta_m) % 180.0
    dif = min(dif, 180.0 - dif)
    # Medido con la convención de M2 ya corregida: 21 grados en la L y mas de
    # 60 en la T. El umbral marca "difieren de verdad", no un valor fino.
    assert dif > 15.0, (
        f"{nombre}: eje neutro {nuevo['thetaDeg']:.1f} vs momento {theta_m:.1f} "
        f"({dif:.1f} grados)"
    )
    assert nuevo["ratio"] > viejo["ratio"] * 1.10, (
        f"{nombre}: viejo {viejo['ratio']:.4f} nuevo {nuevo['ratio']:.4f}"
    )
    assert nuevo["refinado"], "el Newton tenía que converger"


def test_la_malla_se_cachea_por_seccion():
    """Una columna se verifica contra decenas de combos: sin caché no sirve."""
    import design.column_ratio as cr

    kw = _kw(CT, 40.0 * TONF, -6.0 * TONF, -8.0 * TONF)
    ratio_pmm(**kw)
    assert len(cr._CACHE) == 1
    ratio_pmm(**dict(kw, target_p=50.0 * TONF))
    assert len(cr._CACHE) == 1, "una demanda distinta no debería rearmar la malla"
    ratio_pmm(**_kw(CL, 16.0 * TONF, 9.0 * TONF, 5.0 * TONF))
    assert len(cr._CACHE) == 2, "otra sección sí necesita su propia malla"


# ═════════════════════════════════════════════════════════════════════════
# Referencia REAL: C2 y C3 de "01.MODULO 01 (1) columna L.e2k"
# ═════════════════════════════════════════════════════════════════════════
#
# Column Element Details de ETABS, ACI 318-14, Story1, combo 05 1.25(CM+CV)-SDY.
# Todo sale del reporte, nada asumido salvo el diametro de varilla, que se
# despeja del rho: 1.43 % con 15 varillas sobre Ag = 0.33 m2 da 20 mm.
#
#   Seccion CL 70x70x30, dc = 0.0425 m, rho 1.43 %
#   f'c = 2100 tonf/m2, fy = 42000 tonf/m2
#   phi_T 0.9, phi_CTied 0.65  ->  ACI 318, NO E.060 (mueve el ratio ~15 puntos)
#   delta_ns = delta_s = 1  ->  sin magnificacion por esbeltez
#   Los momentos MINIMOS (1.63 y 1.50) quedan muy por debajo de los de diseno,
#   asi que no gobiernan y no hace falta la variante de excentricidad minima.
#
# EL SIGNO IMPORTA Y EL REPORTE NO LO DA. El combo lleva SDY, que es un
# espectro, asi que ETABS chequea las cuatro combinaciones de signo de M2 y M3
# y se queda con la PEOR (Shear Wall Design ACI 318-14, seccion 1.3.7) — por eso
# los momentos salen positivos en la tabla. Acá se hace lo mismo. En las dos
# columnas gobierna (-M2, -M3).
#
# El residuo que queda, -0.8 % / -0.9 %, es el sesgo conocido de la poligonal de
# 11 puntos de ETABS, que corta por adentro de su propia superficie y le hace
# leer ~1 % de mas (ver project-etabs-polyline-bias). No es error nuestro.

TONF = 9806.65
REF_CL = dict(shape="l", b=0.70, h=0.70, flange_thick=0.30, web_thick=0.30,
              n2=4, n3=4, bar_diameter=0.020,
              bar_area=math.pi * 0.020 ** 2 / 4, cover=0.0425 - 0.010)
REF_COMUN = dict(fc=2100 * TONF, fy=42000 * TONF, nx=30, ny=30,
                 confine_bar_diameter=0.0, code="ACI318", tied=True)


def _peor_signo(fn, p, m2, m3):
    """Peor de las cuatro combinaciones de signo, como hace ETABS con espectro."""
    import itertools
    peor = 0.0
    for s2, s3 in itertools.product((1, -1), repeat=2):
        r = fn(target_p=p * TONF, target_m2=s2 * m2 * TONF,
               target_m3=s3 * m3 * TONF, **dict(REF_COMUN, **REF_CL))
        if r:
            peor = max(peor, r["ratio"])
    return peor


@pytest.mark.parametrize("col,p,m2,m3,etabs", [
    ("C2", 44.9301, 9.0605, 5.4078, 0.301),
    ("C3", 41.2864, 8.8138, 5.3639, 0.292),
])
def test_calza_con_el_capacity_ratio_real_de_etabs(col, p, m2, m3, etabs):
    nuestro = _peor_signo(ratio_pmm, p, m2, m3)
    dif = (nuestro - etabs) / etabs
    assert abs(dif) < 0.02, f"{col}: nuestro {nuestro:.4f} ETABS {etabs:.3f} ({dif:+.1%})"
    # Del lado conservador respecto de ETABS solo por su poligonal de 11 puntos:
    # si algun dia sale POR ENCIMA, cambio algo de fondo y hay que mirarlo.
    assert dif < 0.0, f"{col}: deberiamos quedar ~1 % abajo, no arriba ({dif:+.1%})"


@pytest.mark.parametrize("col,p,m2,m3,etabs", [
    ("C2", 44.9301, 9.0605, 5.4078, 0.301),
    ("C3", 41.2864, 8.8138, 5.3639, 0.292),
])
def test_el_metodo_viejo_se_quedaba_corto_en_estas_mismas(col, p, m2, m3, etabs):
    """Deja medida la brecha que se cerro, para que no vuelva sin avisar."""
    viejo = _peor_signo(capacity_ratio_radial, p, m2, m3)
    dif = (viejo - etabs) / etabs
    assert dif < -0.04, f"{col}: el metodo viejo daba {viejo:.4f} ({dif:+.1%})"
