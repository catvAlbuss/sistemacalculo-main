import openseespy.opensees as ops
import opsvis as opsv
import matplotlib.pyplot as plt
import numpy as np
import warnings
# import pandas as pd          # (aun no se usa; pandas no esta instalado en el venv)
# from functions import *      # (no existe functions.py todavia)

warnings.filterwarnings("ignore")

m = 1
kg = 1
s = 1

cm = 0.01*m
kgf = 9.80665*kg*m/s**2
tonf = 1000*kgf

g = 9.80665*m/s**2

ops.wipe()
ops.model('basic', '-ndm', 3, '-ndf', 6)

# ---------------------------------------------------------------------------
# GEOMETRIA DEL PORTICO (3 pisos, altura de entrepiso = 3 m)
# ---------------------------------------------------------------------------
# Ejes en planta (coordenadas en metros)
#   X:  A=0   B=4   C=11   D=12   E=13
#   Y:  1=0   2=4   3=8    4=12
# Z:  niveles 0 (base), 3, 6, 9 m

nivel_z = [0.0, 3.0, 6.0, 9.0]   # base + 3 pisos

# Posicion en planta de cada columna -> (id, x, y)
# id usado como sufijo del tag: tag = nivel*100 + id  (nivel 0 = base)
columnas = {
    1:  (0.0,  4.0),   # A2
    2:  (0.0,  8.0),   # A3
    3:  (0.0,  12.0),  # A4
    4:  (4.0,  0.0),   # B1
    5:  (4.0,  4.0),   # B2
    6:  (4.0,  8.0),   # B3
    7:  (4.0,  12.0),  # B4
    8:  (11.0, 0.0),   # C1
    9:  (11.0, 4.0),   # C2
    10: (11.0, 8.0),   # C3
    11: (12.0, 4.0),   # D2
    12: (13.0, 0.0),   # E1
}

# ---------------------------------------------------------------------------
# DEFINICION DE NODOS
# ---------------------------------------------------------------------------
# Tag de nodo = nivel*100 + id_columna
#   base:    1..12     (nivel 0, z=0)
#   piso 1:  101..112  (z=3)
#   piso 2:  201..212  (z=6)
#   piso 3:  301..312  (z=9)
for nivel, z in enumerate(nivel_z):
    for col_id, (x, y) in columnas.items():
        node_tag = nivel*100 + col_id
        ops.node(node_tag, x, y, z)
        
# ---------------------------------------------------------------------------
# RESTRICCIONES: base empotrada (todos los nodos en z = 0), 6 GDL fijos
# ---------------------------------------------------------------------------
ops.fixZ(0.0, 1, 1, 1, 1, 1, 1)

# ---------------------------------------------------------------------------
# MATERIAL (concreto f'c = 280 kgf/cm2)
# ---------------------------------------------------------------------------
fc = 280*kgf/cm**2
E = 150*fc**0.5*kgf/cm**2                       # formula del video (NOTA: da ~77 GPa, ver abajo)
G = 0.5*E/(1+0.2)                               # modulo de corte (nu = 0.2)

# --- Viga 30 x 60 ---
b, h = 30*cm, 60*cm
Av  = b*h
Izv = b*h**3/12      # tal como el video define los nombres...
Iyv = b**3*h/12      # ...y pasa Iyv como Iy en el element (eje debil en el plano del portico)
aa, bb = max(b, h), min(b, h)
beta = 1/3 - 0.21*(bb/aa)*(1 - (bb/aa)**4/12)
Jxxv = beta*aa*bb**3

# --- Columna 45 x 45 ---
a = 45*cm
Ac  = a*a
Izc = a**4/12
Iyc = a**4/12
aa, bb = a, a
beta = 1/3 - 0.21*(bb/aa)*(1 - (bb/aa)**4/12)
Jxxc = beta*aa*bb**3

# p = 2400*kg/m**3   # densidad del concreto (sin uso: la masa de los
#                    # elementos se omite; toda la masa proviene de las losas)

# ---------------------------------------------------------------------------
# TRANSFORMACIONES GEOMETRICAS
# ---------------------------------------------------------------------------
ops.geomTransf("PDelta", 1, *[1, 0, 0])        # columnas (verticales)
ops.geomTransf("Linear", 2, *[0, 0, 1])        # vigas (horizontales)

# ---------------------------------------------------------------------------
# ELEMENTOS
# ---------------------------------------------------------------------------
ele_tag = 1

# --- Columnas: unen cada nodo con el de arriba (mismo id de columna) ---
for nivel in range(len(nivel_z) - 1):          # 0->1, 1->2, 2->3
    for col_id in columnas:
        ni = nivel*100 + col_id                # nodo inferior
        nj = (nivel + 1)*100 + col_id          # nodo superior
        ops.element('elasticBeamColumn', ele_tag, ni, nj,
                    Ac, E, G, Jxxc, Iyc, Izc, 1)
        ele_tag += 1

# --- Vigas: conectividad en planta (pares de id de columna) ---
# Direccion X (a lo largo de los ejes 1..4)
vigas_x = [(3, 7), (2, 6), (6, 10), (1, 5), (5, 9), (9, 11), (4, 8), (8, 12)]
# Direccion Y (a lo largo de los ejes A..E)
vigas_y = [(1, 2), (2, 3), (4, 5), (5, 6), (6, 7), (8, 9), (9, 10)]
# Borde diagonal derecho: C3(10) - D2(11) - E1(12)
vigas_diag = [(10, 11), (11, 12)]
vigas = vigas_x + vigas_y + vigas_diag

for nivel in range(1, len(nivel_z)):           # solo pisos 1, 2, 3 (no la base)
    for ci, cj in vigas:
        ni = nivel*100 + ci
        nj = nivel*100 + cj
        ops.element('elasticBeamColumn', ele_tag, ni, nj,
                    Av, E, G, Jxxv, Iyv, Izv, 2)
        ele_tag += 1

# ---------------------------------------------------------------------------
# LOSAS Y MASAS DE PISO
# ---------------------------------------------------------------------------
# Coordenadas (x, y) de cada columna, indexadas 0..11  (indice = col_id - 1)
nodos = np.array([columnas[i + 1] for i in range(12)], dtype="f8")

def xyz2area(xy):
    """Area de un poligono plano horizontal (formula de Gauss / shoelace).
    Ordena los vertices por angulo respecto al centroide, de modo que el
    resultado no depende del orden en que se listen los nodos."""
    p = np.asarray(xy, dtype="f8")[:, :2]
    c = p.mean(axis=0)
    p = p[np.argsort(np.arctan2(p[:, 1] - c[1], p[:, 0] - c[0]))]
    x, y = p[:, 0], p[:, 1]
    return 0.5*abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))

# Paneles de losa, por id de columna en base 0 (col_id - 1).
#   grilla:        A(0)   B(4)   C(11)  D(12)  E(13)
#            y=12: A4(2)  B4(6)
#            y=8 : A3(1)  B3(5)  C3(9)
#            y=4 : A2(0)  B2(4)  C2(8)  D2(10)
#            y=0 :        B1(3)  C1(7)         E1(11)
losas = [
    [0, 4, 5, 1],     # A-B,  y 4..8
    [1, 5, 6, 2],     # A-B,  y 8..12
    [4, 8, 9, 5],     # B-C,  y 4..8
    [3, 7, 8, 4],     # B-C,  y 0..4
    [7, 11, 10, 8],   # C1-E1-D2-C2  (panel derecho)
    [8, 10, 9],       # C2-D2-C3     (triangulo derecho)
]

areas = np.zeros(12, "f8")            # area tributaria acumulada por columna
for losa in losas:
    a_trib = xyz2area(nodos[losa]) / len(losa)
    areas[losa] += a_trib

# Cargas definidas como masa por area (kg/m2)
wLosa = 300*kg/m**2
wAcab = 100*kg/m**2
wTabi = 150*kg/m**2
wLive = 250*kg/m**2
wTotal = 1.0*(wLosa + wAcab + wTabi) + 0.25*wLive   # masa sismica (100% CM + 25% CV)

m_nodos = areas*wTotal                # masa traslacional por columna (kg)

# Asignacion de masa a los nodos de cada piso (tags 100-based del modelo)
#   ops.mass(tag, mx, my, mz, mIx, mIy, mIz)  -> ndf = 6
for i in range(12):
    mi = m_nodos[i]
    for piso in (1, 2, 3):
        ops.mass(piso*100 + (i + 1), mi, mi, 0.0, 0.0, 0.0, 0.0)

# ---------------------------------------------------------------------------
# ANALISIS MODAL
# ---------------------------------------------------------------------------
Nmodes = 9
vals = np.array(ops.eigen(Nmodes))
Tmodes = 2*np.pi/np.sqrt(vals)

for i in range(Nmodes):
    print("T[%i]: %.4f seg" % (i + 1, Tmodes[i]))

# ---------------------------------------------------------------------------
# VISUALIZACION DEL MODELO COMPLETO
# ---------------------------------------------------------------------------
opsv.plot_model(fig_wi_he=(30, 25), az_el=(-50, 40), fig_lbrt=(0, 0, 1, 1), axis_off=1, local_axes=False)
plt.show()