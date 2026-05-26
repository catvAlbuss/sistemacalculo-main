function rigidez_armaduras_3d(Entrada_Coordenadas, Entrada_Conexion, Entrada_Cargas_Puntuales, Entrada_Restriguidos, Entrada_Propiedades)
  
  % ========== 1. INICIALIZACIÓN ==========
  resultados = struct();
  Amplificador = 1;
  Graficar_Deformacion = 1;
  
  % ========== 2. PROCESAMIENTO DE DATOS DE ENTRADA ==========
  Total_Elementos = length(Entrada_Conexion(:,1));
  Total_Nudos = length(Entrada_Coordenadas(:,1));
  
  % Procesar cargas puntuales
  aux = Entrada_Cargas_Puntuales;
  Entrada_Cargas_Puntuales = [(1:Total_Nudos*3)' zeros(Total_Nudos*3,1)];
  Entrada_Cargas_Puntuales(aux(:,1)*3-2,2) = aux(:,2);
  Entrada_Cargas_Puntuales(aux(:,1)*3-1,2) = aux(:,3);
  Entrada_Cargas_Puntuales(aux(:,1)*3,2) = aux(:,4);
  
  % Procesar restricciones
  aux = Entrada_Restriguidos;
  Entrada_Restriguidos = [(1:Total_Nudos)' zeros(Total_Nudos,3)];
  Entrada_Restriguidos(aux(:,1),2) = aux(:,2);
  Entrada_Restriguidos(aux(:,1),3) = aux(:,3);
  Entrada_Restriguidos(aux(:,1),4) = aux(:,4);
  
  % ========== 3. VECTOR DE RESTRICCIONES ==========
  k = 1;
  Vector_Restringidos = [];
  for i = 1:Total_Nudos
    if Entrada_Restriguidos(i,2) == 1
      Vector_Restringidos(k) = 3*i - 2;
      k = k + 1;
    end
    if Entrada_Restriguidos(i,3) == 1
      Vector_Restringidos(k) = 3*i - 1;
      k = k + 1;
    end
    if Entrada_Restriguidos(i,4) == 1
      Vector_Restringidos(k) = 3*i;
      k = k + 1;
    end
  end
  
  Vector_Libres = [1:Total_Nudos*3]';
  Vector_Libres(Vector_Restringidos) = [];
  
  % ========== 4. CÁLCULO DE GEOMETRÍA Y MATRICES LOCALES ==========
  for i = 1:Total_Elementos
    Ni = Entrada_Conexion(i,2);
    Nf = Entrada_Conexion(i,3);
    xi = Entrada_Coordenadas(Ni,2);
    yi = Entrada_Coordenadas(Ni,3);
    zi = Entrada_Coordenadas(Ni,4);
    xf = Entrada_Coordenadas(Nf,2);
    yf = Entrada_Coordenadas(Nf,3);
    zf = Entrada_Coordenadas(Nf,4);
    
    Longitud(i) = sqrt((xf-xi)^2 + (yf-yi)^2 + (zf-zi)^2);
    calfa(i) = (xf-xi) / Longitud(i);
    cbeta(i) = (yf-yi) / Longitud(i);
    cganma(i) = (zf-zi) / Longitud(i);
    
    GDL_elemento(i,:) = [Ni*3-2 Ni*3-1 Ni*3 Nf*3-2 Nf*3-1 Nf*3];
  end
  
  % ========== 5. MATRIZ DE RIGIDEZ GLOBAL ==========
  K_Global = zeros(Total_Nudos*3, Total_Nudos*3);
  
  for i = 1:Total_Elementos
    % Propiedades del elemento
    E = Entrada_Propiedades(i, 2);
    A = Entrada_Propiedades(i, 1);
    L = Longitud(i);
    
    % Matriz de rigidez local (solo axial)
    K_Local = E*A/L * [1 -1; -1 1];
    
    % Matriz de transformación (cosenos directores)
    ca = calfa(i);
    cb = cbeta(i);
    cg = cganma(i);
    
    B = [ca cb cg 0 0 0;
         0 0 0 ca cb cg];
    
    % Matriz de rigidez local en coordenadas globales
    K_Local_Global = B' * K_Local * B;
    
    % Ensamblaje
    GDL = GDL_elemento(i,:);
    K_Global(GDL, GDL) = K_Global(GDL, GDL) + K_Local_Global;
  end
  
  % ========== 6. VECTOR DE FUERZAS GLOBALES ==========
  Fuerzas_Globales = Entrada_Cargas_Puntuales(:,2);
  
  % ========== 7. REDUCCIÓN DEL SISTEMA (APLICAR RESTRICCIONES) ==========
  K_Global_Reducido = K_Global;
  K_Global_Reducido(Vector_Restringidos, :) = [];
  K_Global_Reducido(:, Vector_Restringidos) = [];
  
  Fuerzas_Globales_Reducidas = Fuerzas_Globales;
  Fuerzas_Globales_Reducidas(Vector_Restringidos) = [];
  
  % ========== 8. SOLUCIÓN DEL SISTEMA ==========
  D_Global_Reducido = K_Global_Reducido \ Fuerzas_Globales_Reducidas;
  
  % ========== 9. RECUPERAR DESPLAZAMIENTOS COMPLETOS ==========
  D_Global = zeros(Total_Nudos*3, 1);
  D_Global(Vector_Libres) = D_Global_Reducido;
  
  % ========== 10. CÁLCULO DE REACCIONES ==========
  Reacciones = K_Global * D_Global - Fuerzas_Globales;
  
  % ========== 11. CÁLCULO DE FUERZAS INTERNAS ==========
  for i = 1:Total_Elementos
    D = D_Global(GDL_elemento(i,:));
    
    % Vector de deformación en coordenadas locales
    ca = calfa(i);
    cb = cbeta(i);
    cg = cganma(i);
    B = [ca cb cg 0 0 0;
         0 0 0 ca cb cg];
    
    % Deformación axial
    epsilon = B * D;
    
    % Fuerza axial (P = E*A*ε)
    E = Entrada_Propiedades(i, 2);
    A = Entrada_Propiedades(i, 1);
    Fuerzas_Internas(i) = E * A * epsilon(2); % epsilon(2) es la deformación en el nodo J
  end
  
  % ========== 12. MATRIZ DE DESPLAZAMIENTOS POR NODO ==========
  for i = 1:Total_Nudos
    MatrizDesplazamiento(i,:) = [D_Global(3*i-2) D_Global(3*i-1) D_Global(3*i)];
  end
  
  % ========== 13. EXPORTAR RESULTADOS A JSON ==========
  resultados_export = struct();
  
  % Desplazamientos por nodo (3D)
  for i = 1:Total_Nudos
    x = Entrada_Coordenadas(i,2);
    y = Entrada_Coordenadas(i,3);
    z = Entrada_Coordenadas(i,4);
    dx = D_Global(3*i-2);
    dy = D_Global(3*i-1);
    dz = D_Global(3*i);
    
    resultados_export.displacements.(sprintf('node_%d', i)) = struct(...
      'id', i, ...
      'x_original', x, ...
      'y_original', y, ...
      'z_original', z, ...
      'dx', dx, ...
      'dy', dy, ...
      'dz', dz, ...
      'x_final', x + dx * Amplificador, ...
      'y_final', y + dy * Amplificador, ...
      'z_final', z + dz * Amplificador ...
    );
  end
  
  % Fuerzas por elemento (3D)
  for i = 1:Total_Elementos
    Ni = Entrada_Conexion(i,2);
    Nf = Entrada_Conexion(i,3);
    xi = Entrada_Coordenadas(Ni,2);
    yi = Entrada_Coordenadas(Ni,3);
    zi = Entrada_Coordenadas(Ni,4);
    xf = Entrada_Coordenadas(Nf,2);
    yf = Entrada_Coordenadas(Nf,3);
    zf = Entrada_Coordenadas(Nf,4);
    
    resultados_export.forces.(sprintf('element_%d', i)) = struct(...
      'id', i, ...
      'node_i', Ni, ...
      'node_j', Nf, ...
      'axial_force', Fuerzas_Internas(i), ...
      'length', Longitud(i), ...
      'x1', xi, 'y1', yi, 'z1', zi, ...
      'x2', xf, 'y2', yf, 'z2', zf ...
    );
  end
  
  % Reacciones en apoyos
  for i = 1:Total_Nudos
    if any(Entrada_Restriguidos(i,2:4) == 1)
      resultados_export.reactions.(sprintf('node_%d', i)) = struct(...
        'id', i, ...
        'fx', Reacciones(3*i-2), ...
        'fy', Reacciones(3*i-1), ...
        'fz', Reacciones(3*i) ...
      );
    end
  end
  
  % Matriz de rigidez reducida (opcional)
  resultados_export.matrix = struct(...
    'K_global_reduced', K_Global_Reducido, ...
    'forces_reduced', Fuerzas_Globales_Reducidas, ...
    'displacements_reduced', D_Global_Reducido ...
  );
  
  % Matriz de desplazamientos (formato tabla)
  resultados_export.displacement_matrix = MatrizDesplazamiento;
  
  % ========== 14. GUARDAR ARCHIVOS ==========
  
  % Guardar en JSON
  json_str = jsonencode(resultados_export);
  fid = fopen('resultados_3d.json', 'w');
  fprintf(fid, '%s', json_str);
  fclose(fid);
  
  % Guardar en formato MATLAB (compatibilidad)
  save('-mat7-binary', 'resultados_3d.mat', ...
    'K_Global_Reducido', 'Fuerzas_Globales_Reducidas', ...
    'D_Global_Reducido', 'Reacciones', 'MatrizDesplazamiento', ...
    'Fuerzas_Internas', 'Longitud', 'resultados_export');
  
  % ========== 15. MOSTRAR RESUMEN ==========
  fprintf('\n========================================\n');
  fprintf('✅ RESULTADOS 3D GUARDADOS\n');
  fprintf('========================================\n');
  fprintf('📊 Estadísticas:\n');
  fprintf('   - Nodos: %d\n', Total_Nudos);
  fprintf('   - Elementos: %d\n', Total_Elementos);
  fprintf('   - Grados de libertad: %d\n', Total_Nudos*3);
  fprintf('   - GDL restringidos: %d\n', length(Vector_Restringidos));
  fprintf('   - GDL libres: %d\n', length(Vector_Libres));
  fprintf('\n📁 Archivos generados:\n');
  fprintf('   - resultados_3d.json (para web)\n');
  fprintf('   - resultados_3d.mat (para MATLAB)\n');
  fprintf('========================================\n');
  
endfunction