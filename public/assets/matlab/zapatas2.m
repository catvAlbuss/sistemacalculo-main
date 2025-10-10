function zapatas2(poligonos, column, PD, PL, SISMO, CoValue, Df, pesoEspecifico)
  ZZ = [];
  resultados = struct();
  poligonoN = fieldnames(poligonos);
  for poliN = 1:length(poligonoN);
    poligonoNombre = poligonoN{poliN};
    vertices = poligonos.(poligonoNombre);
    %%%%% Codigo para capturar a los puntos dentro el poligono dibujado
    in=inpolygon(column(:,2),column(:,3),vertices(:,1),vertices(:,2)); % Captura de puntos
    UNIR=column(in)';  % Vector de puntos (nomenclatura) dentro del poligono
    %%%% Codigo para sacar las column geometricas del poligono
    %%%% Codigo para sacar el centro de gravedad y area del poligono
    jj = length(vertices); % cantidad de coordenadas del poligono
    P0  =0;
    A0  =0;
    XC  =0;
    YC  =0;
    for i =1:1:jj-1; % formula para calcular las column
        x1=vertices(i,1);
        x2=vertices(i+1,1);
        y1=vertices(i,2);
        y2=vertices(i+1,2);
        XC =(x1*y2-x2*y1)*(x2+x1)+XC; % centro de gravedad x
        YC =(x1*y2-x2*y1)*(y2+y1)+YC; % centro de gravedad y
        A0 =(x1*y2-x2*y1)+A0;         % area
    end
    A  = abs(A0/2);      % AREA
    XC = abs(XC/(6*A));  % CG EN X
    YC = abs(YC/(6*A));  % CG EN Y
    %% Codigo para mover el centro del plano al centro de gravedad
    hj = ones(length(vertices),1); % vector de unos de la cantidad de coordenadas
    p2 = [hj*XC hj*YC];            % matriz repetida de centros de gravedad para mover el plano cartesiano
    PUNTOS3=vertices-p2;           % COORDENADAS DEL POLIGONO MOVIDO AL ORIGEN
    %%CODIGO PARA SACAR TODAS LAS PROP GEO CON CENTRO EL CG
    P0  =0;
    A0  =0;
    IX0 =0;
    IY0 =0;
    IXY0=0;
    MX0 =0;
    MY0 =0;
    XC1 =0;
    YC1 =0;
    for i =1:1:jj-1;
        x1 =PUNTOS3(i,1);
        x2 =PUNTOS3(i+1,1);
        y1 =PUNTOS3(i,2);
        y2 =PUNTOS3(i+1,2);
        XC1 =(x1*y2-x2*y1)*(x2+x1)+XC1;
        YC1 =(x1*y2-x2*y1)*(y2+y1)+YC1;
        A0  =(x1*y2-x2*y1)+A0;
        P0  =((x1-x2)^2+(y1-y2)^2)^0.5+P0;
        MX0 =(x1-x2)*(y2^2+y2*y1+y1^2)+MX0;
        MY0 =(y1-y2)*(x2^2+x2*x1+x1^2)+MY0;
        IY0 =(x1*y2-x2*y1)*(x2^2+x2*x1+x1^2)+IY0;
        IX0 =(x1*y2-x2*y1)*(y2^2+y2*y1+y1^2)+IX0;
        IXY0=(x1*y2-x2*y1)*(2*x2*y2+x2*y1+x1*y2+2*x1*y1)+IXY0;
    end
    PER = abs(P0);        %PERIMETRO
    A   = abs(A0/2);      %AREA
    IX  = abs(IX0/12);    %INERCIA EN X
    IY  = abs(IY0/12);    %INERCIA EN Y
    XC1 = abs(XC1/(6*A)); %CG EN X
    YC1 = abs(YC1/(6*A)); %CG EN Y
    MX  = abs(MX0/6);
    MY  = abs(MY0/6);
    IXY = abs(IXY0/24);
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %BUSCADOR DE FUERZAS
    FBA=0;
    for i=UNIR;                 %ESCRIBIR LOS PUNTPS A SUMAR
      FFA=i;                    %PUNTO A BUSCAR
      K1=find(PD==FFA);         %BUSCA EL PUNTO EN LA MATRIZ
      K2=find(PL==FFA);         %BUSCA EL PUNTO EN LA MATRIZ
      K3=find(SISMO==FFA);      %BUSCA EL PUNTO EN LA MATRIZ
      PD1=PD(K1,:);             %SALECCIONA LA FILA BUSCADA
      PL1=PL(K1,:);             %SALECCIONA LA FILA BUSCADA
      SISMO1=SISMO(K2,:);       %SALECCIONA LA FILA BUSCADA
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
    XL = xq(in);
    YL = yq(in);
    %%%%%calculo de esfuerzos
    Co = eval(CoValue);
    k = ecuacion_de_flexion(Co, A, XL, YL, Ixx, Iyy, Df, pesoEspecifico, 1, size(Co)(1));
    poligonoi = ["poligono" num2str(poliN)];
    minz = min(k);
    maxz = max(k);
    resultados.(poligonoi) = struct("XX", XL+XC, "YY", YL+YC, "ZZ", k', "min", minz, "max", maxz, "XC", XC, "YC", YC);
  endfor
  save("-mat7-binary", "-", "resultados");
endfunction