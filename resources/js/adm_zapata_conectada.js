import "print-this";

$(document).ready(function () {
    $("#DataZapataconectada").submit(function (event) {
        event.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                $("#ObtenerResultadosZConectada").html(response);
            },
        });
    });
    // Función para verificar si todos los campos están llenos
    function verificarCamposLlenos() {
        var inputs = document.querySelectorAll('input[type="number"]');
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i].value) {
                return false; // Si algún campo está vacío, devuelve falso
            }
        }
        return true; // Si todos los campos están llenos, devuelve verdadero
    }

    function handleChange() {
        var selectElement = document.getElementById("tipoDiseño");
        var valorSeleccionado = selectElement.value;
        llamarAGraficar();
    }

    // Obtener el elemento select
    var selectElement = document.getElementById("tipoDiseño");

    // Asignar el evento 'change' y la función 'handleChange' al elemento select
    selectElement.addEventListener("change", handleChange);

    // Función para llamar a graficar con los valores de entrada
    function llamarAGraficar() {
        if (verificarCamposLlenos()) {
            // Si todos los campos están llenos, obtén los valores y llama a la función graficar
            var anchoCol1 = parseFloat(document.getElementById("anchoCol1").value);
            var largoCol1 = parseFloat(document.getElementById("largoCol1").value);
            var anchoCol2 = parseFloat(document.getElementById("anchoCol2").value);
            var largoCol2 = parseFloat(document.getElementById("largoCol2").value);
            var anchoZap1 = parseFloat(document.getElementById("anchoZap1").value);
            var largoZap1 = parseFloat(document.getElementById("largoZap1").value);
            var anchoZap2 = parseFloat(document.getElementById("anchoZap2").value);
            var largoZap2 = parseFloat(document.getElementById("largoZap2").value);
            var ln = parseFloat(document.getElementById("lndiseno").value);
            var anchoViga = parseFloat(document.getElementById("anchoViga").value);
            var selectElement = document.getElementById("tipoDiseño");
            var tipoDiseño = parseInt(selectElement.value);

            //paso los valores a cm de m para graficar en esa escala
            anchoCol1 = anchoCol1 * 100;
            largoCol1 = largoCol1 * 100;
            anchoCol2 = anchoCol2 * 100;
            largoCol2 = largoCol2 * 100;
            anchoZap1 = anchoZap1 * 100;
            largoZap1 = largoZap1 * 100;
            anchoZap2 = anchoZap2 * 100;
            largoZap2 = largoZap2 * 100;
            anchoViga = anchoViga * 100;
            ln = ln * 100;

            //variables para las diemnsiones del diseño
            var xcol1, ycol1, xcol2, ycol2, yAjustadoZC1, yAjustadoZC2;

            //cada tipo de diseño tiene su ubicaion en x y y
            switch (tipoDiseño) {
                case 1:
                    xcol1 = 0;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1 + ln;
                    ycol2 = 0;
                    yAjustadoZC1 = 0;
                    yAjustadoZC2 = 0;
                    break;
                case 2:
                    xcol1 = 0;
                    ycol1 = largoZap1 / 2 - largoCol1 / 2;
                    xcol2 = xcol1 + anchoCol1 + ln;
                    ycol2 = largoZap2 / 2 - largoCol2 / 2;

                    // Comparar largos de las zapatas para determinar la diferencia
                    var diferenciaLargoZapatas = largoZap1 - largoZap2;

                    // Ajustar las alturas de las columnas según la diferencia de largo de las zapatas
                    var yAjustadoZC1, yAjustadoZC2;

                    if (diferenciaLargoZapatas > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas / 2;
                    } else if (diferenciaLargoZapatas < 0) {
                        // Si la zapata 2 es más larga, ajustar la altura de la columna 1
                        yAjustadoZC1 = (diferenciaLargoZapatas * -1) / 2;
                        yAjustadoZC2 = 0;
                    } else {
                        // Si las zapatas tienen el mismo largo, no se necesitan ajustes
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 3:
                    xcol1 = 0;
                    ycol1 = largoZap1 - largoCol1;
                    xcol2 = xcol1 + anchoCol1 + ln;
                    ycol2 = largoZap2 - largoCol2;

                    // Comparar largos de las zapatas para determinar la diferencia
                    var diferenciaLargoZapatas = largoZap1 - largoZap2;

                    // Ajustar las alturas de las columnas según la diferencia de largo de las zapatas
                    var yAjustadoZC1, yAjustadoZC2;

                    if (diferenciaLargoZapatas > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas;
                    } else if (diferenciaLargoZapatas < 0) {
                        // Si la zapata 2 es más larga, ajustar la altura de la columna 1
                        yAjustadoZC1 = diferenciaLargoZapatas * -1;
                        yAjustadoZC2 = 0;
                    } else {
                        // Si las zapatas tienen el mismo largo, no se necesitan ajustes
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 4:
                    xcol1 = anchoZap1 / 2 - anchoCol1 / 2;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1 + ln;
                    ycol2 = 0;
                    yAjustadoZC1 = 0;
                    yAjustadoZC2 = 0;
                    break;
                case 5:
                    xcol1 = anchoZap1 / 2 - anchoCol1 / 2;
                    ycol1 = largoZap1 / 2 - largoCol1 / 2;
                    xcol2 = xcol1 + anchoCol1 + ln;
                    ycol2 = largoZap2 / 2 - largoCol2 / 2;

                    // Comparar largos de las zapatas para determinar la diferencia
                    var diferenciaLargoZapatas = largoZap1 - largoZap2;

                    // Ajustar las alturas de las columnas según la diferencia de largo de las zapatas
                    var yAjustadoZC1, yAjustadoZC2;

                    if (diferenciaLargoZapatas > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas / 2;
                    } else if (diferenciaLargoZapatas < 0) {
                        // Si la zapata 2 es más larga, ajustar la altura de la columna 1
                        yAjustadoZC1 = (diferenciaLargoZapatas * -1) / 2;
                        yAjustadoZC2 = 0;
                    } else {
                        // Si las zapatas tienen el mismo largo, no se necesitan ajustes
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 6:
                    xcol1 = anchoZap1 / 2 - anchoCol1 / 2;
                    ycol1 = largoZap1 - largoCol1;
                    xcol2 = xcol1 + anchoCol1 + ln;
                    ycol2 = largoZap2 - largoCol2;
                    // Comparar largos de las zapatas para determinar la diferencia
                    var diferenciaLargoZapatas = largoZap1 - largoZap2;

                    // Ajustar las alturas de las columnas según la diferencia de largo de las zapatas
                    var yAjustadoZC1, yAjustadoZC2;

                    if (diferenciaLargoZapatas > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas;
                    } else if (diferenciaLargoZapatas < 0) {
                        // Si la zapata 2 es más larga, ajustar la altura de la columna 1
                        yAjustadoZC1 = diferenciaLargoZapatas * -1;
                        yAjustadoZC2 = 0;
                    } else {
                        // Si las zapatas tienen el mismo largo, no se necesitan ajustes
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 7:
                    xcol1 = anchoZap1 / 2 - anchoCol1 / 2;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1 + ln + anchoZap2 / 2 - anchoCol2 / 2;
                    ycol2 = 0;
                    yAjustadoZC1 = 0;
                    yAjustadoZC2 = 0;
                    break;
                case 8:
                    xcol1 = anchoZap1 / 2 - anchoCol1 / 2;
                    ycol1 = largoZap1 / 2 - largoCol1 / 2;
                    xcol2 = xcol1 + anchoCol1 + ln + anchoZap2 / 2 - anchoCol2 / 2;
                    ycol2 = largoZap2 / 2 - largoCol2 / 2;
                    // Comparar largos de las zapatas para determinar la diferencia
                    var diferenciaLargoZapatas = largoZap1 - largoZap2;

                    // Ajustar las alturas de las columnas según la diferencia de largo de las zapatas
                    var yAjustadoZC1, yAjustadoZC2;

                    if (diferenciaLargoZapatas > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas / 2;
                    } else if (diferenciaLargoZapatas < 0) {
                        // Si la zapata 2 es más larga, ajustar la altura de la columna 1
                        yAjustadoZC1 = (diferenciaLargoZapatas * -1) / 2;
                        yAjustadoZC2 = 0;
                    } else {
                        // Si las zapatas tienen el mismo largo, no se necesitan ajustes
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 9:
                    xcol1 = anchoZap1 / 2 - anchoCol1 / 2;
                    ycol1 = largoZap1 - largoCol1;
                    xcol2 = xcol1 + anchoCol1 + ln + anchoZap2 / 2 - anchoCol2 / 2;
                    ycol2 = largoZap2 - largoCol2;
                    // Comparar largos de las zapatas para determinar la diferencia
                    var diferenciaLargoZapatas = largoZap1 - largoZap2;

                    // Ajustar las alturas de las columnas según la diferencia de largo de las zapatas
                    var yAjustadoZC1, yAjustadoZC2;

                    if (diferenciaLargoZapatas > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas;
                    } else if (diferenciaLargoZapatas < 0) {
                        // Si la zapata 2 es más larga, ajustar la altura de la columna 1
                        yAjustadoZC1 = diferenciaLargoZapatas * -1;
                        yAjustadoZC2 = 0;
                    } else {
                        // Si las zapatas tienen el mismo largo, no se necesitan ajustes
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = 0;
                    }
                    break;
            }
            // Llama a la función graficar con los valores obtenidos
            graficar(
                xcol1,
                ycol1,
                xcol2,
                ycol2,
                ln,
                anchoZap1,
                largoZap1,
                anchoZap2,
                largoZap2,
                anchoCol1,
                largoCol1,
                anchoCol2,
                largoCol2,
                yAjustadoZC1,
                yAjustadoZC2,
                anchoViga
            );
        }
    }

    // Escuchar los cambios en los campos de entrada y llamar a llamarAGraficar cuando todos estén llenos
    var inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(function (input) {
        input.addEventListener("input", llamarAGraficar);
    });

    // Función para graficar zapatas y columnas
    function graficar(
        xcol1,
        ycol1,
        xcol2,
        ycol2,
        ln,
        anchoZapata1,
        altoZapata1,
        anchoZapata2,
        altoZapata2,
        anchoColumna1,
        altoColumna1,
        anchoColumna2,
        altoColumna2,
        yAjustadoZC1,
        yAjustadoZC2,
        anchoViga
    ) {
        // Configura Paper.js
        paper.setup("myCanvas");

        var espaciadoX = 60;
        var espaciadoY = 60;
        // Dibujar la primera zapata a la izquierda
        var zapata1 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(espaciadoX, espaciadoY + yAjustadoZC1),
                new paper.Size(anchoZapata1, altoZapata1)
            )
        );
        zapata1.strokeColor = "black"; // Borde negro
        zapata1.strokeWidth = 2; // Grosor del borde

        // Dibujar la segunda zapata a la derecha
        var zapata2 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(
                    espaciadoX +
                    xcol1 +
                    anchoColumna1 +
                    ln -
                    (anchoZapata2 / 2 - anchoColumna2 / 2),
                    espaciadoY + yAjustadoZC2
                ),
                new paper.Size(anchoZapata2, altoZapata2)
            )
        );
        zapata2.strokeColor = "black"; // Borde negro
        zapata2.strokeWidth = 2; // Grosor del borde

        // Dibujar la primera columna centrada en la parte izquierda y en la parte superior
        var columna1 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(espaciadoX + xcol1, ycol1 + espaciadoY + yAjustadoZC1),
                new paper.Size(anchoColumna1, altoColumna1)
            )
        );
        columna1.fillColor = "lightgray";
        columna1.strokeColor = "black"; // Borde negro al rectángulo
        columna1.strokeWidth = 2; // Grosor del borde

        // Dibujar la segunda columna centrada en la parte derecha y en la parte superior
        var columna2 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(xcol2 + espaciadoX, ycol2 + espaciadoY + yAjustadoZC2),
                new paper.Size(anchoColumna2, altoColumna2)
            )
        );
        columna2.fillColor = "lightgray";
        columna2.strokeColor = "black"; // Borde negro al rectángulo
        columna2.strokeWidth = 2; // Grosor del borde

        // linea 1

        xlinea_inicio_1 = espaciadoX + xcol1 + anchoColumna1;
        ylinea_inicio_1 =
            espaciadoY + ycol1 + yAjustadoZC1 + (altoColumna1 / 2 - anchoViga / 2);
        xlinea_final_1 = xcol2 + espaciadoX;
        ylinea_final_1 =
            ycol2 + espaciadoY + yAjustadoZC2 + (altoColumna2 / 2 - anchoViga / 2);

        //cuando son de diferentes tamaños se debe martener la altura del cimiento con respecto a la columna mas pequeña
        if (altoColumna2 - altoColumna1 > 0) {
            ylinea_final_1 = ylinea_inicio_1;
        } else if (altoColumna2 - altoColumna1 < 0) {
            ylinea_inicio_1 = ylinea_final_1;
        }

        var startPoint = new paper.Point(xlinea_inicio_1, ylinea_inicio_1);
        var endPoint = new paper.Point(xlinea_final_1, ylinea_final_1);
        var line = new paper.Path.Line(startPoint, endPoint);
        line.strokeColor = "black";
        line.strokeWidth = 2;

        // linea 2
        xlinea_inicio_2 = espaciadoX + xcol1 + anchoColumna1;
        ylinea_inicio_2 =
            espaciadoY +
            ycol1 +
            altoColumna1 +
            yAjustadoZC1 -
            (altoColumna1 / 2 - anchoViga / 2);
        xlinea_final_2 = xcol2 + espaciadoX;
        ylinea_final_2 =
            ycol2 +
            espaciadoY +
            altoColumna2 +
            yAjustadoZC2 -
            (altoColumna2 / 2 - anchoViga / 2);
        //cuando son de diferentes tamaños se debe martener la altura del cimiento con respecto a la columna mas pequeña
        if (altoColumna2 - altoColumna1 > 0) {
            ylinea_final_2 = ylinea_inicio_2;
        } else if (altoColumna2 - altoColumna1 < 0) {
            ylinea_inicio_2 = ylinea_final_2;
        }

        var startPoint = new paper.Point(xlinea_inicio_2, ylinea_inicio_2);
        var endPoint = new paper.Point(xlinea_final_2, ylinea_final_2);
        var line = new paper.Path.Line(startPoint, endPoint);
        line.strokeColor = "black";
        line.strokeWidth = 2;

        // texto anchoViga
        // Crear un punto de texto en las coordenadas especificadas
        xtextoav = espaciadoX + xcol1 + anchoColumna1 + ln / 2;
        ytextoav = ylinea_inicio_1 + anchoViga / 2 + 12.5;

        var textPoint = new paper.Point(xtextoav, ytextoav);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = anchoViga / 100 + " ";

        // Otras propiedades del texto (opcional)
        text.fillColor = "red";
        text.fontSize = 25;
        text.fontFamily = "Arial";
        text.fontWeight = "bold";

        // linea ancho Viga

        xlinea_inicio_1 = espaciadoX + xcol1 + anchoColumna1 + ln / 2 - 30;
        ylinea_inicio_1 =
            espaciadoY + ycol1 + yAjustadoZC1 + (altoColumna1 / 2 - anchoViga / 2);
        xlinea_final_1 = xlinea_inicio_2 + ln / 2 - 30;
        ylinea_final_1 = ylinea_inicio_1 + anchoViga;

        //cuando son de diferentes tamaños se debe martener la altura del cimiento con respecto a la columna mas pequeña
        if (altoColumna2 - altoColumna1 > 0) {
            ylinea_final_1 = ylinea_inicio_1;
        } else if (altoColumna2 - altoColumna1 < 0) {
            ylinea_inicio_1 = ylinea_final_1;
        }

        var startPoint = new paper.Point(xlinea_inicio_1, ylinea_inicio_1);
        var endPoint = new paper.Point(xlinea_final_1, ylinea_final_1);
        var line = new paper.Path.Line(startPoint, endPoint);
        line.strokeColor = "red";
        line.strokeWidth = 2;

        // texto columna 1
        // Crear un punto de texto en las coordenadas especificadas
        xtextoC1 = espaciadoX + xcol1 + anchoColumna1 / 2 - 20;
        ytextoC1 = espaciadoY + ycol1 + altoColumna1 + 26 + yAjustadoZC1;

        var textPoint = new paper.Point(xtextoC1, ytextoC1);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = "C-1";

        // Otras propiedades del texto (opcional)
        text.fillColor = "black"; // Color del texto
        text.fontSize = 25; // Tamaño de fuente
        text.fontFamily = "Arial"; // Familia de fuente
        text.fontWeight = "bold"; // Peso de la fuente (opcional)

        // texto columna 2
        // Crear un punto de texto en las coordenadas especificadas
        xtextoC2 = xcol2 + espaciadoX + anchoColumna2 / 2 - 20;
        ytextoC2 = ycol2 + espaciadoY + altoColumna2 + yAjustadoZC2 + 26;

        var textPoint = new paper.Point(xtextoC2, ytextoC2);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = "C-2";

        // Otras propiedades del texto (opcional)
        text.fillColor = "black"; // Color del texto
        text.fontSize = 25; // Tamaño de fuente
        text.fontFamily = "Arial"; // Familia de fuente
        text.fontWeight = "bold"; // Peso de la fuente (opcional)

        // texto ancho columna 1
        // Crear un punto de texto en las coordenadas especificadas
        xtextoC1 = espaciadoX + xcol1 + anchoColumna1 / 2 - 20;
        ytextoC1 = espaciadoY + ycol1 - 5 + yAjustadoZC1;

        var textPoint = new paper.Point(xtextoC1, ytextoC1);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = anchoColumna1 / 100;

        // Otras propiedades del texto (opcional)
        text.fillColor = "black"; // Color del texto
        text.fontSize = 25; // Tamaño de fuente
        text.fontFamily = "Arial"; // Familia de fuente
        text.fontWeight = "bold"; // Peso de la fuente (opcional)

        // texto ancho columna 2
        // Crear un punto de texto en las coordenadas especificadas
        xtextoC2 = xcol2 + espaciadoX + anchoColumna2 / 2 - 20;
        ytextoC2 = ycol2 + espaciadoY + yAjustadoZC2 - 5;

        var textPoint = new paper.Point(xtextoC2, ytextoC2);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = anchoColumna2 / 100;

        // Otras propiedades del texto (opcional)
        text.fillColor = "black"; // Color del texto
        text.fontSize = 25; // Tamaño de fuente
        text.fontFamily = "Arial"; // Familia de fuente
        text.fontWeight = "bold"; // Peso de la fuente (opcional)

        // texto alto columna 1
        // Crear un punto de texto en las coordenadas especificadas
        xtextoC1 = espaciadoX + xcol1 - 50;
        ytextoC1 = espaciadoY + ycol1 + altoColumna1 / 2 + yAjustadoZC1 + 12.5;

        var textPoint = new paper.Point(xtextoC1, ytextoC1);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = altoColumna1 / 100;

        // Otras propiedades del texto (opcional)
        text.fillColor = "black"; // Color del texto
        text.fontSize = 25; // Tamaño de fuente
        text.fontFamily = "Arial"; // Familia de fuente
        text.fontWeight = "bold"; // Peso de la fuente (opcional)

        // texto alto columna 2
        // Crear un punto de texto en las coordenadas especificadas
        xtextoC2 = xcol2 + espaciadoX + anchoColumna2 + 10;
        ytextoC2 = ycol2 + espaciadoY + altoColumna2 / 2 + yAjustadoZC2 + 12.5;

        var textPoint = new paper.Point(xtextoC2, ytextoC2);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = altoColumna2 / 100;

        // Otras propiedades del texto (opcional)
        text.fillColor = "black"; // Color del texto
        text.fontSize = 25; // Tamaño de fuente
        text.fontFamily = "Arial"; // Familia de fuente
        text.fontWeight = "bold"; // Peso de la fuente (opcional)

        //Linea para la dimencion del cimiento
        // linea 1 vertical

        xlinea_inicio_c1 = espaciadoX + xcol1 + anchoColumna1;
        ylinea_inicio_c1 = espaciadoY + ycol1 + yAjustadoZC1 + altoColumna1;
        xlinea_final_c1 = espaciadoX + xcol1 + anchoColumna1;
        nivel = 0;
        // cuando la columna 2 sea mas largo debe imcrementarse esa diferencia en la otra columna para que salga la linea recta
        if (altoColumna2 - altoColumna1 > 0) {
            //condicion para cuando este en la psicion 1,4 y 7 para que la linea de la medida del ln este recta
            if (ycol1 == 0) {
                nivel = altoColumna2 - altoColumna1;
            } else if (ycol1 + altoColumna1 == altoZapata1) {
                nivel = 0;
            } else {
                nivel = altoColumna2 / 2 - altoColumna1 / 2;
            }
        }

        ylinea_final_c1 =
            espaciadoY + ycol1 + yAjustadoZC1 + altoColumna1 + 50 + nivel;

        var startPoint = new paper.Point(xlinea_inicio_c1, ylinea_inicio_c1);
        var endPoint = new paper.Point(xlinea_final_c1, ylinea_final_c1);
        var line = new paper.Path.Line(startPoint, endPoint);
        line.strokeColor = "red";
        line.strokeWidth = 1;

        // linea 2 vertical
        xlinea_inicio_c2 = xcol2 + espaciadoX;
        ylinea_inicio_c2 = espaciadoY + ycol2 + yAjustadoZC2 + altoColumna2;
        xlinea_final_c2 = xcol2 + espaciadoX;
        nively = 0;
        // cuando la columna 2 sea mas largo debe imcrementarse esa diferencia en la otra columna para que salga la linea recta
        if (altoColumna2 - altoColumna1 < 0) {
            //condicion para cuando este en la psicion 1,4 y 7 para que la linea de la medida del ln este recta
            if (ycol1 == 0) {
                nively = altoColumna1 - altoColumna2;
            } else if (ycol1 + altoColumna1 == altoZapata1) {
                nively = 0;
            } else {
                nively = altoColumna1 / 2 - altoColumna2 / 2;
            }
        }

        ylinea_final_c2 =
            espaciadoY + ycol2 + yAjustadoZC2 + altoColumna2 + 50 + nively;

        var startPoint = new paper.Point(xlinea_inicio_c2, ylinea_inicio_c2);
        var endPoint = new paper.Point(xlinea_final_c2, ylinea_final_c2);
        var line = new paper.Path.Line(startPoint, endPoint);
        line.strokeColor = "red";
        line.strokeWidth = 1;

        //ln

        xlinea_inicio_ln = espaciadoX + xcol1 + anchoColumna1;
        ylinea_inicio_ln =
            espaciadoY + ycol1 + yAjustadoZC1 + altoColumna1 + 50 + nivel;
        xlinea_final_ln = xcol2 + espaciadoX;
        ylinea_final_ln =
            espaciadoY + ycol2 + yAjustadoZC2 + altoColumna2 + 50 + nively;

        var startPoint = new paper.Point(xlinea_inicio_ln, ylinea_inicio_ln);
        var endPoint = new paper.Point(xlinea_final_ln, ylinea_final_ln);
        var line = new paper.Path.Line(startPoint, endPoint);
        line.strokeColor = "red";
        line.strokeWidth = 2;

        // texto ln
        // Crear un punto de texto en las coordenadas especificadas
        xtextoln = espaciadoX + xcol1 + anchoColumna1 + ln / 2;
        ytextoln = espaciadoY + ycol2 + altoColumna2 + 75;

        var textPoint = new paper.Point(xtextoln, ylinea_inicio_ln + 25);
        // Crear un objeto de texto en el punto especificado
        var text = new paper.PointText(textPoint);

        // Establecer el contenido del texto
        text.content = ln / 100 + " ";

        // Otras propiedades del texto (opcional)
        text.fillColor = "red";
        text.fontSize = 25;
        text.fontFamily = "Arial";
        text.fontWeight = "bold";
        // Actualiza el canvas
        paper.view.draw();
    }
    
    document.getElementById('btn_pdf_predim').addEventListener('click', function () {
        // Selecciona el div que quieres imprimir
        $('#zapataConectada_pdf').printThis({
            debug: false,               // Mostrar la ventana de depuración
            importCSS: true,            // Importar estilos CSS
            importStyle: true,          // Importar estilos directamente desde las etiquetas <style>
            loadCSS: "",                // Ruta al CSS adicional si lo necesitas
            pageTitle: "Zapata Conectada",       // Título de la página impresa
            removeInline: false,        // No eliminar los estilos en línea
            printDelay: 333,            // Añadir un pequeño retraso antes de la impresión
            header: null,               // HTML que aparecerá como encabezado en la impresión
            footer: null,               // HTML que aparecerá como pie de página en la impresión
            base: false,                // Usar la URL base para las rutas
            formValues: true,           // Conservar los valores de los formularios
            canvas: true,               // Incluir el contenido de los canvas (gráficos)
            doctypeString: '<!DOCTYPE html>', // Doctype de la impresión
            removeScripts: false,       // No eliminar las etiquetas <script>
            copyTagClasses: false       // No copiar las clases de las etiquetas HTML
        });
    });
});