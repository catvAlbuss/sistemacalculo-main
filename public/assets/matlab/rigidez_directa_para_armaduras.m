function [Ke] = rigidez_barra(x1,y1,x2,y2,E,A,ident)
%   --- MATRIZ DE RIGIDEZ LOCAL DE UNA BARRA ---
%   Función que calcula  la matriz de rigidez local de una barra
%   Variables:
%   x1 = Coordenadas en x del nudo cercano (m o in)
%   y1 = Coordenadas en y del nudo cercano (m o in)
%   x2 = Coordenadas en x del nudo lejano  (m o in)
%   y2 = Coordenadas en y del nudo lejano  (m o in)
%   E = Modulo Elástico (Kpa o Ksi)
%   A = Área de la sección (m^2 o in^)
%   ident = identificador de la barra (numero)

dx = x2-x1;
dy = y2-y1;
L = sqrt(dx^2+dy^2);
cos = dx / L;
sen = dy / L;
Ke = (E*A/L)*[cos^2   , cos*sen , -cos^2  , -sen*cos;
              sen*cos , sen^2   , -sen*cos, -sen^2;
              -cos^2  , -sen*cos, cos^2   , sen*cos;
              -sen*cos, -sen^2  , sen*cos , sen^2]
endfunction

function [K] = agregar_barra(Ke, gdl_barra, Kg)
%   --- ENSAMBLE DE LA MATRIZ DE RIGIDEZ GLOBAL ---
%   Función que agrega la barra Ke a la matriz de rigidez global kg
%   Variables:
%   Ke = matriz de  rigidez local de la barra e
%   gdl_barra = vector que contiene los GDL de la barra Ke,
%               asociados a la matriz de rigidez global Kg
%   Kg = matriz de rigidez global Kg, a la cual se le agregará
%       la matriz local Ke

for igdl = 1:4
    ifila = gdl_barra(igdl);
    for jgdl = 1:4
        jcolumna = gdl_barra(jgdl);
        Kg(ifila,jcolumna) = Kg(ifila,jcolumna) + Ke(igdl,jgdl);
    end
end
endfunction

function [desp] = sol_desplazamientos(Kg, gdl_t, gdl_f, vfuerza)
%   --- RESUELVE LOS DESPLAZAMIENTOS DE LA ESTRUCTURA ---
%   Variables:
%   Kg = matriz de rigidez global
%   gdl_t = grados de libertad totales de la estructura
%   gdl_f = grados de libertad libres de la estructura
%   vfuerza = vector de fuerzas aplicadas en los GDL libres

Kff = Kg(1:gdl_f,1:gdl_f);
Kss = Kg(gdl_f+1:gdl_t,gdl_f+1:gdl_t);
Ksf = Kg(1:gdl_f,1:gdl_f+1:gdl_t);
Kfs = Kg(gdl_f+1,length(K),1:gdl_f);
R = Kfs*D;
F = reshape(vfuerza,[gdl_f,1]);
desp = inv(Kff) * F;
endfunction

function [R] = reacciones(K,D)
%   --- CÁLCULO DE REACCIONES EN LOS APOYOS ---
%   Variables:
%   K = Matriz de rigidez global
%   D = Vector de desplazamientos en los GDL libres
gdl_r = length(K) - length(D);
gdl_f = length(D);
Kfs = K(gdl_f+1:length(K),1:gdl_f);
R = Kfs*D;
endfunction