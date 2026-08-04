import "print-this";
import paper from "paper";
import SweetAlert2 from "sweetalert2";

window.Swal = SweetAlert2;

$(document).ready(function () {
    const verificarCamposLlenos = () => {
        const inputs = document.querySelectorAll('#DataZapataconectada input[required]');
        for (let input of inputs) {
            if (!input.value || input.value.trim() === '') {
                return false;
            }
        }
        return true;
    };

    const validarNumeros = () => {
        const inputs = document.querySelectorAll('#DataZapataconectada input[type="text"]');
        for (let input of inputs) {
            if (input.value && isNaN(parseFloat(input.value))) {
                return false;
            }
        }
        return true;
    };

    const mostrarError = (mensaje) => {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar'
        });
    };

    const mostrarSuccess = (mensaje) => {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Aceptar',
            timer: 2000
        });
    };

    $("#DataZapataconectada").submit(function (event) {
        event.preventDefault();
        
        if (!verificarCamposLlenos()) {
            mostrarError('Por favor complete todos los campos requeridos');
            return;
        }

        if (!validarNumeros()) {
            mostrarError('Por favor ingrese solo valores numéricos válidos');
            return;
        }

        $.ajax({
            url: $(this).attr('action'),
            method: 'POST',
            data: $(this).serialize(),
            success: function (response) {
                $("#ObtenerResultadosZConectada").html(response);
                mostrarSuccess('Diseño calculado exitosamente');
                llamarAGraficar();
            },
            error: function (xhr, status, error) {
                mostrarError('Error al calcular: ' + error);
            }
        });
    });

    function handleChange() {
        const selectElement = document.getElementById("tipoDiseño");
        if (selectElement) {
            llamarAGraficar();
        }
    }

    const selectElement = document.getElementById("tipoDiseño");
    if (selectElement) {
        selectElement.addEventListener("change", handleChange);
    }

    function llamarAGraficar() {
        try {
            const getValue = (id) => {
                const el = document.getElementById(id);
                return el && el.value ? parseFloat(el.value) : 0;
            };

            const anchoCol1 = getValue('anchoCol1');
            const largoCol1 = getValue('largoCol1');
            const anchoCol2 = getValue('anchoCol2');
            const largoCol2 = getValue('largoCol2');
            const anchoZap1 = getValue('anchoZap1');
            const largoZap1 = getValue('largoZap1');
            const anchoZap2 = getValue('anchoZap2');
            const largoZap2 = getValue('largoZap2');
            const ln = getValue('lndiseno');
            const anchoViga = getValue('anchoViga');
            const selectElement = document.getElementById("tipoDiseño");
            const tipoDiseño = selectElement ? parseInt(selectElement.value) : 1;

            if (anchoCol1 <= 0 || largoCol1 <= 0 || anchoCol2 <= 0 || largoCol2 <= 0 ||
                anchoZap1 <= 0 || largoZap1 <= 0 || anchoZap2 <= 0 || largoZap2 <= 0 ||
                ln <= 0 || anchoViga <= 0) {
                return;
            }

            const anchoCol1Cm = anchoCol1 * 100;
            const largoCol1Cm = largoCol1 * 100;
            const anchoCol2Cm = anchoCol2 * 100;
            const largoCol2Cm = largoCol2 * 100;
            const anchoZap1Cm = anchoZap1 * 100;
            const largoZap1Cm = largoZap1 * 100;
            const anchoZap2Cm = anchoZap2 * 100;
            const largoZap2Cm = largoZap2 * 100;
            const anchoVigaCm = anchoViga * 100;
            const lnCm = ln * 100;

            let xcol1, ycol1, xcol2, ycol2, yAjustadoZC1 = 0, yAjustadoZC2 = 0;

            switch (tipoDiseño) {
                case 1:
                    xcol1 = 0;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = 0;
                    break;
                case 2:
                    xcol1 = 0;
                    ycol1 = largoZap1Cm / 2 - largoCol1Cm / 2;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = largoZap2Cm / 2 - largoCol2Cm / 2;
                    const diferenciaLargoZapatas2 = largoZap1Cm - largoZap2Cm;
                    if (diferenciaLargoZapatas2 > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas2 / 2;
                    } else if (diferenciaLargoZapatas2 < 0) {
                        yAjustadoZC1 = (-diferenciaLargoZapatas2) / 2;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 3:
                    xcol1 = 0;
                    ycol1 = largoZap1Cm - largoCol1Cm;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = largoZap2Cm - largoCol2Cm;
                    const diferenciaLargoZapatas3 = largoZap1Cm - largoZap2Cm;
                    if (diferenciaLargoZapatas3 > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas3;
                    } else if (diferenciaLargoZapatas3 < 0) {
                        yAjustadoZC1 = -diferenciaLargoZapatas3;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 4:
                    xcol1 = anchoZap1Cm / 2 - anchoCol1Cm / 2;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = 0;
                    break;
                case 5:
                    xcol1 = anchoZap1Cm / 2 - anchoCol1Cm / 2;
                    ycol1 = largoZap1Cm / 2 - largoCol1Cm / 2;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = largoZap2Cm / 2 - largoCol2Cm / 2;
                    const diferenciaLargoZapatas5 = largoZap1Cm - largoZap2Cm;
                    if (diferenciaLargoZapatas5 > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas5 / 2;
                    } else if (diferenciaLargoZapatas5 < 0) {
                        yAjustadoZC1 = (-diferenciaLargoZapatas5) / 2;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 6:
                    xcol1 = anchoZap1Cm / 2 - anchoCol1Cm / 2;
                    ycol1 = largoZap1Cm - largoCol1Cm;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = largoZap2Cm - largoCol2Cm;
                    const diferenciaLargoZapatas6 = largoZap1Cm - largoZap2Cm;
                    if (diferenciaLargoZapatas6 > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas6;
                    } else if (diferenciaLargoZapatas6 < 0) {
                        yAjustadoZC1 = -diferenciaLargoZapatas6;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 7:
                    xcol1 = anchoZap1Cm / 2 - anchoCol1Cm / 2;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm + anchoZap2Cm / 2 - anchoCol2Cm / 2;
                    ycol2 = 0;
                    break;
                case 8:
                    xcol1 = anchoZap1Cm / 2 - anchoCol1Cm / 2;
                    ycol1 = largoZap1Cm / 2 - largoCol1Cm / 2;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm + anchoZap2Cm / 2 - anchoCol2Cm / 2;
                    ycol2 = largoZap2Cm / 2 - largoCol2Cm / 2;
                    const diferenciaLargoZapatas8 = largoZap1Cm - largoZap2Cm;
                    if (diferenciaLargoZapatas8 > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas8 / 2;
                    } else if (diferenciaLargoZapatas8 < 0) {
                        yAjustadoZC1 = (-diferenciaLargoZapatas8) / 2;
                        yAjustadoZC2 = 0;
                    }
                    break;
                case 9:
                    xcol1 = anchoZap1Cm / 2 - anchoCol1Cm / 2;
                    ycol1 = largoZap1Cm - largoCol1Cm;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm + anchoZap2Cm / 2 - anchoCol2Cm / 2;
                    ycol2 = largoZap2Cm - largoCol2Cm;
                    const diferenciaLargoZapatas9 = largoZap1Cm - largoZap2Cm;
                    if (diferenciaLargoZapatas9 > 0) {
                        yAjustadoZC1 = 0;
                        yAjustadoZC2 = diferenciaLargoZapatas9;
                    } else if (diferenciaLargoZapatas9 < 0) {
                        yAjustadoZC1 = -diferenciaLargoZapatas9;
                        yAjustadoZC2 = 0;
                    }
                    break;
                default:
                    xcol1 = 0;
                    ycol1 = 0;
                    xcol2 = xcol1 + anchoCol1Cm + lnCm;
                    ycol2 = 0;
            }

            graficar(
                xcol1, ycol1, xcol2, ycol2, lnCm,
                anchoZap1Cm, largoZap1Cm, anchoZap2Cm, largoZap2Cm,
                anchoCol1Cm, largoCol1Cm, anchoCol2Cm, largoCol2Cm,
                yAjustadoZC1, yAjustadoZC2, anchoVigaCm
            );
        } catch (e) {
            console.error('Error al graficar:', e);
        }
    }

    function graficar(
        xcol1, ycol1, xcol2, ycol2, ln,
        anchoZapata1, altoZapata1, anchoZapata2, altoZapata2,
        anchoColumna1, altoColumna1, anchoColumna2, altoColumna2,
        yAjustadoZC1, yAjustadoZC2, anchoViga
    ) {
        const canvas = document.getElementById('myCanvas');
        if (!canvas) {
            console.error('Canvas no encontrado');
            return;
        }

        paper.setup(canvas);
        paper.project.activeLayer.removeChildren();

        const espaciadoX = 60;
        const espaciadoY = 60;

        const zapata1 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(espaciadoX, espaciadoY + yAjustadoZC1),
                new paper.Size(anchoZapata1, altoZapata1)
            )
        );
        zapata1.strokeColor = 'black';
        zapata1.strokeWidth = 2;

        const zapata2 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(
                    espaciadoX + xcol1 + anchoColumna1 + ln - (anchoZapata2 / 2 - anchoColumna2 / 2),
                    espaciadoY + yAjustadoZC2
                ),
                new paper.Size(anchoZapata2, altoZapata2)
            )
        );
        zapata2.strokeColor = 'black';
        zapata2.strokeWidth = 2;

        const columna1 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(espaciadoX + xcol1, ycol1 + espaciadoY + yAjustadoZC1),
                new paper.Size(anchoColumna1, altoColumna1)
            )
        );
        columna1.fillColor = 'lightgray';
        columna1.strokeColor = 'black';
        columna1.strokeWidth = 2;

        const columna2 = new paper.Path.Rectangle(
            new paper.Rectangle(
                new paper.Point(xcol2 + espaciadoX, ycol2 + espaciadoY + yAjustadoZC2),
                new paper.Size(anchoColumna2, altoColumna2)
            )
        );
        columna2.fillColor = 'lightgray';
        columna2.strokeColor = 'black';
        columna2.strokeWidth = 2;

        let ylinea_inicio_1 = espaciadoY + ycol1 + yAjustadoZC1 + (altoColumna1 / 2 - anchoViga / 2);
        let ylinea_final_1 = ycol2 + espaciadoY + yAjustadoZC2 + (altoColumna2 / 2 - anchoViga / 2);
        if (altoColumna2 - altoColumna1 > 0) ylinea_final_1 = ylinea_inicio_1;
        else if (altoColumna2 - altoColumna1 < 0) ylinea_inicio_1 = ylinea_final_1;

        const line1 = new paper.Path.Line(
            new paper.Point(espaciadoX + xcol1 + anchoColumna1, ylinea_inicio_1),
            new paper.Point(xcol2 + espaciadoX, ylinea_final_1)
        );
        line1.strokeColor = 'black';
        line1.strokeWidth = 2;

        let ylinea_inicio_2 = espaciadoY + ycol1 + altoColumna1 + yAjustadoZC1 - (altoColumna1 / 2 - anchoViga / 2);
        let ylinea_final_2 = ycol2 + espaciadoY + altoColumna2 + yAjustadoZC2 - (altoColumna2 / 2 - anchoViga / 2);
        if (altoColumna2 - altoColumna1 > 0) ylinea_final_2 = ylinea_inicio_2;
        else if (altoColumna2 - altoColumna1 < 0) ylinea_inicio_2 = ylinea_final_2;

        const line2 = new paper.Path.Line(
            new paper.Point(espaciadoX + xcol1 + anchoColumna1, ylinea_inicio_2),
            new paper.Point(xcol2 + espaciadoX, ylinea_final_2)
        );
        line2.strokeColor = 'black';
        line2.strokeWidth = 2;

        const xtextoav = espaciadoX + xcol1 + anchoColumna1 + ln / 2;
        const ytextoav = ylinea_inicio_1 + anchoViga / 2 + 12.5;
        const textAnchoViga = new paper.PointText(new paper.Point(xtextoav, ytextoav));
        textAnchoViga.content = anchoViga / 100 + ' m';
        textAnchoViga.fillColor = 'red';
        textAnchoViga.fontSize = 25;
        textAnchoViga.fontFamily = 'Arial';
        textAnchoViga.fontWeight = 'bold';

        const xtextoC1 = espaciadoX + xcol1 + anchoColumna1 / 2 - 20;
        const ytextoC1 = espaciadoY + ycol1 + altoColumna1 + 26 + yAjustadoZC1;
        const textC1 = new paper.PointText(new paper.Point(xtextoC1, ytextoC1));
        textC1.content = 'C-1';
        textC1.fillColor = 'black';
        textC1.fontSize = 25;
        textC1.fontFamily = 'Arial';
        textC1.fontWeight = 'bold';

        const xtextoC2 = xcol2 + espaciadoX + anchoColumna2 / 2 - 20;
        const ytextoC2 = ycol2 + espaciadoY + altoColumna2 + yAjustadoZC2 + 26;
        const textC2 = new paper.PointText(new paper.Point(xtextoC2, ytextoC2));
        textC2.content = 'C-2';
        textC2.fillColor = 'black';
        textC2.fontSize = 25;
        textC2.fontFamily = 'Arial';
        textC2.fontWeight = 'bold';

        const xtextoAnchoC1 = espaciadoX + xcol1 + anchoColumna1 / 2 - 20;
        const ytextoAnchoC1 = espaciadoY + ycol1 - 5 + yAjustadoZC1;
        const textAnchoC1 = new paper.PointText(new paper.Point(xtextoAnchoC1, ytextoAnchoC1));
        textAnchoC1.content = (anchoColumna1 / 100).toFixed(2);
        textAnchoC1.fillColor = 'black';
        textAnchoC1.fontSize = 25;
        textAnchoC1.fontFamily = 'Arial';
        textAnchoC1.fontWeight = 'bold';

        const xtextoAnchoC2 = xcol2 + espaciadoX + anchoColumna2 / 2 - 20;
        const ytextoAnchoC2 = ycol2 + espaciadoY + yAjustadoZC2 - 5;
        const textAnchoC2 = new paper.PointText(new paper.Point(xtextoAnchoC2, ytextoAnchoC2));
        textAnchoC2.content = (anchoColumna2 / 100).toFixed(2);
        textAnchoC2.fillColor = 'black';
        textAnchoC2.fontSize = 25;
        textAnchoC2.fontFamily = 'Arial';
        textAnchoC2.fontWeight = 'bold';

        const xtextoAltoC1 = espaciadoX + xcol1 - 50;
        const ytextoAltoC1 = espaciadoY + ycol1 + altoColumna1 / 2 + yAjustadoZC1 + 12.5;
        const textAltoC1 = new paper.PointText(new paper.Point(xtextoAltoC1, ytextoAltoC1));
        textAltoC1.content = (altoColumna1 / 100).toFixed(2);
        textAltoC1.fillColor = 'black';
        textAltoC1.fontSize = 25;
        textAltoC1.fontFamily = 'Arial';
        textAltoC1.fontWeight = 'bold';

        const xtextoAltoC2 = xcol2 + espaciadoX + anchoColumna2 + 10;
        const ytextoAltoC2 = ycol2 + espaciadoY + altoColumna2 / 2 + yAjustadoZC2 + 12.5;
        const textAltoC2 = new paper.PointText(new paper.Point(xtextoAltoC2, ytextoAltoC2));
        textAltoC2.content = (altoColumna2 / 100).toFixed(2);
        textAltoC2.fillColor = 'black';
        textAltoC2.fontSize = 25;
        textAltoC2.fontFamily = 'Arial';
        textAltoC2.fontWeight = 'bold';

        const xlinea_inicio_c1 = espaciadoX + xcol1 + anchoColumna1;
        let ylinea_inicio_c1 = espaciadoY + ycol1 + yAjustadoZC1 + altoColumna1;
        let nivel = 0;
        if (altoColumna2 - altoColumna1 > 0) {
            if (ycol1 === 0) nivel = altoColumna2 - altoColumna1;
            else if (ycol1 + altoColumna1 === altoZapata1) nivel = 0;
            else nivel = altoColumna2 / 2 - altoColumna1 / 2;
        }
        const ylinea_final_c1 = ylinea_inicio_c1 + 50 + nivel;
        const lineC1 = new paper.Path.Line(
            new paper.Point(xlinea_inicio_c1, ylinea_inicio_c1),
            new paper.Point(xlinea_inicio_c1, ylinea_final_c1)
        );
        lineC1.strokeColor = 'red';
        lineC1.strokeWidth = 1;

        const xlinea_inicio_c2 = xcol2 + espaciadoX;
        let ylinea_inicio_c2 = espaciadoY + ycol2 + yAjustadoZC2 + altoColumna2;
        let nively = 0;
        if (altoColumna2 - altoColumna1 < 0) {
            if (ycol1 === 0) nively = altoColumna1 - altoColumna2;
            else if (ycol1 + altoColumna1 === altoZapata1) nively = 0;
            else nively = altoColumna1 / 2 - altoColumna2 / 2;
        }
        const ylinea_final_c2 = ylinea_inicio_c2 + 50 + nively;
        const lineC2 = new paper.Path.Line(
            new paper.Point(xlinea_inicio_c2, ylinea_inicio_c2),
            new paper.Point(xlinea_inicio_c2, ylinea_final_c2)
        );
        lineC2.strokeColor = 'red';
        lineC2.strokeWidth = 1;

        const xlinea_inicio_ln = xlinea_inicio_c1;
        const ylinea_inicio_ln = ylinea_final_c1;
        const xlinea_final_ln = xlinea_inicio_c2;
        const ylinea_final_ln = ylinea_final_c2;
        const lineLn = new paper.Path.Line(
            new paper.Point(xlinea_inicio_ln, ylinea_inicio_ln),
            new paper.Point(xlinea_final_ln, ylinea_final_ln)
        );
        lineLn.strokeColor = 'red';
        lineLn.strokeWidth = 2;

        const xtextoln = espaciadoX + xcol1 + anchoColumna1 + ln / 2;
        const ytextoln = ylinea_inicio_ln + 25;
        const textLn = new paper.PointText(new paper.Point(xtextoln, ytextoln));
        textLn.content = (ln / 100).toFixed(2) + ' m';
        textLn.fillColor = 'red';
        textLn.fontSize = 25;
        textLn.fontFamily = 'Arial';
        textLn.fontWeight = 'bold';

        paper.view.draw();
    }

    const inputs = document.querySelectorAll('#DataZapataconectada input[type="text"]');
    inputs.forEach(function (input) {
        input.addEventListener("input", llamarAGraficar);
    });
    inputs.forEach(function (input) {
        input.addEventListener("change", llamarAGraficar);
    });

    const btnPdf = document.getElementById('btn_pdf_predim');
    if (btnPdf) {
        btnPdf.addEventListener('click', function () {
            const zapataPdf = document.getElementById('zapataConectada_pdf');
            if (zapataPdf) {
                $(zapataPdf).printThis({
                    debug: false,
                    importCSS: true,
                    importStyle: true,
                    loadCSS: "",
                    pageTitle: "Zapata Conectada",
                    removeInline: false,
                    printDelay: 333,
                    header: null,
                    footer: null,
                    base: false,
                    formValues: true,
                    canvas: true,
                    doctypeString: '<!DOCTYPE html>',
                    removeScripts: false,
                    copyTagClasses: false
                });
            }
        });
    }
});