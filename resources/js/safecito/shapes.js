import { pointDistance } from "./utils.js";

function imgFromSVG(svg) {
  // Create an image from the SVG string
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  return img;
}

const soporteUno = `
<svg viewBox="90 20 70 60" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
  <polygon points="120,20 140,60 100,60" fill="none" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="150" y2="60" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="100" y2="70" stroke="white" stroke-width="2"/>
  <line x1="100" y1="60" x2="110" y2="70" stroke="white" stroke-width="2"/>
  <line x1="110" y1="60" x2="120" y2="70" stroke="white" stroke-width="2"/>
  <line x1="120" y1="60" x2="130" y2="70" stroke="white" stroke-width="2"/>
  <line x1="130" y1="60" x2="140" y2="70" stroke="white" stroke-width="2"/>
  <line x1="140" y1="60" x2="150" y2="70" stroke="white" stroke-width="2"/>
  <line x1="150" y1="60" x2="160" y2="70" stroke="white" stroke-width="2"/>
</svg>`;

const soporteDos = `
<svg viewBox="90 20 70 60" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
  <circle cx="120" cy="40" r="20" fill="none" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="150" y2="60" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="100" y2="70" stroke="white" stroke-width="2"/>
  <line x1="100" y1="60" x2="110" y2="70" stroke="white" stroke-width="2"/>
  <line x1="110" y1="60" x2="120" y2="70" stroke="white" stroke-width="2"/>
  <line x1="120" y1="60" x2="130" y2="70" stroke="white" stroke-width="2"/>
  <line x1="130" y1="60" x2="140" y2="70" stroke="white" stroke-width="2"/>
  <line x1="140" y1="60" x2="150" y2="70" stroke="white" stroke-width="2"/>
  <line x1="150" y1="60" x2="160" y2="70" stroke="white" stroke-width="2"/>
</svg>`;

export const soportes = {
  soporteUno: imgFromSVG(soporteUno),
  soporteDos: imgFromSVG(soporteDos),
};

export class Point {
  constructor(x, y, visible, color) {
    this.x = x;
    this.y = y;
    this.visible = visible;
    this.color = color;
  }
}

export class Shape {
  constructor(parseUrl) {
    this.reset(parseUrl);
    this.calcularPropiedades();
  }

  reset(_) {
    this.points = [];
  }

  addPointToEnd(position, grid) {
    const begin = this.points[0];
    if (this.points.length != 0 && pointDistance(grid.worldToScreen(begin), position) <= 5) {
      // Do noting if the add location is the same as the last point
      return true;
    }
    this.addPointAfterIndex(this.points.length - 1, grid.screenToWorld(position));
    return false;
  }

  addPointAfterIndex(index, position) {
    this.points.splice(index + 1, 0, new Point(position.x, position.y, true, null));
  }

  getLastPoint() {
    if (this.points.length === 0) {
      return null;
    }

    this.last_point = this.points[this.points.length - 1];
    return {
      x: this.last_point.x,
      y: this.last_point.y,
    };
  }

  deletePoint(index) {
    this.points.splice(index, 1);
  }

  colorizePoint(index, color) {
    this.points[index].color = color;
  }

  draw(grid_, ctx, handleIsSelected) {
    var i, p, color, line_color;

    ctx.save();

    // Draw lines
    if (this.points.length >= 2) {
      line_color = "white";
      ctx.strokeStyle = line_color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < this.points.length; i++) {
        p = grid_.worldToScreen(this.points[i]);
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
          continue;
        }
        /*         ctx.fillStyle = "white";
        ctx.font = "16pt arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const midPoint = grid_.worldToScreen({ x: (this.points[i - 1].x + this.points[i].x) * 0.5, y: (this.points[i - 1].y + this.points[i].y) * 0.5 });
        const length = pointDistance(this.points[i - 1], this.points[i]);
        ctx.fillText(`${length.toFixed(2)}`, midPoint.x, midPoint.y); */
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.strokeStyle = line_color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Draw vertex handles
    for (i = 0; i < this.points.length; i++) {
      /* if (handleIsSelected && i === selectedHandleIndex) {
        color = "red";
      } else  */ if (i == this.points.length - 1) {
        color = "blue";
      } else if (i == 0) {
        color = "cyan";
      } else {
        color = "red";
      }
      p = grid_.worldToScreen(this.points[i]);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, grid_.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  calcularPropiedades() {
    let P0 = 0;
    let A0 = 0;
    let IX0 = 0;
    let IY0 = 0;
    let IXY0 = 0;
    let MX0 = 0;
    let MY0 = 0;
    let XC = 0;
    let YC = 0;
    for (let index = 0; index < this.points.length - 1; index++) {
      const x1 = this.points[index].x;
      const x2 = this.points[index + 1].x;
      const y1 = this.points[index].y;
      const y2 = this.points[index + 1].y;

      XC = (x1 * y2 - x2 * y1) * (x2 + x1) + XC;
      YC = (x1 * y2 - x2 * y1) * (y2 + y1) + YC;
      A0 = x1 * y2 - x2 * y1 + A0;
      P0 = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5 + P0;
      MX0 = (x1 - x2) * (y2 ** 2 + y2 * y1 + y1 ** 2) + MX0;
      MY0 = (y1 - y2) * (x2 ** 2 + x2 * x1 + x1 ** 2) + MY0;
      IY0 = (x1 * y2 - x2 * y1) * (x2 ** 2 + x2 * x1 + x1 ** 2) + IY0;
      IX0 = (x1 * y2 - x2 * y1) * (y2 ** 2 + y2 * y1 + y1 ** 2) + IX0;
      IXY0 = (x1 * y2 - x2 * y1) * (2 * x2 * y2 + x2 * y1 + x1 * y2 + 2 * x1 * y1) + IXY0;
    }
    if (this.points.length !== 0) {
      const x1 = this.points[this.points.length - 1].x;
      const x2 = this.points[0].x;
      const y1 = this.points[this.points.length - 1].y;
      const y2 = this.points[0].y;

      XC = (x1 * y2 - x2 * y1) * (x2 + x1) + XC;
      YC = (x1 * y2 - x2 * y1) * (y2 + y1) + YC;
      A0 = x1 * y2 - x2 * y1 + A0;
      P0 = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5 + P0;
      MX0 = (x1 - x2) * (y2 ** 2 + y2 * y1 + y1 ** 2) + MX0;
      MY0 = (y1 - y2) * (x2 ** 2 + x2 * x1 + x1 ** 2) + MY0;
      IY0 = (x1 * y2 - x2 * y1) * (x2 ** 2 + x2 * x1 + x1 ** 2) + IY0;
      IX0 = (x1 * y2 - x2 * y1) * (y2 ** 2 + y2 * y1 + y1 ** 2) + IX0;
      IXY0 = (x1 * y2 - x2 * y1) * (2 * x2 * y2 + x2 * y1 + x1 * y2 + 2 * x1 * y1) + IXY0;
    }

    const P = Math.abs(P0);
    const A = Math.abs(A0 / 2);
    const IX = Math.abs(IX0 / 12);
    const IY = Math.abs(IY0 / 12);
    XC = XC / (6 * A0 * 0.5);
    YC = YC / (6 * A0 * 0.5);
    const MX = Math.abs(MX0 / 6);
    const MY = Math.abs(MY0 / 6);
    const IXY = Math.abs(IXY0 / 24);
    this._propiedades = {
      P: P,
      A: A,
      IX: IX,
      IY: IY,
      XC: XC,
      YC: YC,
      MX: MX,
      MY: MY,
      IXY: IXY,
    };
  }

  propiedades() {
    return this._propiedades;
  }

  drawUnfinished() {}

  drawTranslated(translation) {
    // draws a copy translated to a diference of vectors
  }

  drawSelected() {}
}

export class Marker {
  constructor(point, label) {
    this.point = point;
    this.label = label;
  }

  draw(grid, ctx) {
    const p = grid.worldToScreen(this.point);
    ctx.save();
    ctx.moveTo(p.x, p.y);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.arc(p.x, p.y, grid.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.font = "8pt arial";
    ctx.textBaseline = "textBaseline";
    ctx.fillText(`  ${this.label}`, p.x, p.y);
    ctx.restore();
  }
}

export class Node {
  constructor(position, id) {
    this.position = position;
    this.id = id;
  }

  tieneCarga() {
    return (this.xMag && this.xMag !== 0) || (this.yMag && this.yMag !== 0);
  }

  cargaX() {
    return this.xMag ?? 0;
  }

  cargaY() {
    return this.yMag ?? 0;
  }

  draw(grid, ctx) {
    const p = grid.worldToScreen(this.position);
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "lightgrey";
    ctx.strokeStyle = "lightgrey";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.arc(p.x, p.y, grid.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x - 8, p.y - 8, grid.size * 2, 0, Math.PI * 2);
    ctx.font = "10px arial";
    ctx.fillText(this.id + "", p.x - 8, p.y - 8);
    ctx.stroke();
    if (this.soporte) {
      ctx.drawImage(soportes[this.soporte], p.x - 15, p.y);
    }
    const magX = this.xMag ?? 0;
    const magY = this.yMag ?? 0;
    const mag = pointDistance({ x: 0, y: 0 }, { x: magX, y: magY });
    const uMag = { x: magX / mag, y: magY / mag };
    const end = { x: p.x - uMag.x * 5 * mag, y: p.y + uMag.y * 5 * mag };
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.font = "12px arial";
    //ctx.textAlign = "right";
    if (this.xMag && this.xMag !== 0) {
      if (Math.sign(this.xMag) === -1) {
        ctx.textAlign = "left";
      } else {
        ctx.textAlign = "right";
      }
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 50 * Math.sign(this.xMag), p.y);
      ctx.fillText(magX.toFixed(2) + "kN", p.x - 50 * Math.sign(this.xMag), p.y);
      ctx.stroke();
      /* const headLength = 10;
      const angle = 90;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - headLength * Math.cos(angle - Math.PI / 6), p.y - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(p.x - headLength * Math.cos(angle + Math.PI / 6), p.y - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fill(); */
    }
    if (this.yMag && this.yMag !== 0) {
      if (Math.sign(this.yMag) === -1) {
        ctx.textAlign = "left";
      } else {
        ctx.textAlign = "right";
      }
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y - 50 * Math.sign(this.yMag));
      ctx.fillText(magY.toFixed(2) + "kN", p.x, p.y - 50 * Math.sign(this.yMag));
      ctx.stroke();
    }
    if ((this.xMag || this.yMag) && (this.xMag !== 0 || this.yMag !== 0)) {
      /* const mag = pointDistance({ x: 0, y: 0 }, { x: magX, y: magY });
      const uMag = { x: magX / mag, y: magY / mag };
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      const end = { x: p.x - uMag.x * 5 * mag, y: p.y + uMag.y * 5 * mag };
      ctx.lineTo(end.x, end.y);
      ctx.font = "12px arial";
      ctx.textAlign = "right";
      ctx.fillText(mag.toFixed(2) + "kN", end.x, end.y);
      ctx.stroke();
      // Draw arrowhead
      const headLength = 10;
      const angle = Math.atan2(-magY, magX);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - headLength * Math.cos(angle - Math.PI / 6), p.y - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(p.x - headLength * Math.cos(angle + Math.PI / 6), p.y - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(p.x, p.y);
      ctx.closePath();
      ctx.fill(); */
    }
    ctx.restore();
  }
}

export class Beam {
  constructor(E, A) {
    this.node1 = null;
    this.node2 = null;
    this.E = E;
    this.A = A;
  }

  addNode(node) {
    if (!this.node1) {
      this.node1 = node;
    } else if (!this.node2) {
      this.node2 = node;
      return true;
    }
    return false;
  }

  getFirstPoint() {
    return this.node1;
  }

  draw(grid, ctx) {
    const p1 = grid.worldToScreen(this.node1.position);
    const p2 = grid.worldToScreen(this.node2.position);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.fillStyle = "lightgrey";
    ctx.strokeStyle = "white";
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    const mid = { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
    ctx.font = "12px arial";
    ctx.fillText(this.id + "", mid.x, mid.y);
    ctx.restore();
  }

  isDone() {
    return this.node1 && this.node2;
  }
}

export class PointLoad {
  constructor() {}
}
