function [k] = ecuacion_de_flexion(Co, A, XL, YL, Ixx, Iyy, df, pesoEspecifico, first, last, ixy)
    % ACTUALIZADO (ver conversacion, "zapatas recortadas" / paridad Octave-PHP):
    % 'ixy' (producto de inercia) es OPCIONAL y por defecto 0 -- asi cualquier
    % llamador que no lo pase (zapatas.m, que hoy no tiene Ixy calculado en su
    % flujo) sigue dando EXACTAMENTE el mismo resultado de siempre. Cuando SI
    % se pasa un ixy != 0 (zapatas2.m), se usa la formula general de
    % flexocompresion biaxial CON acoplamiento -- misma formula ya validada y
    % en uso del lado PHP (ver calcularZapatas2EnPhp en OctavePlotController):
    %   denom = Ixx*Iyy - ixy^2
    %   coefX = (M2*Ixx - M3*ixy) / denom   (coeficiente de XL)
    %   coefY = (M3*Iyy - M2*ixy) / denom   (coeficiente de YL)
    % Cuando ixy=0 esto se reduce algebraicamente a la formula simple de
    % siempre (coefX=M2/Iyy, coefY=M3/Ixx) -- no cambia ningun resultado ya
    % validado con figuras donde Ixy=0 (rectangulos/cuadrados alineados a los
    % ejes). Antes, sin este termino, la presion podia salir hasta ~80%
    % desviada en triangulos/trapecios no simetricos (Ixy != 0 en esos casos).
    if nargin < 11 || isempty(ixy)
      ixy = 0;
    end

    P  = Co(first:last,1)'+pesoEspecifico*A*df;
    M2 = Co(first:last,2)';
    M3 = Co(first:last,3)';

    denom = Ixx*Iyy - ixy^2;
    if denom != 0
      coefX = (M2*Ixx - M3*ixy) / denom;
      coefY = (M3*Iyy - M2*ixy) / denom;
    else
      % Degenerado (poligono sin area/inercia real) -- misma salida defensiva
      % de antes, para no dividir entre cero.
      if Iyy != 0
        coefX = M2 / Iyy;
      else
        coefX = zeros(size(M2));
      end
      if Ixx != 0
        coefY = M3 / Ixx;
      else
        coefY = zeros(size(M3));
      end
    end

    k = P./A + XL*coefX + YL*coefY;
end
