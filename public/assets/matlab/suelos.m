% q=3  carga de terreno tn/m2
% df=1 PROFUNDIDAD DE DESPLANTE m
% B=1  ancho de la cimentacion m
% L=1  longitiud de la cimentacion
function suelos(q, df, B, L)
    % Definir los valores de entrada
    m1 = B/2;
    n1 = L/2;

    % Definir la primera columna de 0 a 100
    col1 = [0.01:.3:10]';

    % Calcular la segunda y tercera columna
    col2 = m1 ./ col1;
    col3 = n1 ./ col1;

    % Calcular la cuarta columna con la fórmula de Iz usando col2 como m y col3 como n
    m = col2;
    n = col3;

    num1 = 2 .* m .* n .* sqrt(m.^2 + n.^2 + 1);
    den1 = m.^2 + n.^2 + m.^2 .* n.^2 + 1;
    num2 = m.^2 + n.^2 + 2;
    den2 = m.^2 + n.^2 + 1;
    term1 = (num1 ./ den1) .* (num2 ./ den2);

    num3 = 2 .* m .* n .* sqrt(m.^2 + n.^2 + 1);
    den3 = m.^2 + n.^2 - m.^2 .* n.^2 + 1;
    term2 = atan(num3 ./ den3);

    % Aplicar condición para sumar pi si el tangente es negativo
    term2(term2 < 0) = term2(term2 < 0) + pi;

    col4 = (1 / (4 * pi)) * (term1 + term2);
    % Calcular la quinta columna como esfuerzo
    col5 = col4.*q*4;

    col6=df+col1;
    %columna de porcentajes de carga
    col7=col4*4*100;

    % Construir la matriz final
    Q = [col6,col1, col2, col3, col4,col5,col7];
    Q = [0 0 0 0 0 0 0;Q(1,1) 0 0 0 0 0 0;Q];
    % Mostrar la matriz
    %disp(Q);

    % Graficar la primera columna vs la última columna
    %plot(Q(:, 6), Q(:, 1), '-o', 'LineWidth', 2, 'MarkerSize', 8);
    %set(gca, 'YDir', 'reverse'); % Invertir eje Y para representar profundidad
    %xlabel('Incremento de Esfuerzos (t/m^2)');
    %ylabel('Profundidad (m)');
    %title('Distribución de Esfuerzos con la Profundidad');

    % Añadir etiquetas de valores en cada punto y líneas horizontales
    %for i = 1:length(col6)
    %    text(col5(i), col6(i), sprintf('%.2f', col5(i)), 'VerticalAlignment', 'bottom', 'HorizontalAlignment', 'right', 'FontSize', 10);
    %    line([0 col5(i)], [col6(i) col6(i)], 'Color', 'k', 'LineStyle', '--'); % Línea horizontal al eje Y
    %end

    %plot(Q(:, 7), Q(:, 1), '-o', 'LineWidth', 2, 'MarkerSize', 8);
    %set(gca, 'YDir', 'reverse'); % Invertir eje Y para representar profundidad
    %xlabel('Incremento de Esfuerzos (t/m^2)');
    %ylabel('Profundidad (m)');
    %title('Distribución de Esfuerzos con la Profundidad en porcentajes');

    % Añadir etiquetas de valores en cada punto y líneas horizontales
    %for i = 1:length(col6)
    %    text(col7(i), col6(i), sprintf('%.2f', col7(i)), 'VerticalAlignment', 'bottom', 'HorizontalAlignment', 'right', 'FontSize', 10);
    %    line([0 col7(i)], [col6(i) col6(i)], 'Color', 'k', 'LineStyle', '--'); % Línea horizontal al eje Y
    %end
    save("-mat7-binary", "-", "Q");
endfunction