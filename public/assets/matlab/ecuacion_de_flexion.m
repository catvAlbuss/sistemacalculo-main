function [k] = ecuacion_de_flexion(Co, A, XL, YL, Ixx, Iyy, df, pesoEspecifico, first, last)
    P  = Co(first:last,1)'+pesoEspecifico*A*df;
    M2 = Co(first:last,2)';
    M3 = Co(first:last,3)';
    k  = P./A + (XL./Iyy)*M2 + (YL./Ixx)*M3;
end