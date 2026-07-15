import { pointDistance } from "./utils.js";
import { NodeStyle, BeamStyle } from "./styles.js";

import sections from "./sections.js";

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
      // No noting if the add location is the same as the last point
      return true;
    }
    this.addPointAfterIndex(this.points.length - 1, grid.screenToWorld(position));
    return false;
  }

  addPointAfterIndex(index, position) {
    this.points.splice(index + 1, 0, { x: position.x, y: position.y, visible: true, color: null });
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
    XC = XC / (6 * A);
    YC = YC / (6 * A);
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

  drawUnfinished() { }

  drawTranslated(translation) {
    // draws a copy translated to a diference of vectors
  }

  drawSelected() { }
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
  constructor(position, id, z = 0) {
    // ← AÑADE z = 0 como tercer parámetro
    this.position = {
      x: position.x,
      y: position.y,
      z: z, // ← AHORA z está definido
    };
    // this.position = {
    //   x: Number(position.x || 0),
    //   y: Number(position.y || 0),
    //   z: Number(z || 0),
    // };

    this.force = {
      loads: {
        CM: { x: 0, y: 0, z: 0, multiplier: 1 },
        CV: { x: 0, y: 0, z: 0, multiplier: 1 },
        CVVM: { x: 0, y: 0, z: 0, multiplier: 1 },
        CVVP: { x: 0, y: 0, z: 0, multiplier: 1 },
        CN: { x: 0, y: 0, z: 0, multiplier: 1 },
        CLL: { x: 0, y: 0, z: 0, multiplier: 1 },
      },
    };

    this.reaction = { x: 0, y: 0, z: 0 };

    this.id = id;
    this.beams = [];

    this.visible = true;
    this.selected = false;
    this.isSelected = false;

    this.style = new NodeStyle();
    this.soporte = "";
  }

  // Añadir método para cambiar altura
  setElevation(z) {
    this.position.z = z;
  }

  tieneCarga() {
    return Object.entries(this.force.loads).some(([_, { x, y, z }]) => {
      return x != 0 || y != 0 || z != 0;
    });
  }

  cargaX() {
    return Object.entries(this.force.loads).reduce((sum, [_, { x, __, multiplier }]) => {
      return sum + x * multiplier;
    }, 0);
  }

  cargaY() {
    return Object.entries(this.force.loads).reduce((sum, [_, { __, y, multiplier }]) => {
      return sum + y * multiplier;
    }, 0);
  }

  // Agrega la carga Z
  cargaZ() {
    return Object.entries(this.force.loads).reduce((sum, [_, { z, multiplier }]) => {
      return sum + (z || 0) * (multiplier || 1);
    }, 0);
  }

  draw(renderer, context) {
    renderer.drawNode(this, context);
  }
}

// ============================================================
// Beam / Frame estructural
// Compatible con flujo legacy y nuevo flujo tipo ETABS
// ============================================================

export class Beam {
  constructor(E, A) {
    this.id = null;

    this.node1 = null;
    this.node2 = null;

    // -------------------------------
    // Propiedades legacy
    // -------------------------------
    // Se mantienen para no romper análisis antiguos.
    this.E = E ?? null;
    this._A = A ?? null;

    // -------------------------------
    // Propiedades estructurales reales
    // -------------------------------
    // Estas son las que debe leer Modal Spectral.
    this.sectionId = typeof A === "string" ? A : null;
    this.sectionName = typeof A === "string" ? A : null;
    this.sectionLabel = typeof A === "string" ? A : null;

    this.materialId = null;
    this.materialName = null;
    this.materialLabel = null;

    // Aquí se podrán guardar propiedades ya resueltas en SI:
    // A, Iy, Iz, J, E, G, density, weight, etc.
    this.sectionProperties = null;
    this.materialProperties = null;

    // Rol estructural: beam | column | brace | frame
    this.frameType = "beam";
    this.structuralRole = "beam";

    this.angle = 0;
    this.fAxial = 0;

    // Rotación del eje local en planta (grados, + antihorario). Para columnas
    // rectangulares define hacia dónde apunta el peralte (eje fuerte Iz).
    this.localAxisAngle = 0;

    this.elementType = "beam";
    this.type = "beam";
    this.objectType = "frame";

    this.visible = true;
    this.selected = false;
    this.isSelected = false;

    this.style = new BeamStyle();
  }

  set A(a) {
    this._A = a ?? null;

    // Compatibilidad: si antes se asignaba A como nombre de sección,
    // ahora también queda registrada como sección estructural.
    if (typeof a === "string") {
      this.sectionId = this.sectionId ?? a;
      this.sectionName = this.sectionName ?? a;
      this.sectionLabel = this.sectionLabel ?? a;
    }
  }

  get A() {
    // Legacy:
    // Si _A es una clave de sections.js, devuelve el área.
    // Si _A ya es número, devuelve el número.
    return sections?.[this._A] ?? this._A;
  }

  get rawArea() {
    return this._A;
  }

  get area() {
    return this.A;
  }

  assignSection(section) {
    if (!section) return;

    if (typeof section === "string") {
      this.sectionId = section;
      this.sectionName = section;
      this.sectionLabel = section;
      this._A = section;
      this.sectionProperties = null;
      return;
    }

    const id =
      section.id ??
      section.sectionId ??
      section.name ??
      section.label ??
      section.key ??
      null;

    const name =
      section.name ??
      section.sectionName ??
      section.label ??
      id;

    this.sectionId = id;
    this.sectionName = name;
    this.sectionLabel = section.label ?? name;

    this.sectionProperties = {
      ...section,
    };

    // Mantiene compatibilidad con el getter A.
    if (section.A !== undefined && section.A !== null) {
      this._A = section.A;
    } else if (id) {
      this._A = id;
    }
  }

  assignMaterial(material) {
    if (!material) return;

    if (typeof material === "string") {
      this.materialId = material;
      this.materialName = material;
      this.materialLabel = material;
      this.materialProperties = null;
      return;
    }

    const id =
      material.id ??
      material.materialId ??
      material.name ??
      material.label ??
      material.key ??
      null;

    const name =
      material.name ??
      material.materialName ??
      material.label ??
      id;

    this.materialId = id;
    this.materialName = name;
    this.materialLabel = material.label ?? name;

    this.materialProperties = {
      ...material,
    };

    // Si el material trae E, actualizamos E legacy también.
    if (material.E !== undefined && material.E !== null) {
      this.E = material.E;
    }
  }

  setStructuralRole(role) {
    const normalizedRole = String(role || "").toLowerCase();

    if (["beam", "column", "brace", "frame"].includes(normalizedRole)) {
      this.frameType = normalizedRole;
      this.structuralRole = normalizedRole;
      this.type = normalizedRole === "column" ? "column" : "beam";
      this.elementType = this.type;
    }
  }

  getStructuralAssignment() {
    return {
      id: this.id,
      frameType: this.frameType,
      structuralRole: this.structuralRole,

      sectionId: this.sectionId,
      sectionName: this.sectionName,
      sectionLabel: this.sectionLabel,

      materialId: this.materialId,
      materialName: this.materialName,
      materialLabel: this.materialLabel,

      A: this.A,
      rawArea: this.rawArea,
      E: this.E,

      sectionProperties: this.sectionProperties,
      materialProperties: this.materialProperties,
    };
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

  isDone() {
    return this.node1 && this.node2;
  }

  draw(renderer, context) {
    renderer.drawBeam(this, context);
  }
}

export class Area extends Shape {
  constructor(areaType = "slab", z = 0) {
    super();
    this.areaType = areaType; // slab | wall | opening
    this.z = z;
    this.id = null;
    this.visible = true;
    this.selected = false;
    this.isSelected = false;
    this.visible = true;
  }

  addPoint(point) {
    this.points.push({
      x: point.x,
      y: point.y,
      z: point.z ?? this.z,
      visible: true,
      color: null,
    });
  }

  isClosed() {
    return this.points.length >= 3;
  }

  draw(renderer, context) {
    renderer.drawArea(this, context);
  }
}

export class PointLoad {
  constructor() { }
}