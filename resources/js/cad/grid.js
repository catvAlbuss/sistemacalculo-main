export class Grid {
  constructor(canvas) {
    this.offestX = 0;
    this.offestY = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.size = 4;
    this.gridSpacing = 1; // Define grid spacing in world coordinates
    this.spacing = 10;
    this.resize(canvas);
  }

  resize(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.offestX = -this.width / 2;
    this.offestY = this.height / 2;
  }

  draw(renderer, ctx) {
    renderer.drawGrid(this, ctx);
  }

  worldToScreen(p) {
    return {
      x: (p.x - this.offestX) * this.scaleX,
      y: (this.offestY - p.y) * this.scaleY,
    };
  }

  zoomIn() {
    this.scaleX *= 1.1;
    this.scaleY *= 1.1;
  }

  zoomOut() {
    this.scaleX *= 0.9;
    this.scaleY *= 0.9;
  }

  zoomInToScreenPoint(point) {
    const prevMouse = this.screenToWorld({ x: point.x, y: point.y });
    this.zoomIn();
    const translatedMouse = this.screenToWorld({ x: point.x, y: point.y });
    this.offestX += prevMouse.x - translatedMouse.x;
    this.offestY += prevMouse.y - translatedMouse.y;
  }

  zoomOutToScreenPoint(point) {
    const prevMouse = this.screenToWorld({ x: point.x, y: point.y });
    this.zoomOut();
    const translatedMouse = this.screenToWorld({ x: point.x, y: point.y });
    this.offestX += prevMouse.x - translatedMouse.x;
    this.offestY += prevMouse.y - translatedMouse.y;
  }

  centerToView(view) {
    const dX = Math.abs(view.cminx - view.cmaxx);
    const scaleX = this.width / dX;
    this.scaleX = scaleX;
    this.scaleY = scaleX;

    const dY = Math.abs(view.cminy - view.cmaxy);
    const scaleY = this.height / dY;
    //this.scaleY = this.scaleX = scaleX < scaleY ? scaleX * 0.9 : scaleY * 0.9;
    this.scaleY = this.scaleX = scaleX < scaleY ? scaleX : scaleY;

    this.offestX = 0;
    this.offestY = 0;
    const range = this.screenToWorld({
      x: this.width * 0.5,
      y: this.height * 0.5,
    });

    this.offestX = (view.cminx + view.cmaxx) * 0.5 - range.x;
    this.offestY = (view.cminy + view.cmaxy) * 0.5 - range.y;
  }

  screenToWorld(p) {
    return {
      x: p.x / this.scaleX + this.offestX,
      y: this.offestY - p.y / this.scaleY,
    };
  }

  // resources/js/cad/grid.js - Añadir esta función

  // resources/js/cad/grid.js - Añadir esta función

  // resources/js/cad/grid.js - Reemplaza la función draw o añade esta

  // drawETABSGrid(ctx) {
  //   const spacing = 5; // Espaciado entre ejes en metros (como ETABS)

  //   // Calcular límites
  //   const startX = Math.floor(this.offestX / spacing) * spacing;
  //   const startY = Math.floor(this.offestY / spacing) * spacing;
  //   const endX = startX + this.width / this.scaleX;
  //   const endY = startY - this.height / this.scaleY;

  //   ctx.save();
  //   ctx.lineWidth = 0.5;
  //   ctx.font = "11px 'Segoe UI', Arial";
  //   ctx.shadowBlur = 0;

  //   // Colores estilo ETABS
  //   const gridColor = "#3a5a7a";
  //   const textColor = "#8aadcc";

  //   // Letras para ejes horizontales (A, B, C, D...)
  //   const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  //   // Dibujar líneas verticales y etiquetas
  //   let xIndex = 0;
  //   for (let x = startX; x <= endX; x += spacing) {
  //     const label = letters[xIndex % letters.length];
  //     const screenX = (x - this.offestX) * this.scaleX;

  //     // Línea vertical (tenue)
  //     ctx.beginPath();
  //     ctx.strokeStyle = gridColor;
  //     ctx.moveTo(screenX, 0);
  //     ctx.lineTo(screenX, this.height);
  //     ctx.stroke();

  //     // Etiqueta en la parte inferior (sin fondo)
  //     ctx.fillStyle = textColor;
  //     ctx.fillText(label, screenX - 4, this.height - 8);

  //     xIndex++;
  //   }

  //   // Dibujar líneas horizontales y etiquetas
  //   let yIndex = 1;
  //   for (let y = startY; y >= endY; y -= spacing) {
  //     const label = yIndex.toString();
  //     const screenY = (this.offestY - y) * this.scaleY;

  //     // Línea horizontal (tenue)
  //     ctx.beginPath();
  //     ctx.strokeStyle = gridColor;
  //     ctx.moveTo(0, screenY);
  //     ctx.lineTo(this.width, screenY);
  //     ctx.stroke();

  //     // Etiqueta en el borde izquierdo (sin fondo)
  //     ctx.fillStyle = textColor;
  //     ctx.fillText(label, 5, screenY + 4);

  //     yIndex++;
  //   }

  //   // Dibujar el origen (0,0) más visible
  //   const originX = (0 - this.offestX) * this.scaleX;
  //   const originY = (this.offestY - 0) * this.scaleY;

  //   ctx.beginPath();
  //   ctx.arc(originX, originY, 4, 0, 2 * Math.PI);
  //   ctx.fillStyle = "#ff6666";
  //   ctx.fill();
  //   ctx.fillStyle = "#ffffff";
  //   ctx.font = "bold 10px Arial";
  //   ctx.fillText("0,0", originX + 6, originY - 4);

  //   ctx.restore();
  // }
}
