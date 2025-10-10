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
}
