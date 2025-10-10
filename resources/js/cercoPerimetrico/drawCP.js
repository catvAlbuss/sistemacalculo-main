import { x14_6v, r14_6v, l4_6v} from './cercoPerimetricoCalc.js';
// Función para dibujar el cuadrado
function dibujarCuadrado(x, y, t1 = '', t2 = '', p1, p2, txt = '') {
  // Crea un nuevo rectángulo
  /* var cuadrado = new paper.Rectangle(x, y, lado, lado); */
  // Definimos las dimensiones del cuadrado
  var squareWidth = x * 200;
  var squareHeight = y * 200;
  var squarePosition = new paper.Point(p1, p2);

  // Dibujamos el cuadrado
  var square = new paper.Path.Rectangle(
    squarePosition,
    new paper.Size(squareWidth, squareHeight)
  );
  square.strokeColor = 'black';

  // Dibujamos las dimensiones

  if (t1 != 0) {
    var textWidth = new paper.PointText(
      new paper.Point(squarePosition.x + squareWidth / 2, squarePosition.y - 10)
    );
    textWidth.content = t1 + 'm';
    textWidth.justification = 'center';
  }

  if (t2 != 0) {
    var textHeight = new paper.PointText(
      new paper.Point(
        squarePosition.x + squareWidth + 20,
        squarePosition.y + squareHeight / 2
      )
    );
    textHeight.content = t2 + 'm';
    textHeight.justification = 'left';
  }

  if (txt) {
    var text = new paper.PointText(
      new paper.Point(
        squarePosition.x /* + squareWidth / 4 */,
        squarePosition.y + squareHeight + 20
      )
    );
    text.content = txt;
  }

  // Dibujamos una línea que indica el ancho del cuadrado
  var line = new paper.Path.Line(
    squarePosition,
    new paper.Point(squarePosition.x + squareWidth, squarePosition.y)
  );
  line.strokeColor = 'red';

  paper.view.draw();
}

function dibujarLine(lineas) {
  // Dibujamos líneas dentro del cuadrado
  for (var i = 0; i < lineas.length; i++) {
    var startPoint = new paper.Point(lineas[i][0][0], lineas[i][0][1]);
    var endPoint = new paper.Point(lineas[i][1][0], lineas[i][1][1]);
    var line = new paper.Path.Line(startPoint, endPoint);
    line.strokeColor = 'blue';
  }
  paper.view.draw();
}

// Espera a que la página se cargue
window.onload = function () {
  var bv = 0;
  var hv = 0;
  var bc = 0;
  var hc = 0;
  var t = 0;
  var h = 0;
  var l = 0;
  // Obtiene el formulario
  var form1 = document.getElementById('datacercoperimetrico1');
  var form2 = document.getElementById('datacercoperimetrico2');

  // Agrega un event listener al submit del formulario
  form1.addEventListener('submit', function (evento) {
    // Evita el comportamiento por defecto del formulario
    evento.preventDefault();
    var canvas1 = document.getElementById('canva1');
    paper.setup(canvas1);
    /* paper.project.activeLayer.removeChildren(); */
    canvas1.classList.remove('d-none');
    // Obtiene el valor del input de lado
    bv = parseFloat(document.getElementById('bv').value);
    hv = parseFloat(document.getElementById('hv').value);
    bc = parseFloat(document.getElementById('bc').value);
    hc = parseFloat(document.getElementById('hc').value);
    t = parseFloat(document.getElementById('t').value);
    h = parseFloat(document.getElementById('h').value);
    l = parseFloat(document.getElementById('l').value);

    // Llama a la función para dibujar el cuadrado
    dibujarCuadrado(bv, hv, bv, hv, 100, 25, 'viga');
    dibujarCuadrado(bc, hc, bc, hc, 100, 125, 'columna');
    dibujarCuadrado(bv / 2, hv / 2, bv, hv, 100, 250);
    dibujarCuadrado(t / 2, h / 2, '', h, 100, 250 + (hv / 2) * 200);
    dibujarCuadrado(
      bc / 2,
      hc / 2,
      '',
      hc,
      100,
      (h / 2) * 200 + 250 + (hv / 2) * 200
    );
    dibujarCuadrado(l, hv, l, hv, 225, 25);
    dibujarCuadrado(l, h, '', 'hv', 225, hv * 200 + 25);
  });

  var canvas2 = document.getElementById('wallDesign');

  form2.addEventListener('submit', function (evento) {
    // Evita el comportamiento por defecto del formulario
    evento.preventDefault();
    paper.setup(canvas2);
    /* paper.project.activeLayer.removeChildren(); */
    canvas2.classList.remove('d-none');
    // Obtiene el valor del input de lado
    console.log(t, h, r14_6v);
    // Lista de líneas para dibujar dentro del cuadrado
    var lineas = [
      [
        [100, hv * 200 + 25],
        [100 + x14_6v * 200, hv * 200 + 25 + (h / 2) * 200],
      ],
      [
        [100 + x14_6v * 200, hv * 200 + 25 + (h / 2) * 200],
        [100, hv * 200 + 25 + h * 200],
      ],
      [
        [100 + x14_6v * 200, hv * 200 + 25 + (h / 2) * 200],
        [100 + x14_6v * 200 + r14_6v * 200, hv * 200 + 25 + (h / 2) * 200],
      ],
      [
        [100 + x14_6v * 200 + r14_6v * 200, hv * 200 + 25 + (h / 2) * 200],
        [100 + 2 * x14_6v * 200 + r14_6v * 200, hv * 200 + 25],
      ],
      [
        [100 + x14_6v * 200 + r14_6v * 200, hv * 200 + 25 + (h / 2) * 200],
        [100 + 2 * x14_6v * 200 + r14_6v * 200, hv * 200 + 25 + h * 200],
      ],
    ];

    // Llama a la función para dibujar el cuadrado
    dibujarLine(lineas);
    dibujarCuadrado(l4_6v, hv, l4_6v, hv, 100, 25);
    dibujarCuadrado(l4_6v, h, '', 'hv', 100, hv * 200 + 25);
  });

  // Inicializa Paper.js con el canvas
};
