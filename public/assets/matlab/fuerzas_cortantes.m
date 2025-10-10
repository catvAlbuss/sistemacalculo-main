function fuerzas_cortantes(fc, fy, b, h, lt, wd, wv, anchoTributario, frm, frv)
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %PROPIEDADES DE LA SECCION Y CARGAS
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    fc = fc; % Resistencia a la compresion del concreto
    Fy = fy; % Esfuerzo de fluencia del acero
    E  = 1500 * fc^0.5; % Modulo de Elasticidad del concreto
    b  = b;  % Base de las viguetas
    h  = h;  % Altura de la vigueta
    ht = h;  % Altura de la vigueta
    Lt = lt; % Longuitud de las viguetas
    WD = wd*frm*anchoTributario; % Carga distribuida muerta
    WV = wv*frv*anchoTributario; % Carga distribuida viva

    %%%%%%INERCIA%%%%%%%%%%%
    for ui = 1 : 1: length(b)
        It(1,ui)  = b(1,ui)*h(1,ui)^3/12; % Vector de inercias
    end
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CALCULO DE LA MATRIZ DE RIGIDEZ
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    h = length(Lt)-1;                   % Valor para el tamaño de la matriz
    K = zeros(2+h,2+h);                 % Matriz de riguidez global
    for i = 1:h+1                       % Loop para el ensamble de la matriz de riguidez
        I = It(1,i);                    % Inercia de cada elemento
        L = Lt(1,i);                    % Longitud de cada elemento
        % Matriz de Riguidez Local (SIMPLIFICADA)
        k = [4*E*I/L 2*E*I/L
             2*E*I/L 4*E*I/L];
        % Loop para el ensable general
        for j = 1:2
            for z = 1:2
                K(j+(i-1),z+(i-1)) = K(j+(i-1),z+(i-1)) + k(j,z);
            end
        end
    end
    RQ2= length(K)-1;             % Longitud maxima de la matriz emportrada final
    RQ3= 2:1:RQ2;                 % Longitud maxima de la matriz emportrada inicial y final
    Ke = K([RQ3],[RQ3]);          % Matriz de riguidez global para apoyos extremos empotrados

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %PROGRAMA COMBINATORIO
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    cm1 = length(Lt);           % Numero de vanos
    cm2 = 2^cm1-1;              % Numero de combinaciones posibles
    cm3 = zeros(cm1,cm2);       % Matriz de combinaciones posibles
    cm4 = 1 :1:cm1;
    cm5 = 0;                    % Contador
    for i2 = cm4
        cm6 = nchoosek (cm4, i2)'; % Generador de combinaciones
        i2 = i2;                   % Numero de filas
        s2 = size(cm6,2);          % Numero de columnas
        for r2 = 1: 1: s2          % Variar todas las columnas
            cm5 = cm5+1;
            for z2 = 1 : 1: i2     % Variar todas las filas
                ff1 = cm6(z2, r2); % Fila a combinacion
                cm3(ff1,cm5)=1;    % Colocacion de la unidad en la fila combinada
            end
        end
    end

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CALCULO DE LA MATRIZ DE FUERZA
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %Fuerzas debido a cargas muertas
    Fd  = zeros(2+h,1);                  % Matriz de fuerzas globales
    for i = 1:length(Lt)                 % Loop para el ensamble de la matriz de global
        L = Lt(1,i);                     % Longitud de cada vano
        wd= WD(1,i);                     % Carga muerta en cada vano
        %Matriz local de fuerzas
        fd = [wd*L/2
              wd*L^2/12
              wd*L/2
              -wd*L^2/12];               % Vector de empotramiento perfecto para cargas distribuidas
        %Matriz de fuerzas por cada elemento
        FD(1,i) = fd(1,1);
        FD(2,i) = fd(2,1);
        FD(3,i) = fd(3,1);
        FD(4,i) = fd(4,1);
        %Loop para el ensamble general
        for j = 1:2
            Fd(j+(i-1),1) = Fd(j+(i-1),1) + fd(j*2,1);
        end
    end
    Fde =Fd([RQ3 ],1);                    % Matriz de fuerzas globales de carga muerta para apoyos extremos empotrados

    %Fuerzas debido a cargas vivas
    for riz = 1 : 1 : cm2                % Loop para el analisis estructural alternado combinatorio
        Fv  = zeros(2+h,1);                  % Matriz de fuerzas globales
            for i = 1:length(Lt)                 % Loop para el ensamble de la matriz de global
                L = Lt(1,i);                     % Longitud de cada vano
                wv= WV(1,i);                     % Carga viva en cada vano
                %Matriz local de fuerzas
                fv = [wv*L/2
                      wv*L^2/12
                      wv*L/2
                      -wv*L^2/12]*cm3(i,riz);     % Vector de empotramiento perfecto para cargas distribuidas modif. por ana. comb.
                %Matriz de fuerzas por cada elemento
                FV(1,i) = fv(1,1);
                FV(2,i) = fv(2,1);
                FV(3,i) = fv(3,1);
                FV(4,i) = fv(4,1);
                %Loop para el ensable general
                for j = 1:2
                    Fv(j+(i-1),1) = Fv(j+(i-1),1) + fv(j*2,1);
                end
            end
        F  = Fd+Fv;                           % Matriz de fuerzas globales
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %CALCULO DE LA MATRIZ DE DESPLAZAMIENTOS
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        D = inv(K)*F;                        % Matriz de desplazamientos globales
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %CALCULO DE FUERZAS LOCALES
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        for i = 1:h+1
            %Matriz de desplazamientos Locales
            dl(1,i) = 0;
            dl(2,i) = D(i);
            dl(3,i) = 0;
            dl(4,i) = D(i+1);
            %Matriz de Riguidez Local
            I = It(1,i);                    % Inercia de cada elemento
            L = Lt(1,i);                    % Longitud de cada elemento
            ki = [12*E*I/L^3  6*E*I/L^2   -12*E*I/L^3 6*E*I/L^2
                  6*E*I/L^2   4*E*I/L     -6*E*I/L^2  2*E*I/L
                  -12*E*I/L^3 -6*E*I/L^2  12*E*I/L^3  -6*E*I/L^2
                  6*E*I/L^2   2*E*I/L     -6*E*I/L^2  4*E*I/L];
            %Matriz de fuerzas Locales
            fbi= ki*dl(:,i);
            %Matriz de fuerzas Locales por cada elemento
            F2(1,i) = fbi(1,1);
            F2(2,i) = fbi(2,1);
            F2(3,i) = fbi(3,1);
            F2(4,i) = fbi(4,1);
        end
        fba= FD+FV-F2;                          %Matriz de fuerzas Locales por cada elemento

        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %CALCULO DE DIAGRAMAS DE FUERZAS Y MOMENTOS
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %Loop para ordenar las fuerzas cortantes correlativamente
        for i = 1:h+1
            Fs(1+2*(i-1),1) =  -fba(1,i);
            Fs(2+2*(i-1),1) =   fba(3,i);
        end
        Fs1=[0;Fs;0];                        %Vector de todos las fuerzas cortantes
        ResSHEAR1(:,riz)= Fs1;               %Guarda respuestas
        %Este codigo ordena los momentos flectores correlativamente
        for i = 1:h+1
            Mf(1+2*(i-1),1) = fba(2,i);
            Mf(2+2*(i-1),1) = fba(4,i);
        end
        Mf;
        %Calculo de momentos positivos
        for i = 1:h+1
            L = Lt(1,i);
            vf= Fs(2+2*(i-1),1);                %Cortante final de cada barra
            vi= -Fs(1+2*(i-1),1);               %Cortante inicial de cada barra
            Mi= Mf(1+2*(i-1),1);                %Momento inicial de cada barra
            x = L/(1+vf/vi);                    %Distancia al primer apoyo donde el cortante es cero
            Mm(1+2*(i-1),1)= vi*x/2 - Mi;       %Momento maximo positivo
            Mm(2+2*(i-1),1)= Mf(2*i,1);         %Momento maximo negativo
            XS (i,1) = x;                       %Vector de longitudes al primer apoyo de cada barra donde el cortante es cero
        end
        mf= [Mf(1,1);Mm];                       %Vector de todos los momentos flectores
        ResMOMENT1(:,riz)= mf;                  %Guarda respuestas
    end

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CASO EMPOTRADO
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CALCULO DE LA MATRIZ DE FUERZA
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %FUERZAS%VIVAS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    for riz = 1 : 1 : cm2
    Fv  = zeros(2+h,1);                  % Matriz de fuerzas globales
    for i = 1:length(Lt)                 % Loop para el ensamble de la matriz de global
        L = Lt(1,i);                     % Longitud de cada elemento
        wv= WV(1,i);
        %Matriz local de fuerzas
        fv = [wv*L/2
              wv*L^2/12
              wv*L/2
              -wv*L^2/12]*cm3(i,riz);
        %Matriz de fuerzas     por cada elemento
        FV(1,i) = fv(1,1);
        FV(2,i) = fv(2,1);
        FV(3,i) = fv(3,1);
        FV(4,i) = fv(4,1);
        %Loop para el ensable general
        for j = 1:2
            Fv(j+(i-1),1) = Fv(j+(i-1),1) + fv(j*2,1);
        end
    end
    Fve = Fv([RQ3 ],1);                    % Matriz de fuerzas globales carga muerta EMPORTRADOS A LOS EXTREMOS
    F   = Fde+Fve;                         % Matriz de fuerzas globales
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CALCULO DE LA MATRIZ DE DESPLAZAMIENTOS
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    D = inv(Ke)*F;                        % Matriz de desplazamientos globales
    D = [0; D; 0];
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CALCULO DE FUERZAS LOCALES
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    for i = 1:h+1
        %Matriz de desplazamientos Locales
        dl(1,i) = 0;
        dl(2,i) = D(i);
        dl(3,i) = 0;
        dl(4,i) = D(i+1);
        %Matriz de Riguidez Local
        I = It(1,i);                    % Inercia de cada elemento
        L = Lt(1,i);                    % Longitud de cada elemento
        ki = [12*E*I/L^3  6*E*I/L^2  -12*E*I/L^3 6*E*I/L^2
              6*E*I/L^2   4*E*I/L    -6*E*I/L^2  2*E*I/L
              -12*E*I/L^3 -6*E*I/L^2 12*E*I/L^3  -6*E*I/L^2
              6*E*I/L^2   2*E*I/L    -6*E*I/L^2  4*E*I/L];
        %Matriz de fuerzas Locales
        fbi= ki*dl(:,i);
        %Matriz de fuerzas Locales por cada elemento
        F2(1,i) = fbi(1,1);
        F2(2,i) = fbi(2,1);
        F2(3,i) = fbi(3,1);
        F2(4,i) = fbi(4,1);
    end
    fba= FD+FV-F2;  %Matriz de fuerzas Locales por cada elemento

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %CALCULO DE DIAGRAMAS DE FUERZAS Y MOMENTOS
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %Loop para ordenar las fuerzas cortantes correlativamente
    for i = 1:h+1
        Fs(1+2*(i-1),1) = -fba(1,i);
        Fs(2+2*(i-1),1) = fba(3,i);
    end
    Fs1=[0;Fs;0];           %Vector de todos las fuerzas cortantes
    ResSHEAR2(:,riz) = Fs1; %Guarda respuestas
    %Este codigo ordena los momentos flectores correlativamente
    for i = 1:h+1
        Mf(1+2*(i-1),1) = fba(2,i);
        Mf(2+2*(i-1),1) = fba(4,i);
    end
    %Calculo de momentos positivos
    for i = 1:h+1
        L = Lt(1,i);
        vf= Fs(2+2*(i-1),1);          %Cortante final de cada barra
        vi= -Fs(1+2*(i-1),1);         %Cortante inicial de cada barra
        Mi= Mf(1+2*(i-1),1);          %Momento inicial de cada barra
        x = L/(1+vf/vi);              %Distancia al primer apoyo donde el cortante es cero
        Mm(1+2*(i-1),1)= vi*x/2 - Mi; %Momento maximo positivo
        Mm(2+2*(i-1),1)= Mf(2*i,1);   %Momento maximo negativo
        XS (i,1) = x;                 %Vector de longitudes al primer apoyo de cada barra donde el cortante es cero
    end
    mf= [Mf(1,1);Mm];                 %Vector de todos los momentos flectores
    ResMOMENT2(:,riz) = mf;           %Guarda respuestas
    end
    %Resumen del analisis estructual resultados unidos totales
    SHEAR =[ResSHEAR1,ResSHEAR2];
    MOMENT=[ResMOMENT1,ResMOMENT2];
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %GRAFICO DE FUERZAS CORTANTES
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %Valores del eje 'xx' para el dibujo de fuerzas cortantes
    Li=0;
    L2=[];
    L3=[];
    for i = 1:h
        Li              = Li + Lt(1,i);
        L2(1+2*(i-1),1) = Li;
        L2(2+2*(i-1),1) = Li;
        L3 (i,1)        = Li;
    end
    L4=[0;0;L2;sum(Lt);sum(Lt)];
    axexx=zeros(length(L4),1);

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %GRAFICO DE MOMENTOS FLECTORES
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %valores del eje 'xx' para el dibujo de momentos flectores
    L3=[0;L3];
    for i = 1:h+1
        L5(1+2*(i-1),1)=L3(i,1);
        L5(2+2*(i-1),1)=XS(i,1)+L3(i,1);
    end
    L5=[L5;sum(Lt)];

    x1n = {};
    y1n = {};
    x2n = {};
    y2n = {};
    %Aproximacion de la curva parabolica para momentos flectores
    for jkj= 1:1:6
        for i  = 1:h+1
            V  =[L5(2*i),-MOMENT(2*i,jkj)];

            P1 =[L5(1+2*(i-1)),-MOMENT(1+2*(i-1),jkj)];
            x1 =P1(1,1):0.01:V(1,1);
            a1 =(P1(1,2) - V(1,2))/(P1(1,1)-V(1,1))^2;
            y1 = a1*(x1-V(1,1)).^2+V(1,2);

            P2 =[L5(1+2*(i)),-MOMENT(1+2*(i),jkj)];
            x2 = V(1,1):0.01:P2(1,1);
            a2 =(P2(1,2) - V(1,2))/(P2(1,1)-V(1,1))^2;
            y2 = a2*(x2-V(1,1)).^2 + V(1,2);

            x1n{end+1} = x1;
            y1n{end+1} = y1;
            x2n{end+1} = x2;
            y2n{end+1} = y2;
        end
    end
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %Seleccion de maxinmos esfuerzso
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    for jj = 1:1:2*length(b)+1
        mom(jj,1)   = max(abs(ResMOMENT1(jj,:)));
        mom(jj,2)   = max(abs(ResMOMENT2(jj,:)));
        cor(jj+1,1) = max(abs(ResSHEAR1(jj+1,:)));
        cor(jj+1,2) = max(abs(ResSHEAR2(jj+1,:)));
        Mom(jj,1)   = max(mom(jj,:));
        Cor(jj+1,1) = max(cor(jj+1,:));
    end

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %Diseño en flexion
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    for yu = 1 : 1 : length(b)
        d  = (ht(1,yu) - 0.025)*100;                                         % Peralte del vano
        a  = d - (d^2 - 2*Mom(2*yu-1,1)*10^5/(0.9*0.85*fc*b(1,yu)*100))^0.5; % Long. a compresion
        flex(yu+2*(yu-1),2) = Mom(2*yu-1,1)*10^5/(0.9*Fy*(d-a/2));           % Area del refuerzo
        flex(yu+2*(yu-1),3) = 14/Fy*d*b(1,yu)*100;                           % Area minima de refuerzo
        flex(yu+2*(yu-1),1) = Mom(2*yu-1,1);

        a  = d - (d^2 - 2*Mom(2*yu,1)*10^5/(0.9*0.85*fc*b(1,yu)*100))^0.5;     % Long. a compresion
        flex(yu+2*(yu-1)+1,2) = Mom(2*yu,1)*10^5/(0.9*Fy*(d-a/2));             % Area del refuerzo
        flex(yu+2*(yu-1)+1,3) = 14/Fy*d*b(1,yu)*100;                           % Area minima de refuerzo
        flex(yu+2*(yu-1)+1,1) = Mom(2*yu,1);

        a  = d - (d^2 - 2*Mom(2*yu+1,1)*10^5/(0.9*0.85*fc*b(1,yu)*100))^0.5;   % Long. a compresion
        flex(yu+2*(yu-1)+2,2) = Mom(2*yu+1,1)*10^5/(0.9*Fy*(d-a/2));             % Area del refuerzo
        flex(yu+2*(yu-1)+2,3) = 14/Fy*d*b(1,yu)*100;                             % Area minima de refuerzo
        flex(yu+2*(yu-1)+2,1) = Mom(2*yu+1,1);
    end

    T1.Mu = flex(:,1);
    T1.Asd = flex(:,2);
    T1.Asmin = flex(:,3);

    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %Diseño por cortante
    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    RQ4 = 2:1:2*length(b)+1;
    CORT = Cor([RQ4 ],1);
    for yu = 1 : 1 : length(b)
        d  = (ht(1,yu) - 0.025)*100; % Peralte del vano
        bb = b(1,yu)*100;
        CORT(2*yu-1,2) = 1.1*0.85*0.53*fc^0.5*bb*d/1000;
        CORT(2*yu-1,3) = 100*CORT(2*yu-1,1)/CORT(2*yu-1,2);
        CORT(2*yu,2) = 1.1*0.85*0.53*fc^0.5*bb*d/1000;
        CORT(2*yu,3) = 100*CORT(2*yu,1)/CORT(2*yu,2);
    end
    T2.Vu = CORT(:,1);
    T2.Vc = CORT(:,2);
    T2.Ratio = CORT(:,3);

    SHEART = SHEAR';
    save("-mat7-binary", "-", "SHEART", "L4", "L5", "axexx", "x1n", "y1n", "x2n", "y2n", "T1", "T2", "E");
endfunction