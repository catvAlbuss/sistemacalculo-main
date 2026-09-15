function zapatas2(poligonos, column, PD, PL, SISMO, CoValue, Df, pesoEspecifico)
  ZZ = [];
  resultados = struct();
  todosLosNombres = fieldnames(poligonos);

  % AGREGADO (ver conversacion, "zapatas recortadas"): agrupa 'poligonoN'
  % (contorno exterior) con sus 'poligonoN_huecoM' (huecos de esa MISMA
  % zapata) -- igual criterio que el lado PHP (calcularZapatas2EnPhp). Sin
  % ningun campo '_hueco', el comportamiento es identico a antes.
  poligonoN = {};
  for idx = 1:length(todosLosNombres);
    nombre = todosLosNombres{idx};
    if isempty(strfind(nombre, "_hueco"))
      poligonoN{end+1} = nombre;
    end
  end

  for poliN = 1:length(poligonoN);
    poligonoNombre = poligonoN{poliN};
    vertices = poligonos.(poligonoNombre);

    huecosNombres = {};
    for idx = 1:length(todosLosNombres);
      nombre = todosLosNombres{idx};
      if strncmp(nombre, [poligonoNombre "_hueco"], length([poligonoNombre "_hueco"]))
        huecosNombres{end+1} = nombre;
      end
    end

    %%%%% Codigo para capturar a los puntos dentro el poligono dibujado
    in=inpolygon(column(:,2),column(:,3),vertices(:,1),vertices(:,2)); % Captura de puntos
    UNIR=column(in)';  % Vector de puntos (nomenclatura) dentro del poligono
    %%%% Codigo para sacar las column geometricas del poligono
    %%%% Codigo para sacar el centro de gravedad y area del poligono
    [A0, XCcruda, YCcruda] = raw_totals(vertices);
    for h = 1:length(huecosNombres);
      [ha0, hxc, hyc] = raw_totals(poligonos.(huecosNombres{h}));
      A0 = A0 - ha0; XCcruda = XCcruda - hxc; YCcruda = YCcruda - hyc;
    end
    A0s = A0/2;           % area CON signo (ya neta: exterior menos huecos)
    A  = abs(A0s);        % AREA
    XC = XCcruda/(6*A0s); % CG EN X (con signo real; abs() aqui rompe el centrado si CG < 0)
    YC = YCcruda/(6*A0s); % CG EN Y
    %% Codigo para mover el centro del plano al centro de gravedad
    hj = ones(length(vertices),1); % vector de unos de la cantidad de coordenadas
    p2 = [hj*XC hj*YC];            % matriz repetida de centros de gravedad para mover el plano cartesiano
    PUNTOS3=vertices-p2;           % COORDENADAS DEL POLIGONO MOVIDO AL ORIGEN

    % AGREGADO (ver conversacion, "zapatas recortadas"): recentra tambien
    % cada hueco al MISMO CG de la zapata neta -- se reutiliza tanto para
    % restar su inercia como para excluir sus puntos de la nube (abajo).
    huecosRecentrados = {};
    for h = 1:length(huecosNombres);
      hv = poligonos.(huecosNombres{h});
      hj2 = ones(length(hv),1);
      huecosRecentrados{h} = hv - [hj2*XC hj2*YC];
    end

    %%CODIGO PARA SACAR TODAS LAS PROP GEO CON CENTRO EL CG (neta: exterior menos huecos)
    [P0, A0, IX0, IY0, IXY0, MX0, MY0, XC1, YC1] = contour_accum(PUNTOS3);
    for h = 1:length(huecosRecentrados);
      [P0h, A0h, IX0h, IY0h, IXY0h, MX0h, MY0h, XC1h, YC1h] = contour_accum(huecosRecentrados{h});
      P0 = P0 + P0h; % perimetro informativo (exterior + huecos); no interviene en el calculo de presiones
      A0 = A0 - A0h; IX0 = IX0 - IX0h; IY0 = IY0 - IY0h; IXY0 = IXY0 - IXY0h;
      MX0 = MX0 - MX0h; MY0 = MY0 - MY0h; XC1 = XC1 - XC1h; YC1 = YC1 - YC1h;
    end
    PER = abs(P0);        %PERIMETRO
    A   = abs(A0/2);      %AREA
    IX  = abs(IX0/12);    %INERCIA EN X
    IY  = abs(IY0/12);    %INERCIA EN Y
    XC1 = abs(XC1/(6*A)); %CG EN X
    YC1 = abs(YC1/(6*A)); %CG EN Y
    MX  = abs(MX0/6);
    MY  = abs(MY0/6);
    % CORREGIDO (ver conversacion, "bug Ixy faltante en Octave"): a
    % diferencia de IX/IY (siempre >=0 fisicamente, abs() es correcto), IXY
    % SI puede ser negativo de verdad segun en que cuadrantes esta repartido
    % el material -- abs() lo arruinaba. contour_accum() ya normalizo el
    % signo segun el sentido de giro (mismo criterio que 'windingSign' del
    % lado PHP), asi que aqui solo falta dividir, sin abs().
    IXY = IXY0/24;
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %BUSCADOR DE FUERZAS
    FBA=0;
    for i=UNIR;                 %ESCRIBIR LOS PUNTPS A SUMAR
      FFA=i;                    %PUNTO A BUSCAR
      K1=find(PD==FFA);         %BUSCA EL PUNTO EN LA MATRIZ
      K2=find(PL==FFA);         %BUSCA EL PUNTO EN LA MATRIZ
      K3=find(SISMO==FFA);      %BUSCA EL PUNTO EN LA MATRIZ
      PD1=PD(K1,:);             %SALECCIONA LA FILA BUSCADA
      PL1=PL(K2,:);             %SALECCIONA LA FILA BUSCADA (K2, no K1 -- mismo problema que SISMO1 abajo)
      SISMO1=SISMO(K3,:);       %SALECCIONA LA FILA BUSCADA (K3, no K2 -- cada fila usaba el indice de la fila ANTERIOR en vez del propio; hoy da lo mismo porque PD/PL/SISMO siempre llegan en el mismo orden desde zapatas2Core.js, pero usar el indice correcto no depende de ese supuesto)
      %% EXCENTRICIDAD COLUMNA-CENTROIDE: si esta columna no cae exactamente
      %% en el centroide (XC,YC) de la zapata, su carga axial P genera un
      %% momento adicional P*(x-XC) / P*(y-YC) que el analisis estructural
      %% de la columna NO reporta (ese momento no existe en la columna,
      %% existe por la excentricidad geometrica de aplicar P fuera del
      %% centroide de la zapata -- misma logica que mover una fuerza a un
      %% punto de referencia distinto en estatica). Sin esto, una zapata NO
      %% centrada calculaba una presion incorrecta (uniforme/optimista) sin
      %% avisar. Se suma con signo (x-XC) puede ser negativo) y da
      %% exactamente 0 cuando la zapata SI esta centrada -- no cambia
      %% ningun resultado ya validado con zapatas centradas.
      Kxy = find(column(:,1)==FFA);
      exi = column(Kxy,2) - XC;
      eyi = column(Kxy,3) - YC;
      PD1(3)    = PD1(3)    + PD1(2)*exi;    PD1(4)    = PD1(4)    + PD1(2)*eyi;
      PL1(3)    = PL1(3)    + PL1(2)*exi;    PL1(4)    = PL1(4)    + PL1(2)*eyi;
      SISMO1(3) = SISMO1(3) + SISMO1(2)*exi; SISMO1(4) = SISMO1(4) + SISMO1(2)*eyi;
      FBA=[PD1;PL1;SISMO1]+FBA; %MATRIZ ARMADA CON FILAS BUSCADAS SUMADA A LOS DEMAS PUNTOS
    end
    %CARGAS sismicas
    ps  = FBA(3,2);
    mxs = FBA(3,3);
    mys = FBA(3,4);
    %cargas muertas
    pm  = FBA(1,2);
    mxm = FBA(1,3);
    mym = FBA(1,4);
    %cargas vivas
    pv  = FBA(2,2);
    mxv = FBA(2,3);
    myv = FBA(2,4);
    %PROPIEDADES
    A   = A;
    Ixx = IX;
    Iyy = IY;
    %VERTICES DEL POLIGONO
    xv = PUNTOS3(:,1); %puntos del poligono
    yv = PUNTOS3(:,2); %puntos del poligono
    %IDENTIFICAR LOS PUNTOS QUE CAEN DENTRO DEL POLIGONO PARA ESO se coloca el
    %minimo valor de un vertice y el maximo valor de un vertice y se genera un
    %rango cuadrado
    minx = min(xv);
    maxx = max(xv);
    miny = min(yv);
    maxy = max(yv);

    total_points = 320; % Total number of points you want across both x and y
    % Calculate the lengths of the x and y ranges
    range_x = maxx - minx;
    range_y = maxy - miny;

    % Calculate the aspect ratio (ratio of range_x to range_y)
    aspect_ratio = range_x / range_y;

    % Calculate the number of points for x and y based on aspect ratio
    num_points_x = round(total_points * (range_x / (range_x + range_y)));
    num_points_y = total_points - num_points_x;

    % Generate the points
    x = linspace(minx, maxx, num_points_x);
    y = linspace(miny, maxy, num_points_y);

    [X,Y] = meshgrid(x,y); %CREAR INTERPOLACIONES
    xq = X;
    yq = Y;
    in = inpolygon(xq,yq,xv,yv);
    % AGREGADO (ver conversacion, "zapatas recortadas"): descarta los
    % puntos de la nube que caigan dentro de CUALQUIER hueco de esta
    % zapata -- mismo criterio que pointInAnyPolygon() en PHP.
    for h = 1:length(huecosRecentrados);
      hv = huecosRecentrados{h};
      in = in & !inpolygon(xq,yq,hv(:,1),hv(:,2));
    end
    XL = xq(in);
    YL = yq(in);
    %%%%%calculo de esfuerzos
    Co = eval(CoValue);
    % CORREGIDO (ver conversacion, "bug Ixy faltante en Octave"): se pasa
    % IXY (antes se ignoraba por completo) para usar la formula con
    % acoplamiento -- misma correccion que ya tenia el lado PHP de /zapatas2.
    k = ecuacion_de_flexion(Co, A, XL, YL, Ixx, Iyy, Df, pesoEspecifico, 1, size(Co)(1), IXY);
    poligonoi = ["poligono" num2str(poliN)];
    minz = min(k);
    maxz = max(k);
    resultados.(poligonoi) = struct("XX", XL+XC, "YY", YL+YC, "ZZ", k', "min", minz, "max", maxz, "XC", XC, "YC", YC);
  endfor
  save("-mat7-binary", "-", "resultados");
endfunction

% AGREGADO (ver conversacion, "zapatas recortadas"): raw_totals() calcula
% los acumuladores CRUDOS de la formula shoelace (area*2, momentos de 1er
% orden) para UN contorno, normalizados a sentido antihorario (a0>0) --
% igual criterio que polygonRawTotals() en OctavePlotController.php, para
% poder restar huecos con el signo correcto sin importar en que sentido
% se dibujaron. Funcion local: solo visible dentro de zapatas2.m.
function [a0, xc, yc] = raw_totals(vertices)
  jj = length(vertices);
  a0 = 0; xc = 0; yc = 0;
  for i = 1:1:jj-1;
      x1 = vertices(i,1); x2 = vertices(i+1,1);
      y1 = vertices(i,2); y2 = vertices(i+1,2);
      cr = x1*y2 - x2*y1;
      a0 = a0 + cr;
      xc = xc + cr*(x2+x1);
      yc = yc + cr*(y2+y1);
  end
  if a0 < 0
    a0 = -a0; xc = -xc; yc = -yc;
  end
endfunction

% AGREGADO (ver conversacion, "zapatas recortadas"): version extendida de
% raw_totals() que ademas acumula perimetro, momentos estaticos e
% inercias (P0,MX0,MY0,IX0,IY0,IXY0) para UN contorno ya recentrado en el
% CG de la zapata neta -- normalizada al mismo criterio (a0>0) para poder
% restar huecos con signo correcto, igual que polygonRawTotals() en PHP.
% Funcion local: solo visible dentro de zapatas2.m.
function [p0, a0, ix0, iy0, ixy0, mx0, my0, xc1, yc1] = contour_accum(vertices)
  jjc = length(vertices);
  p0=0; a0=0; ix0=0; iy0=0; ixy0=0; mx0=0; my0=0; xc1=0; yc1=0;
  for i = 1:1:jjc-1;
      x1=vertices(i,1); x2=vertices(i+1,1);
      y1=vertices(i,2); y2=vertices(i+1,2);
      cr = x1*y2 - x2*y1;
      xc1  = xc1 + cr*(x2+x1);
      yc1  = yc1 + cr*(y2+y1);
      a0   = a0 + cr;
      p0   = p0 + ((x1-x2)^2+(y1-y2)^2)^0.5;
      mx0  = mx0 + (x1-x2)*(y2^2+y2*y1+y1^2);
      my0  = my0 + (y1-y2)*(x2^2+x2*x1+x1^2);
      iy0  = iy0 + cr*(x2^2+x2*x1+x1^2);
      ix0  = ix0 + cr*(y2^2+y2*y1+y1^2);
      ixy0 = ixy0 + cr*(2*x2*y2+x2*y1+x1*y2+2*x1*y1);
  end
  % p0 (perimetro, suma de sqrt) ya es siempre positivo -- no se voltea.
  if a0 < 0
    a0=-a0; ix0=-ix0; iy0=-iy0; ixy0=-ixy0; mx0=-mx0; my0=-my0; xc1=-xc1; yc1=-yc1;
  end
endfunction
