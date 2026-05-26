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

  // draw(renderer, ctx) {
  //   renderer.drawGrid(this, ctx);
  // }

  draw(ctx, cadSystem) {
    // Si no hay grid visible en la UI, salir
    if (!cadSystem.options.showGrid) {
      return;
    }

    // Verificar si hay un CAD importado comprobando el canvas del CAD
    const cadCanvas = document.querySelector(".ml-cad-container canvas");
    const hasCadContent = cadCanvas && cadCanvas.width > 0 && cadCanvas.height > 0;

    // Verificar si hay un CAD importado (si el motor tiene una vista válida)
    const hasCad = cadSystem.cadEngine && 
                   cadSystem.cadEngine.docManager && 
                   cadSystem.cadEngine.docManager.curDocument;
    
    // Si no hay CAD importado, NO dibujar el grid
    if (!hasCadContent || !hasCad) {
      return;
    }

     // También verificar que la vista exista
    const hasView = cadSystem.cadEngine && 
                    cadSystem.cadEngine.docManager && 
                    cadSystem.cadEngine.docManager.curView;
    
    if (!hasView) {
        return;
    }

    ctx.save();

    let topLeft, bottomRight;

    try {
      topLeft = cadSystem.screenToWorld({ x: 0, y: 0 });
      bottomRight = cadSystem.screenToWorld({ x: this.width, y: this.height });
      
      if (!topLeft || !bottomRight || isNaN(topLeft.x) || isNaN(topLeft.y) || isNaN(bottomRight.x) || isNaN(bottomRight.y)) {
        ctx.restore();
        return;
      }
    } catch (e) {
      ctx.restore();
      return;
    }

    // Limitar el rango para evitar bucles infinitos
    const minX = Math.max(-1000, topLeft.x);
    const maxX = Math.min(1000, bottomRight.x);
    const minY = Math.max(-1000, bottomRight.y);
    const maxY = Math.min(1000, topLeft.y);

    const spacing = this.gridSpacing;

    let startX = spacing - (minX % spacing);
    if (isNaN(startX) || !isFinite(startX)) startX = 0;

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillStyle = "rgba(200, 200, 200, 0.4)";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";

    const worldToScreen = (point) => {
      if (cadSystem.worldToScreen) {
        const result = cadSystem.worldToScreen(point);
        if (result && isFinite(result.x) && isFinite(result.y)) {
          return result;
        }
      }
      return this.worldToScreen(point);
    };

    // Dibujar líneas verticales
    for (let x = minX + startX; x <= maxX; x += spacing) {
      const start = worldToScreen({ x: x, y: minY });
      const end = worldToScreen({ x: x, y: maxY });
      if (start && end && isFinite(start.x) && isFinite(end.x)) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        if (Math.abs(x) % (spacing * 5) < 0.1 || Math.abs(x) < spacing) {
          ctx.fillText(`${x.toFixed(0)}`, end.x, this.height - 5);
        }
      }
    }

    ctx.textBaseline = "middle";

    // Dibujar líneas horizontales
    for (let y = minY + startX; y <= maxY; y += spacing) {
      const start = worldToScreen({ x: minX, y: y });
      const end = worldToScreen({ x: maxX, y: y });
      if (start && end && isFinite(start.y) && isFinite(end.y)) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        if (Math.abs(y) % (spacing * 5) < 0.1 || Math.abs(y) < spacing) {
          ctx.fillText(`${y.toFixed(0)}`, 5, start.y);
        }
      }
    }

    ctx.restore();
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
}
