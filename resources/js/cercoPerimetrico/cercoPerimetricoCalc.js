import {
    zonasSismicas,
    cargarCategorias,
    cargarTipo,
    cargarDep,
    cargarDis,
    cargarPro,
} from "./zonaSismicaCP.js";
import { cargarGeoCondition } from "./condicionesGeoCP.js";

import "print-this";

$(document).ready(function () {
    document
        .getElementById("btn_pdf_predim")
        .addEventListener("click", function () {
            // Selecciona el div que quieres imprimir
            $("#cercoPer_pdf").printThis({
                debug: false, // Mostrar la ventana de depuración
                importCSS: true, // Importar estilos CSS
                importStyle: true, // Importar estilos directamente desde las etiquetas <style>
                loadCSS: "", // Ruta al CSS adicional si lo necesitas
                pageTitle: "Vigas GN", // Título de la página impresa
                removeInline: false, // No eliminar los estilos en línea
                printDelay: 333, // Añadir un pequeño retraso antes de la impresión
                header: null, // HTML que aparecerá como encabezado en la impresión
                footer: null, // HTML que aparecerá como pie de página en la impresión
                base: false, // Usar la URL base para las rutas
                formValues: true, // Conservar los valores de los formularios
                canvas: true, // Incluir el contenido de los canvas (gráficos)
                loadCSS: "", // Puedes especificar rutas de CSS adicionales si es necesario
                copyTagClasses: false, // No copiar las clases de las etiquetas HTML
                imageTimeout: 15000, // Establecer un timeout para la carga de imágenes
                removeScripts: false, // No eliminar las etiquetas <script>
                doctypeString: "<!DOCTYPE html>", // Doctype de la impresión
                printContainer: true, // Asegurar que el contenedor se imprima con todas las imágenes y gráficos
            });
        });
});

export var r14_6v = 0;
export var x14_6v = 0;
export var l4_6v = 0;

document.addEventListener("DOMContentLoaded", function () {
    const form1 = document.getElementById("datacercoperimetrico1");
    var formData = {};
    var fdc = 0;
    var fdy = 0;
    var yc = 0;
    var fdt = 0;
    var ya = 0;
    var ycs = 0;
    var h = 0;
    var l = 0;
    var t = 0;
    var rev = 0;
    var hv = 0;
    var bv = 0;
    var hc = 0;
    var bc = 0;
    var rec = 0;

    form1.addEventListener("submit", (event) => {
        event.preventDefault();

        formData = new FormData(form1);

        /* Materiales */
        fdc = parseFloat(formData.get("fdc"));
        fdy = parseFloat(formData.get("fdy"));
        yc = parseFloat(formData.get("yc"));
        fdt = parseFloat(formData.get("fdt"));
        ya = parseFloat(formData.get("ya"));
        ycs = parseFloat(formData.get("ycs"));
        /* Dimensiones del cerco */
        h = parseFloat(formData.get("h"));
        l = parseFloat(formData.get("l"));
        t = parseFloat(formData.get("t"));
        rev = parseFloat(formData.get("rev"));
        hv = parseFloat(formData.get("hv"));
        bv = parseFloat(formData.get("bv"));
        hc = parseFloat(formData.get("hc"));
        bc = parseFloat(formData.get("bc"));
        rec = parseFloat(formData.get("rec"));

        /* Datos o librerías para generar imágenes */
    });

    // Procesar los datos del formulario

    //3.1
    /*  console.log(zonasSismicas); */
    cargarDep(document.getElementById("depaSelect"), zonasSismicas);

    /* var departamento = document.getElementById('depaSelect').value; */
    var departamento = document.getElementById("depaSelect");
    var provincia = document.getElementById("provSelect");
    var distrito = document.getElementById("distSelect");
    var zonsis = document.getElementById("zonsis");
    var zPrev = document.getElementById("z");

    var depValue = 0;
    var depText = "";
    var proText = "";
    zonsis.value = "";
    zPrev.value = "";

    departamento.addEventListener("change", function () {
        depValue = this.value;
        const selectedOption = this.options[this.selectedIndex];
        depText = selectedOption.text;
        cargarPro(provincia, zonasSismicas[depValue][`${depText}`]);
        zonsis.value = "";
        zPrev.value = "";
    });

    provincia.addEventListener("change", function () {
        var proValue = this.value;
        const selectedOption = this.options[this.selectedIndex];
        proText = selectedOption.text;
        cargarDis(
            distrito,
            zonasSismicas[depValue][`${depText}`][proValue][`${proText}`]
        );
        zonsis.value = "";
        zPrev.value = "";
    });

    distrito.addEventListener("change", function () {
        var disValue = this.value;
        const selectedOption = this.options[this.selectedIndex];
        var disText = selectedOption.text;
        var depValue = departamento.value;
        var proValue = provincia.value;
        if (depValue && proValue && disValue) {
            var zonaSismica = parseInt(
                zonasSismicas[depValue][`${depText}`][proValue][`${proText}`][
                    `${disValue}`
                ][`${disText}`]
            );
            zonsis.value = zonaSismica;
            zonaSismica == 4
                ? (zPrev.value = 0.45)
                : zonaSismica == 3
                ? (zPrev.value = 0.35)
                : zonaSismica == 2
                ? (zPrev.value = 0.25)
                : zonaSismica == 1
                ? (zPrev.value = 0.1)
                : (zPrev.value = 7);
        } else {
            zonsis.value = "Seleccione.";
        }
    });

    //3.2
    var perSueTip = document.getElementById("pstSelect");
    var tipo3_1 = document.getElementById("tipo3_1");
    var vs3_1 = document.getElementById("vs3_1");
    var s3_1 = document.getElementById("s3_1");
    var tp3_1 = document.getElementById("tp3_1");
    var n603_1 = document.getElementById("n603_1");
    var tl3_1 = document.getElementById("tl3_1");
    var su3_1 = document.getElementById("su3_1");
    var qu3_1 = document.getElementById("qu3_1");
    var text_3_1 = document.getElementById("text_3_1");
    /* Al cargar */
    cargarGeoCondition(
        perSueTip.value,
        text_3_1,
        tipo3_1,
        vs3_1,
        s3_1,
        tp3_1,
        n603_1,
        tl3_1,
        su3_1,
        qu3_1
    );

    /* On change */
    perSueTip.addEventListener("change", function () {
        cargarGeoCondition(
            perSueTip.value,
            text_3_1,
            tipo3_1,
            vs3_1,
            s3_1,
            tp3_1,
            n603_1,
            tl3_1,
            su3_1,
            qu3_1
        );
    });

    //3.3
    var category = document.getElementById("catediSelect");
    var type = document.getElementById("tipediSelect");
    var factor_u = document.getElementById("factor_u");
    var text1 = document.getElementById("text1");

    cargarCategorias(category);
    category.addEventListener("change", function () {
        cargarTipo(type, category.value, factor_u, text1);
    });

    /* Form 2 values */
    const form2 = document.getElementById("datacercoperimetrico2");
    var formData2 = {};
    var z = 0;
    var c1 = 0;
    var d5_3_3 = 0;
    var ite5b = 0;
    var muv5_3 = 0;
    var v5_2 = 0;
    var b5_3_3 = 0;

    form2.addEventListener("submit", (event) => {
        event.preventDefault();

        formData2 = new FormData(form2);

        /* zona sismica z value */
        z = parseFloat(formData2.get("z"));
        c1 = parseFloat(formData2.get("c1"));

        /* 4.1 This will give answers after form1 is submitted*/
        if (formData) {
            let ba = l / h;
            let a = Math.min(l, h);
            let m = 0;
            let u = parseFloat(factor_u.innerText);

            // Datos conocidos
            let arregloX = [1, 1.2, 1.4, 1.6, 1.8, 2, 3, 100000]; // Valores conocidos de x
            let arregloY = [
                0.0479, 0.0627, 0.0755, 0.0862, 0.0948, 0.1017, 0.118, 0.125,
            ]; // Valores conocidos de y

            // Valor a interpolar
            let x = ba;

            // Buscar los dos valores conocidos más cercanos a x
            let i = 0;
            while (i < arregloX.length && arregloX[i] < x) {
                i++;
            }

            // Verificar si el valor de x está en el arreglo o entre dos valores conocidos
            if (arregloX[i] == x) {
                m = arregloY[i];
            } else {
                // Interpolar entre los valores conocidos más cercanos
                m = interpolacion(
                    arregloX[i - 1],
                    arregloY[i - 1],
                    arregloX[i],
                    arregloY[i],
                    x
                );
            }

            /* 4.1  */
            var baResult = document.getElementById("ba");
            var aResult = document.getElementById("a");
            var mResult = document.getElementById("m");
            var fnValues = document.getElementById("fnValue");
            var fdtValues = document.getElementById("fdtValue");
            if (ba && a && m) {
                baResult.innerText = ba.toFixed(2);
                aResult.innerText = a;
                mResult.innerText = m;
            }

            /* 4.2 */
            var res4_2 = document.getElementById("res4_2");
            let w = 0.8 * z * u * c1 * ya * (t + rev);
            res4_2.innerText = w.toFixed(2);

            /* 4.3 */
            var res4_3 = document.getElementById("res4_3");
            let ms = m * w * Math.pow(a, 2);
            res4_3.innerText = ms.toFixed(2);

            /* 4.4 */
            var res4_4 = document.getElementById("res4_4");
            let fn = (6 * ms) / Math.pow(t, 2);
            res4_4.innerText = fn.toFixed(2);

            /* 4.5 */
            var res4_5 = document.getElementById("res4_5");
            fnValues.innerText = fn.toFixed(2);
            fdtValues.innerText = 10000 * fdt;
            let condText =
                fn < 10000 * fdt
                    ? "El espesor y longitud del muro de albañileria es adecuada"
                    : "Aumentar el espesor o reducir la longitud del muro de albañileria";
            res4_5.innerText = condText;

            /* 4.4 */
            var l4_6 = document.getElementById("l4_6");
            var x14_6 = document.getElementById("x14_6");
            var r14_6 = document.getElementById("r14_6");
            var he24_6 = document.getElementById("he24_6");
            var bv4_6 = document.getElementById("bv4_6");

            l4_6v = l + bc;
            l4_6.innerText = l4_6v.toFixed(2);

            x14_6v = (h / 2) * Math.tan(Math.PI / 4);
            x14_6.innerText = x14_6v.toFixed(2);

            r14_6v = l4_6v - 2 * x14_6v;
            r14_6.innerText = r14_6v.toFixed(2);

            he24_6.innerText = (h / 2).toFixed(2);
            bv4_6.innerText = bv.toFixed(2);

            // Shw1, 2, 3, ,4, wppalb
            document.getElementById("shw1").innerText = z;
            document.getElementById("shw2").innerText = u;
            document.getElementById("shw3").innerText = c1;
            document.getElementById("shw4").innerText =
                ((t + rev) * ya * (h / 2)) / 1000;
            var wppalb = (0.8 * z * u * c1 * ((t + rev) * ya * (h / 2))) / 1000;

            var wppalbV = document.getElementById("wppalb");
            wppalbV.innerText = wppalb.toFixed(4);

            // Shww1, 2, 3, ,4, wppv
            document.getElementById("shww1").innerText = z;
            document.getElementById("shww2").innerText = u;
            document.getElementById("shww3").innerText = c1;
            document.getElementById("shww4").innerText = (yc / 1000) * hv * bv;
            var wppv = 0.8 * z * u * c1 * (yc / 1000) * hv * bv;
            var wppvV = document.getElementById("wppv");
            wppvV.innerText = wppv.toFixed(4);

            // Shw1b, 2b, 3b, ,4b, wppalbb
            document.getElementById("shw1b").innerText = z;
            document.getElementById("shw2b").innerText = u;
            document.getElementById("shw3b").innerText = c1;
            document.getElementById("shw4b").innerText =
                ((t + rev) * ya * (h / 2)) / 1000;

            var wppalbVV = document.getElementById("wppalbb");
            wppalbVV.innerText = wppalb.toFixed(4);

            // Shwww1, 2, 3, ,4, wppc
            document.getElementById("shwww1").innerText = z;
            document.getElementById("shwww2").innerText = u;
            document.getElementById("shwww3").innerText = c1;
            document.getElementById("shwww4").innerText = (yc / 1000) * hc * bc;
            var wppc = 0.8 * z * u * c1 * (yc / 1000) * hc * bc;
            var wppcV = document.getElementById("wppc");
            wppcV.innerText = wppc.toFixed(4);

            /* 5.1 */
            document.getElementById("momtum").innerText = l + bc;

            /* col 1 */
            /* =-M152*M14/96*(M14+L144)*(5-L144^2/L142^2) */
            var momtum1 =
                -wppalb *
                (l / 96) *
                (l + r14_6v) *
                (5 - Math.pow(r14_6v, 2) / Math.pow(l4_6v, 2));
            document.getElementById("momtum1").innerText = momtum1.toFixed(3);

            /* =-L154*L142^2/12 */
            var momtum2 = (-wppv * Math.pow(l4_6v, 2)) / 12;
            document.getElementById("momtum2").innerText = momtum2.toFixed(3);

            /* =+SUMA(E183:E184) */
            var momtum3 = momtum1 + momtum2;
            document.getElementById("momtum3").innerText = momtum3.toFixed(3);

            /* col 2a */
            /* =+M152*M14/96*(M14+L144)*(5-L144^2/L142^2) */
            var momtum4a =
                wppalb *
                (l / 96) *
                (l + r14_6v) *
                (5 - Math.pow(r14_6v, 2) / Math.pow(l4_6v, 2));
            document.getElementById("momtum4a").innerText = momtum4a.toFixed(4);

            /* =-L154*L142^2/12 */
            var momtum5a = (wppv * Math.pow(l4_6v, 2)) / 12;
            document.getElementById("momtum5a").innerText = momtum5a.toFixed(4);

            /* =+SUMA(G183:G184) */
            var momtum6a = momtum4a + momtum5a;
            document.getElementById("momtum6a").innerText = momtum6a.toFixed(4);

            /* col 2b */
            /* =-M152*M14/96*(M14+L144)*(5-L144^2/L142^2) */
            var momtum4b = momtum1;
            document.getElementById("momtum4b").innerText = momtum4b.toFixed(3);

            /* =-L154*L142^2/12 */
            var momtum5b = momtum2;
            document.getElementById("momtum5b").innerText = momtum5b.toFixed(3);

            /* =+SUMA(H183:H184) */
            var momtum6b = momtum4b + momtum5b;
            document.getElementById("momtum6b").innerText = momtum6b.toFixed(3);

            /* col 3a */
            /* =+M152*M14/96*(M14+L144)*(5-L144^2/L142^2) */
            var momtum7a = momtum4a;
            document.getElementById("momtum7a").innerText = momtum7a.toFixed(4);

            /* =-L154*L142^2/12 */
            var momtum8a = momtum5a;
            document.getElementById("momtum8a").innerText = momtum8a.toFixed(4);

            /* =+SUMA(J183:J184) */
            var momtum9a = momtum7a + momtum8a;
            document.getElementById("momtum9a").innerText = momtum9a.toFixed(4);

            /* col 2b */
            /* =-M152*M14/96*(M14+L144)*(5-L144^2/L142^2) */
            var momtum7b = momtum4b;
            document.getElementById("momtum7b").innerText = momtum7b.toFixed(3);

            /* =-L154*L142^2/12 */
            var momtum8b = momtum5b;
            document.getElementById("momtum8b").innerText = momtum8b.toFixed(3);

            /* =+SUMA(K183:K184) */
            var momtum9b = momtum7b + momtum8b;
            document.getElementById("momtum9b").innerText = momtum9b.toFixed(3);

            /* col 4 */
            /* =+M152*M14/96*(M14+L144)*(5-L144^2/L142^2) */
            var momtum10 = momtum4a;
            document.getElementById("momtum10").innerText = momtum10.toFixed(4);

            /* =-L154*L142^2/12 */
            var momtum11 = momtum5a;
            document.getElementById("momtum11").innerText = momtum11.toFixed(4);

            /* =+SUMA(J183:J184) */
            var momtum12 = momtum10 + momtum11;
            document.getElementById("momtum12").innerText = momtum12.toFixed(4);

            /* 5_2 diagrama 1*/
            /* =+'Metodo de hardy cross'!D24 */
            var methard = document.getElementById("hc5_2");
            var metharcro = 0;
            methard.addEventListener("change", function () {
                metharcro = parseFloat(this.value);
                /* =+$M$14+$M$20 */
                var val5_2 = l4_6v;

                /* RB=+(((L142+L144)/2*M152+L142*L154)*F192/2+H190)/F192 */
                var rb5_2 =
                    (((((l4_6v + r14_6v) / 2) * wppalb + l4_6v * wppv) *
                        val5_2) /
                        2 +
                        metharcro) /
                    val5_2;

                /* RA=+(L142+L144)/2*M152+L142*L154-R193 */
                var ra5_2 =
                    ((l4_6v + r14_6v) / 2) * wppalb + l4_6v * wppv - rb5_2;

                /* RB=RC=+((L142+L144)/2*M152+L142*L154)/2 */
                var rbrc = (((l4_6v + r14_6v) / 2) * wppalb + l4_6v * wppv) / 2;

                /* show values in html */
                /* =+'Metodo de hardy cross'!D24 */
                document.getElementById("hc5_2").innerText =
                    metharcro.toFixed(4);

                /* similar values */
                document.getElementById("val5_2").innerText = val5_2;

                /* 4 different values */
                /* =+$R$194 = RA */
                document.getElementById("ra5_2").innerText = ra5_2.toFixed(2);

                /* =+U193+R193 =RBRC + RB*/
                document.getElementById("rb5_2").innerText = (
                    rbrc + rb5_2
                ).toFixed(2);

                /* =+R193+U193 = RB + RBRC */
                document.getElementById("rc5_2").innerText = (
                    rb5_2 + rbrc
                ).toFixed(2);

                /* =+$R$194 = RA */
                document.getElementById("rd5_2").innerText = ra5_2.toFixed(2);

                /* 5.2 diagram 2 */
                /* =+E196 */
                var t5_2 = ra5_2;
                /* =-D212+(L142+L144)/2*M152+L142*L154 */
                var v5_2 =
                    -t5_2 + ((l4_6v + r14_6v) / 2) * wppalb + l4_6v * wppv;
                /* =+H196-H206 */
                var tt5_2 = rbrc + rb5_2 - v5_2;
                var vv5_2 = rbrc + rb5_2 - v5_2;
                var ttt5_2 =
                    -t5_2 + ((l4_6v + r14_6v) / 2) * wppalb + l4_6v * wppv;
                var vvv5_2 = t5_2;

                /* show values in html */
                document.getElementById("v5_2").innerText = v5_2.toFixed(4);
                document.getElementById("vv5_2").innerText = vv5_2.toFixed(4);
                document.getElementById("vvv5_2").innerText = vvv5_2.toFixed(4);
                document.getElementById("val25_2").innerText = l4_6v;
                document.getElementById("t5_2").innerText = t5_2.toFixed(4);
                document.getElementById("tt5_2").innerText = tt5_2.toFixed(4);
                document.getElementById("ttt5_2").innerText = ttt5_2.toFixed(4);

                /* 5.3 */
                var mmaxv = metharcro;
                muv5_3 = 1.25 * mmaxv;

                /* show values in html */
                document.getElementById("mmaxv5_3").innerText =
                    mmaxv.toFixed(4);
                document.getElementById("muv5_3").innerText = muv5_3.toFixed(4);

                /* 5.3.1.  Cálculo de acero mínimo */
                var asmin = (14 / fdy) * 100 * 100 * hv * (bv - rec);
                console.log(asmin);
                document.getElementById("asmin").innerText = asmin.toFixed(4);

                /* 5.3.2.  Cálculo de acero máximo */
                var asmax = 0.025 * 100 * 100 * hv * (bv - rec);
                document.getElementById("asmax").innerText = asmax.toFixed(4);

                /* 5.3.3.  Cálculo de acero por flexión */
                var mu5_3_3 = muv5_3 * Math.pow(10, 5);
                document.getElementById("mu5_3_3").innerText =
                    mu5_3_3.toFixed(2);
                d5_3_3 = (bv - rec) * 100;
                document.getElementById("d5_3_3").innerText = d5_3_3.toFixed(2);
                b5_3_3 = 100 * hv;
                document.getElementById("b5_3_3").innerText = b5_3_3.toFixed(2);
                var fy5_3_3 = fdy;
                document.getElementById("fy5_3_3").innerText =
                    fy5_3_3.toFixed(2);
                var fdc5_3_3 = fdc;
                document.getElementById("fdc5_3_3").innerText =
                    fdc5_3_3.toFixed(2);

                /* 5.3.3 iteraciones */
                /* ite 1 */
                var ite1a = mu5_3_3 / (0.9 * fy5_3_3 * (d5_3_3 - d5_3_3 / 10));
                document.getElementById("ite1a").innerText = ite1a.toFixed(2);
                var ite1b = (ite1a * fy5_3_3) / (0.85 * fdc5_3_3 * b5_3_3);
                document.getElementById("ite1b").innerText = ite1b.toFixed(2);
                /* ite 2 */
                var ite2a = mu5_3_3 / (0.9 * fy5_3_3 * (d5_3_3 - ite1b / 2));
                document.getElementById("ite2a").innerText = ite2a.toFixed(2);
                var ite2b = (ite2a * fy5_3_3) / (0.85 * fdc5_3_3 * b5_3_3);
                document.getElementById("ite2b").innerText = ite2b.toFixed(2);
                /* ite 3 */
                var ite3a = mu5_3_3 / (0.9 * fy5_3_3 * (d5_3_3 - ite2b / 2));
                document.getElementById("ite3a").innerText = ite3a.toFixed(2);
                var ite3b = (ite3a * fy5_3_3) / (0.85 * fdc5_3_3 * b5_3_3);
                document.getElementById("ite3b").innerText = ite3b.toFixed(2);
                /* ite 4 */
                var ite4a = mu5_3_3 / (0.9 * fy5_3_3 * (d5_3_3 - ite3b / 2));
                document.getElementById("ite4a").innerText = ite4a.toFixed(2);
                var ite4b = (ite4a * fy5_3_3) / (0.85 * fdc5_3_3 * b5_3_3);
                document.getElementById("ite4b").innerText = ite4b.toFixed(2);
                /* ite 5 */
                var ite5a = mu5_3_3 / (0.9 * fy5_3_3 * (d5_3_3 - ite4b / 2));
                document.getElementById("ite5a").innerText = ite5a.toFixed(2);
                ite5b = (ite5a * fy5_3_3) / (0.85 * fdc5_3_3 * b5_3_3);
                document.getElementById("ite5b").innerText = ite5b.toFixed(2);

                /* =SI(F242<I220,"Usar un área de refuerzo ≥ As min","Usar un área de refuerzo ≥ As") */
                var con5_3_3 =
                    ite5a < asmin
                        ? "Usar un área de refuerzo ≥ As min"
                        : "Usar un área de refuerzo ≥ As";
                document.getElementById("con5_3_3").innerText = con5_3_3;
                /* 5.4 */
                var vmaxv5_4_1 = v5_2;
                var vuv5_4_1 = 1.25 * vmaxv5_4_1;
                document.getElementById("vmaxv5_4_1").innerText =
                    vmaxv5_4_1.toFixed(4);
                document.getElementById("vuv5_4_1").innerText =
                    vuv5_4_1.toFixed(4);
                var vrv5_4_1 =
                    (0.8 * 0.53 * Math.sqrt(fdc) * b5_3_3 * d5_3_3) / 1000;

                document.getElementById("vrv5_4_1").innerText =
                    vrv5_4_1.toFixed(4);
                document.getElementById("a5_4_1").innerText =
                    vuv5_4_1.toFixed(4);
                document.getElementById("b5_4_1").innerText =
                    vrv5_4_1.toFixed(4);
                /* =+SI(J270>G270,"El peralte de la viga es adecuado, Usar estribos mínimos","Aumentar peralte de la viga") */
                document.getElementById("con5_4_2").innerText =
                    vrv5_4_1 > vuv5_4_1
                        ? "El peralte de la viga es adecuado, Usar estribos mínimos"
                        : "Aumentar peralte de la viga";
            });
        }

        /* Datos o librerías para generar imágenes */
    });

    var var_usa = document.getElementById("var_usa");
    var var_med = document.getElementById("var_med");
    var var_usaV = 0;
    var var_medV = "";
    var as5_3_4 = 0;
    var mrv5_3_5 = 0;

    var_usa.addEventListener("change", function () {
        var_usaV = parseFloat(this.value);
        if (var_medV == 0) {
            calcularAceroUsar(var_usaV);
        } else {
            calcularAceroUsar(var_medV, var_usaV);
        }
    });

    var_med.addEventListener("change", function () {
        var_medV = parseFloat(this.value);
        if (var_usaV == 0) {
            calcularAceroUsar(var_medV);
        } else {
            calcularAceroUsar(var_medV, var_usaV);
        }
    });

    calcularAceroUsar();

    /* 5.3.4 */
    function calcularAceroUsar(var_medV = 1, var_usaV = 0.32) {
        as5_3_4 = var_medV * var_usaV;
        mrv5_3_5 = (0.9 * as5_3_4 * fdy * (d5_3_3 / 100 - ite5b / 200)) / 1000;

        document.getElementById("as5_3_4").innerText = as5_3_4.toFixed(4);
        document.getElementById("mrv5_3_5").innerText = mrv5_3_5.toFixed(4);
        document.getElementById("repvb5_3_5").innerText = muv5_3.toFixed(4);
        document.getElementById("repva5_3_5").innerText = mrv5_3_5.toFixed(4);
        /* =+SI(J254>G254,"El peralte de la viga es adecuado","Aumentar peralte de la viga") */
        document.getElementById("con5_3_5").innerText =
            mrv5_3_5 > muv5_3
                ? "El peralte de la viga es adecuado"
                : "Aumentar peralte de la viga";
    }
    var var_usa6_3_4 = document.getElementById("var_usa6_3_4");
    var var_med6_3_4 = document.getElementById("var_med6_3_4");
    var var_usaV6_3_4 = 0;
    var var_medV6_3_4 = "";
    var as6_3_4 = 0;
    var mrc6_3_5 = 0;

    var_usa6_3_4.addEventListener("change", function () {
        var_usaV6_3_4 = parseFloat(this.value);
        if (var_medV6_3_4 == 0) {
            calcularAceroUsar(var_usaV6_3_4);
        } else {
            calcularAceroUsar(var_medV6_3_4, var_usaV6_3_4);
        }
    });

    var_med6_3_4.addEventListener("change", function () {
        var_medV6_3_4 = parseFloat(this.value);
        if (var_usaV6_3_4 == 0) {
            calcularAceroUsar(var_medV6_3_4);
        } else {
            calcularAceroUsar(var_medV6_3_4, var_usaV6_3_4);
        }
    });

    calcularAceroUsar();

    /* 5.3.4 */
    function calcularAceroUsar(var_medV6_3_4 = 1, var_usaV6_3_4 = 0.32) {
        as6_3_4 = var_medV6_3_4 * var_usaV6_3_4;
        mrc6_3_5 = (0.9 * as6_3_4 * fdy * (hc - rec - ite5b6_33 / 200)) / 1000;

        document.getElementById("as6_3_4").innerText = as6_3_4.toFixed(4);
        document.getElementById("mrc6_3_5").innerText = mrc6_3_5.toFixed(4);
    }
    // Ejemplo: enviar los datos a un servidor
    /*  const datos = {
      nombre,
      email,
      mensaje,
    }; */

    /*  fetch('/enviar-formulario', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
      .then((response) => {
        if (response.ok) {
          alert('Formulario enviado correctamente');
        } else {
          alert('Error al enviar el formulario');
        }
      })
      .catch((error) => {
        console.error(error);
      }); */

    /*   $('#data2').submit(function (event) {
    event.preventDefault();
    var formData = $(this).serialize();
    $.ajax({
      type: 'POST',
      url: '../controlador/procesar.php',
      data: formData,
      success: function (response) {
        console.log(response);
        $('#Obtenerzonsiss').html(response);
      },
    });
  });
}); */

    function interpolacion(x1, y1, x2, y2, x) {
        // Verificar que el valor de x esté dentro del rango x1 y x2
        if (x < x1 || x > x2) {
            return "El valor de x está fuera del rango.";
        }

        // Calcular la interpolación lineal
        let y = y1 + ((y2 - y1) / (x2 - x1)) * (x - x1);

        return y.toFixed(4);
    }
});
