export class Grid {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.offestX = 0;
    this.offestY = 0;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.size = 4;
    this.gridSpacing = 0.5; // Define grid spacing in world coordinates
  }

  set(size, canvas) {
    this.width = this.canvas.width = canvas.width;
    this.height = this.canvas.height = canvas.height;
    this.offestX = -this.width / 2;
    this.offestY = this.height / 2;
    this.ctx.save();
    this.ctx.strokeStyle = "#282828";
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fill();
    this.ctx.restore();
    const ctx = canvas.getContext("2d");
    this.createGrid();
    this.draw(ctx);
    this.ctx.restore();
  }

  createGrid() {
    const ctx = this.ctx; // Assuming you're using a canvas context

    ctx.fillStyle = "dark";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const topLeft = this.screenToWorld({ x: 0, y: 0 });
    const bottomRigth = this.screenToWorld({ x: this.canvas.width, y: this.canvas.height });
    let start = this.worldToScreen({ x: 0, y: topLeft.y });
    let end = this.worldToScreen({ x: 0, y: bottomRigth.y });
    this.ctx.strokeStyle = "white";
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    start = this.worldToScreen({ x: topLeft.x, y: 0 });
    end = this.worldToScreen({ x: bottomRigth.x, y: 0 });
    this.ctx.strokeStyle = "white";
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  draw(ctx) {
    this.createGrid();
    ctx.drawImage(this.canvas, 0, 0);
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
}
