import numpy as np

def funciones_forma_placa(xi, eta, a, b):
    """
    Calcula la matriz B de curvaturas y la matriz B_v de cortantes para un
    elemento de placa rectangular de 4 nodos (12 GDL) en coordenadas naturales.
    xi, eta: Coordenadas locales de Gauss (-1 a 1)
    a, b: Semi-dimensiones del elemento (ancho total = 2a, alto total = 2b)
    """
    # Matriz de términos polinomiales para los 12 coeficientes del elemento ACM
    # Vectores de desplazamientos locales: [w1, thx1, thy1, ..., w4, thx4, thy4]
    # Relación: w = P * C^-1 * U_el
    
    # Coordenadas de los 4 nodos en el espacio local (-1, 1)
    nodos_loc = np.array([[-1,-1], [1,-1], [1,1], [-1,1]])
    C = np.zeros((12, 12))
    
    for i in range(4):
        xi_n, eta_n = nodos_loc[i]
        x_n, y_n = xi_n * a, eta_n * b
        
        # Fila para w
        C[i*3, :] = [1, x_n, y_n, x_n**2, x_n*y_n, y_n**2, x_n**3, x_n**2*y_n, x_n*y_n**2, y_n**3, x_n**3*y_n, x_n*y_n**3]
        # Fila para thx = dw/dy
        C[i*3+1, :] = [0, 0, 1, 0, x_n, 2*y_n, 0, x_n**2, 2*x_n*y_n, 3*y_n**2, x_n**3, 3*x_n*y_n**2]
        # Fila para thy = -dw/dx
        C[i*3+2, :] = [0, -1, 0, -2*x_n, -y_n, 0, -3*x_n**2, -2*x_n*y_n, -y_n**2, 0, -3*x_n**2*y_n, -y_n**3]

    C_inv = np.linalg.inv(C)
    
    # Evaluar derivadas en el punto (xi, eta) -> (x, y)
    x, y = xi * a, eta * b
    
    # Matriz de segundas derivadas para momentos (Curvaturas)
    # d2w/dx2, d2w/dy2, 2*d2w/dxdy
    P_flex = np.zeros((3, 12))
    P_flex[0, :] = [0, 0, 0, 2, 0, 0, 6*x, 2*y, 0, 0, 6*x*y, 0]          # d2w/dx2
    P_flex[1, :] = [0, 0, 0, 0, 0, 2, 0, 0, 2*x, 6*y, 0, 6*x*y]          # d2w/dy2
    P_flex[2, :] = 2 * np.array([0, 0, 0, 0, 1, 0, 0, 2*x, 2*y, 0, 3*x**2, 3*y**2]) # 2 * d2w/dxdy
    
    B_flex = P_flex @ C_inv
    
    # Matriz de terceras derivadas para fuerzas cortantes (V_x, V_y)
    P_cort = np.zeros((2, 12))
    P_cort[0, :] = [0, 0, 0, 0, 0, 0, 6, 0, 2, 0, 6*y, 0] # d3w/dx3 + d3w/dxdy2
    P_cort[1, :] = [0, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 6*x] # d3w/dy3 + d3w/dx2dy
    
    B_cort = P_cort @ C_inv
    
    return B_flex, B_cort

def calcular_matriz_elemento(ancho_total, alto_total, h, E, nu):
    """
    Calcula la matriz de rigidez analítica por cuadratura de Gauss (2x2)
    """
    a = ancho_total / 2
    b = alto_total / 2
    
    # Matriz constitutiva de la placa (D)
    D_val = (E * h**3) / (12 * (1 - nu**2))
    D = D_val * np.array([
        [1,  nu, 0],
        [nu, 1,  0],
        [0,  0,  (1-nu)/2]
    ])
    
    # Puntos y pesos de Gauss (Integración 2x2)
    gauss_pts = [-1/np.sqrt(3), 1/np.sqrt(3)]
    pesos = [1.0, 1.0]
    
    K_el = np.zeros((12, 12))
    
    for xi, w_xi in zip(gauss_pts, pesos):
        for eta, w_eta in zip(gauss_pts, pesos):
            B_flex, _ = funciones_forma_placa(xi, eta, a, b)
            # Jacobiano de la transformación rectangular simple = a * b
            detJ = a * b
            K_el += (B_flex.T @ D @ B_flex) * w_xi * w_eta * detJ
            
    return K_el

def resolver_mef_zapata(nodos, elementos, columnas, h, E, nu, q_suelo):
    """
    Ejecuta el análisis completo de Elementos Finitos para la zapata combinada.
    nodos: np.array([[x, y], ...])
    elementos: np.array([[n0, n1, n2, n3], ...]) ordenados antihorario
    columnas: lista de IDs de nodos que tienen columnas (apoyos fijos)
    """
    num_nodos = len(nodos)
    gdl_globales = num_nodos * 3
    
    K_global = np.zeros((gdl_globales, gdl_globales))
    F_global = np.zeros(gdl_globales)
    
    # 1. Ensamble de rigidez y fuerzas de presión (abajo hacia arriba)
    for el in elementos:
        n_ids = el
        coords = nodos[n_ids]
        
        # Dimensiones del rectángulo
        ancho = abs(coords[1, 0] - coords[0, 0])
        alto = abs(coords[3, 1] - coords[0, 1])
        
        K_el = calcular_matriz_elemento(ancho, alto, h, E, nu)
        
        # Carga uniforme distribuida equivalente en los nodos (Lumped Load)
        carga_nodo = (q_suelo * ancho * alto) / 4
        F_el = np.zeros(12)
        F_el[[0, 3, 6, 9]] = carga_nodo # Cargas en el GDL 'w' de cada uno de los 4 nodos
        
        # Mapeo de GDL locales a globales
        gdl_locales = []
        for nodo in n_ids:
            gdl_locales.extend([nodo*3, nodo*3+1, nodo*3+2])
            
        for i_loc, i_glob in enumerate(gdl_locales):
            F_global[i_glob] += F_el[i_loc]
            for j_loc, j_glob in enumerate(gdl_locales):
                K_global[i_glob, j_glob] += K_el[i_loc, j_loc]
                
    # 2. Aplicar condiciones de apoyo (Columnas empotradas)
    gdl_fijos = []
    for col_nodo in columnas:
        gdl_fijos.extend([col_nodo*3, col_nodo*3+1, col_nodo*3+2]) # Restringe w, thx, thy
        
    K_bc = K_global.copy()
    F_bc = F_global.copy()
    
    for gdl in gdl_fijos:
        K_bc[gdl, :] = 0
        K_bc[:, gdl] = 0
        K_bc[gdl, gdl] = 1.0
        F_bc[gdl] = 0.0
        
    # 3. Resolver desplazamientos globales
    U_global = np.linalg.solve(K_bc, F_bc)
    
    # 4. Recuperación de Esfuerzos (Momentos y Cortantes en el centro del elemento: xi=0, eta=0)
    D_val = (E * h**3) / (12 * (1 - nu**2))
    D = D_val * np.array([[1, nu, 0], [nu, 1, 0], [0, 0, (1-nu)/2]])
    
    resultados_elementos = []
    
    for idx, el in enumerate(elementos):
        n_ids = el
        coords = nodos[n_ids]
        ancho = abs(coords[1, 0] - coords[0, 0])
        alto = abs(coords[3, 1] - coords[0, 1])
        
        gdl_locales = []
        for nodo in n_ids:
            gdl_locales.extend([nodo*3, nodo*3+1, nodo*3+2])
        U_el = U_global[gdl_locales]
        
        # Evaluar en el centro matemático del elemento (0, 0)
        B_flex, B_cort = funciones_forma_placa(0.0, 0.0, ancho/2, alto/2)
        
        # Momentos flectores por unidad de ancho: [Mx, My, Mxy]
        momentos = D @ B_flex @ U_el
        
        # Fuerzas cortantes por unidad de ancho: [Vx, Vy]
        # V = D_flex * terceras derivadas del desplazamiento
        cortantes = D_val * (B_cort @ U_el)
        
        resultados_elementos.append({
            'id': idx,
            'Mx': momentos[0],
            'My': momentos[1],
            'Mxy': momentos[2],
            'Vx': cortantes[0],
            'Vy': cortantes[1]
        })
        
    return U_global, resultados_elementos

# =============================================================================
# EJEMPLO DE USO (Zapata combinada de 6.0m x 2.0m con 2 Columnas)
# =============================================================================
if __name__ == "__main__":
    # Propiedades del concreto y geometría
    E_concreto = 2.5e6  # t/m² (~f'c = 280 kg/cm²)
    nu_concreto = 0.2   # Coeficiente de Poisson
    espesor = 0.60      # 60 cm de peralte de zapata
    q_suelo_max = 15.0  # Presión uniforme del suelo hacia arriba (t/m²)
    
    # Definición de una malla simple de 3x2 elementos (Genera 12 nodos)
    # Nodos en una cuadrícula (Coordenadas X, Y)
    nodos = np.array([
        [0.0, 0.0], [2.0, 0.0], [4.0, 0.0], [6.0, 0.0], # Fila inferior (Y=0)
        [0.0, 1.0], [2.0, 1.0], [4.0, 1.0], [6.0, 1.0], # Fila media (Y=1)
        [0.0, 2.0], [2.0, 2.0], [4.0, 2.0], [6.0, 2.0]  # Fila superior (Y=2)
    ])
    
    # Elementos rectangulares (Conectividad de nodos en sentido antihorario)
    elementos = np.array([,  # Elemento 0,  # Elemento 1,  # Elemento 2,  # Elemento 3, # Elemento 4
        [6, 7, 11, 10] # Elemento 5
    ])
    
    # Ubicación de las 2 columnas de la zapata combinada (Nodos intermedios)
    nodos_columnas = [5, 6] # Columna 1 en Nodo 5, Columna 2 en Nodo 6
    
    # Resolver
    U, fuerzas = resolver_mef_zapata(nodos, elementos, nodos_columnas, espesor, E_concreto, nu_concreto, q_suelo_max)
    
    # Imprimir resultados del cálculo
    print("--- DESPLAZAMIENTOS VERTICALES EN NODOS (w) ---")
    for i in range(len(nodos)):
        print(f"Nodo {i}: {U[i*3]:.6f} metros")
        
    print("\n--- ESFUERZOS INTERNOS EN EL CENTRO DE LOS ELEMENTOS ---")
    for f in fuerzas:
        print(f"Elem {f['id']}: Mx={f['Mx']:6.2f} t*m/m | My={f['My']:6.2f} t*m/m | Vx={f['Vx']:6.2f} t/m | Vy={f['Vy']:6.2f} t/m")