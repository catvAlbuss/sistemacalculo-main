export class Grid {
  constructor(canvas) {
    this.offestX = 0;
    this.offestY = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.size = 4;
    this.gridSpacing = 1;
    this.spacing = 10;
    this.resize(canvas);
  }

  resize(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.offestX = -this.width / 2;
    this.offestY = this.height / 2;
  }

  getState() {
    return {
      offestX: this.offestX,
      offestY: this.offestY,
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      width: this.width,
      height: this.height,
    };
  }

  restoreState(state) {
    if (!state) return;

    this.offestX = Number(state.offestX ?? this.offestX);
    this.offestY = Number(state.offestY ?? this.offestY);
    this.scaleX = Number(state.scaleX ?? this.scaleX);
    this.scaleY = Number(state.scaleY ?? this.scaleY);
  }

  zoomToScreenRect(start, end, padding = 40) {
    if (!start || !end) return;

    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);

    const rectWidth = right - left;
    const rectHeight = bottom - top;

    if (rectWidth < 8 || rectHeight < 8) {
      return;
    }

    const worldA = this.screenToWorld({ x: left, y: top });
    const worldB = this.screenToWorld({ x: right, y: bottom });

    const minX = Math.min(worldA.x, worldB.x);
    const maxX = Math.max(worldA.x, worldB.x);
    const minY = Math.min(worldA.y, worldB.y);
    const maxY = Math.max(worldA.y, worldB.y);

    const worldWidth = maxX - minX || 1;
    const worldHeight = maxY - minY || 1;

    const availableWidth = Math.max(this.width - padding * 2, 100);
    const availableHeight = Math.max(this.height - padding * 2, 100);

    const newScale = Math.min(
      availableWidth / worldWidth,
      availableHeight / worldHeight
    );

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.scaleX = newScale;
    this.scaleY = newScale;

    this.offestX = centerX - this.width / (2 * newScale);
    this.offestY = centerY + this.height / (2 * newScale);
  }

  draw(renderer, ctx, cad) {
    renderer.drawGrid(this, ctx, cad);
  }

  worldToScreen(p) {
    return {
      x: (p.x - this.offestX) * this.scaleX,
      y: (this.offestY - p.y) * this.scaleY,
    };
  }

  screenToWorld(p) {
    return {
      x: p.x / this.scaleX + this.offestX,
      y: this.offestY - p.y / this.scaleY,
    };
  }

  worldLineToScreen(line) {
    return {
      p1: this.worldToScreen({ x: line.x1, y: line.y1 }),
      p2: this.worldToScreen({ x: line.x2, y: line.y2 }),
    };
  }

  getVisibleWorldBounds() {
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRight = this.screenToWorld({
      x: this.width,
      y: this.height,
    });

    return {
      minX: topLeft.x,
      maxX: bottomRight.x,
      minY: bottomRight.y,
      maxY: topLeft.y,
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
}