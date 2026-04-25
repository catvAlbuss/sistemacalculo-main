import * as BABYLON from "@babylonjs/core";
import { getViewer3DState } from "./viewer3d.js";
import { createSimpleAxisLabel } from "./axes3d.js";

const COLORS = {
  base: new BABYLON.Color3(0.18, 0.22, 0.32),
  ref: new BABYLON.Color3(0.32, 0.38, 0.5),
  active: new BABYLON.Color3(0.15, 0.55, 1.0),
  axisX: new BABYLON.Color3(1, 0.2, 0.2),
  axisY: new BABYLON.Color3(0.2, 1, 0.2),
  axisZ: new BABYLON.Color3(0.2, 0.8, 1),
  text: new BABYLON.Color3(0.75, 0.85, 1),
};

function getScene() {
  return getViewer3DState().scene;
}

function registerElement(mesh) {
  if (!mesh) return null;
  const viewer = getViewer3DState();
  viewer.elements.push(mesh);
  return mesh;
}

function mapToBabylon(x, y, z = 0) {
  // lógico: x, y, z
  // Babylon: x, z, y
  return new BABYLON.Vector3(x, z, y);
}

function createLine(name, p1, p2, color, alpha = 1) {
  const scene = getScene();
  if (!scene) return null;

  const line = BABYLON.MeshBuilder.CreateLines(name, { points: [p1, p2], updatable: false }, scene);

  line.color = color;
  line.alpha = alpha;
  line.isPickable = false;

  return registerElement(line);
}

function createPolyline(name, points, color, alpha = 1, closed = false) {
  const scene = getScene();
  if (!scene) return null;

  const pts = closed ? [...points, points[0]] : points;

  const line = BABYLON.MeshBuilder.CreateLines(name, { points: pts, updatable: false }, scene);

  line.color = color;
  line.alpha = alpha;
  line.isPickable = false;

  return registerElement(line);
}

function createLabel(name, text, color, position) {
  const scene = getScene();
  if (!scene || !createSimpleAxisLabel) return null;

  let label = null;

  try {
    label = createSimpleAxisLabel(text, color, scene);
  } catch {
    try {
      label = createSimpleAxisLabel(text, color, position, scene);
    } catch {
      label = null;
    }
  }

  if (!label) return null;

  label.name = name;

  if (label.position && position) {
    if (typeof label.position.copyFrom === "function") {
      label.position.copyFrom(position);
    } else {
      label.position = position;
    }
  }

  label.isPickable = false;
  return registerElement(label);
}

function clearByPrefix(prefixes) {
  const viewer = getViewer3DState();
  if (!viewer || !viewer.elements) return;

  // Incluir TODOS los prefijos de diagonales
  const allPrefixes = [
    ...prefixes,
    "diagX_",
    "diagY_",
    "mat_diagX_",
    "mat_diagY_",
    "activeview_diag_",
    "always_visible_", // ← NUEVO
  ];

  viewer.elements = viewer.elements.filter((el) => {
    const shouldRemove = allPrefixes.some((prefix) => el?.name?.startsWith(prefix));
    if (shouldRemove) {
      if (el?.dispose) {
        try {
          el.dispose();
        } catch (e) {
          console.warn("Error al eliminar:", e);
        }
      }
      return false;
    }
    return true;
  });
}

function getReferenceBounds(refGrid) {
  const minX = Math.min(...refGrid.xPositions);
  const maxX = Math.max(...refGrid.xPositions);
  const minY = Math.min(...refGrid.yPositions);
  const maxY = Math.max(...refGrid.yPositions);

  return { minX, maxX, minY, maxY };
}

function createHorizontalGrid(prefix, xPositions, yPositions, z, color, alpha = 0.3) {
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  xPositions.forEach((x, i) => {
    createLine(`${prefix}_x_${i}`, mapToBabylon(x, minY, z), mapToBabylon(x, maxY, z), color, alpha);
  });

  yPositions.forEach((y, i) => {
    createLine(`${prefix}_y_${i}`, mapToBabylon(minX, y, z), mapToBabylon(maxX, y, z), color, alpha);
  });

  createPolyline(
    `${prefix}_border`,
    [
      mapToBabylon(minX, minY, z),
      mapToBabylon(maxX, minY, z),
      mapToBabylon(maxX, maxY, z),
      mapToBabylon(minX, maxY, z),
    ],
    color,
    alpha + 0.1,
    true,
  );
}

function createVerticalGridX(prefix, xConst, yPositions, maxZ, storyHeight, color, alpha = 0.3) {
  const minY = Math.min(...yPositions);
  const maxY = Math.max(...yPositions);

  for (let z = 0; z <= maxZ + 0.0001; z += storyHeight) {
    createLine(
      `${prefix}_h_${z.toFixed(2)}`,
      mapToBabylon(xConst, minY, z),
      mapToBabylon(xConst, maxY, z),
      color,
      alpha,
    );
  }

  yPositions.forEach((y, i) => {
    createLine(`${prefix}_v_${i}`, mapToBabylon(xConst, y, 0), mapToBabylon(xConst, y, maxZ), color, alpha);
  });

  createPolyline(
    `${prefix}_border`,
    [
      mapToBabylon(xConst, minY, 0),
      mapToBabylon(xConst, maxY, 0),
      mapToBabylon(xConst, maxY, maxZ),
      mapToBabylon(xConst, minY, maxZ),
    ],
    color,
    alpha + 0.1,
    true,
  );
}

function createVerticalGridY(prefix, yConst, xPositions, maxZ, storyHeight, color, alpha = 0.3) {
  const minX = Math.min(...xPositions);
  const maxX = Math.max(...xPositions);

  for (let z = 0; z <= maxZ + 0.0001; z += storyHeight) {
    createLine(
      `${prefix}_h_${z.toFixed(2)}`,
      mapToBabylon(minX, yConst, z),
      mapToBabylon(maxX, yConst, z),
      color,
      alpha,
    );
  }

  xPositions.forEach((x, i) => {
    createLine(`${prefix}_v_${i}`, mapToBabylon(x, yConst, 0), mapToBabylon(x, yConst, maxZ), color, alpha);
  });

  createPolyline(
    `${prefix}_border`,
    [
      mapToBabylon(minX, yConst, 0),
      mapToBabylon(maxX, yConst, 0),
      mapToBabylon(maxX, yConst, maxZ),
      mapToBabylon(minX, yConst, maxZ),
    ],
    color,
    alpha + 0.1,
    true,
  );
}

function drawStoryLabels(refGrid, maxZ) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const offsetX = minX - refGrid.xSpacing * 0.45;
  const offsetY = minY - refGrid.ySpacing * 0.45;

  for (let i = 0; i <= refGrid.storyCount; i++) {
    const z = i * refGrid.storyHeight;
    const label = i === 0 ? "BASE" : `P${i}`;
    createLabel(`ref_story_label_${i}`, label, COLORS.text, mapToBabylon(offsetX, offsetY, Math.min(z, maxZ)));
  }
}

function drawAxisLabels(refGrid) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const xOffset = refGrid.ySpacing * 0.18;
  const yOffset = refGrid.xSpacing * 0.18;

  refGrid.xPositions.forEach((x, i) => {
    createLabel(`ref_x_label_${i}`, refGrid.xLabels[i], COLORS.text, mapToBabylon(x, minY - xOffset, 0));
  });

  refGrid.yPositions.forEach((y, i) => {
    createLabel(`ref_y_label_${i}`, String(refGrid.yLabels[i]), COLORS.text, mapToBabylon(minX - yOffset, y, 0));
  });
}

function drawWorldAxes(refGrid, maxZ) {
  const { minX, minY } = getReferenceBounds(refGrid);
  const axisLenX = Math.max(...refGrid.xPositions) - minX + refGrid.xSpacing * 0.6;
  const axisLenY = Math.max(...refGrid.yPositions) - minY + refGrid.ySpacing * 0.6;
  const axisLenZ = maxZ + refGrid.storyHeight * 0.5;

  createLine("ref_axis_x", mapToBabylon(minX, minY, 0), mapToBabylon(minX + axisLenX, minY, 0), COLORS.axisX, 0.9);

  createLine("ref_axis_y", mapToBabylon(minX, minY, 0), mapToBabylon(minX, minY + axisLenY, 0), COLORS.axisY, 0.9);

  createLine("ref_axis_z", mapToBabylon(minX, minY, 0), mapToBabylon(minX, minY, axisLenZ), COLORS.axisZ, 0.9);

  createLabel("ref_axis_x_label", "X", COLORS.axisX, mapToBabylon(minX + axisLenX + 0.2, minY, 0));
  createLabel("ref_axis_y_label", "Y", COLORS.axisY, mapToBabylon(minX, minY + axisLenY + 0.2, 0));
  createLabel("ref_axis_z_label", "Z", COLORS.axisZ, mapToBabylon(minX, minY, axisLenZ + 0.2));
}

function drawActiveView(refGrid, context) {
  const view = context?.viewSet?.[context?.activeViewIndex];
  if (!view) return;

  const maxZ = refGrid.storyCount * refGrid.storyHeight;

  clearByPrefix(["activeview_"]);

  // Dentro de drawActiveView, en el bloque view.type === "diagonal":
  if (view.type === "diagonal") {
    for (let floor = 0; floor <= refGrid.storyCount; floor++) {
      const altura = floor * refGrid.storyHeight;
      const p1 = mapToBabylon(view.startX, view.startY, altura);
      const p2 = mapToBabylon(view.endX, view.endY, altura);

      // 🔥 Elevar también la diagonal activa
      const offset = 0.08; // Un poco más arriba que las normales
      const elevatedP1 = new BABYLON.Vector3(p1.x, p1.y + offset, p1.z);
      const elevatedP2 = new BABYLON.Vector3(p2.x, p2.y + offset, p2.z);

      const lines = BABYLON.MeshBuilder.CreateLines(
        `activeview_diag_${view.name}_floor${floor}`,
        { points: [elevatedP1, elevatedP2], updatable: false },
        getScene(),
      );

      const material = new BABYLON.StandardMaterial(`activeview_diag_mat_${floor}`, getScene());
      material.emissiveColor = new BABYLON.Color3(1, 0.8, 0);
      material.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
      material.specularColor = new BABYLON.Color3(1, 1, 1);
      lines.material = material;
      lines.color = new BABYLON.Color3(1, 0.8, 0);
      lines.renderingGroupId = 3;

      if (getViewer3DState().elements) getViewer3DState().elements.push(lines);
    }

    createLabel(
      "activeview_label",
      `✨ DIAGONAL ACTIVA: ${view.name} ✨`,
      new BABYLON.Color3(1, 0.8, 0),
      mapToBabylon(
        view.startX + (view.endX - view.startX) / 2,
        view.startY + (view.endY - view.startY) / 2,
        maxZ + 0.8,
      ),
    );
  }

  if (view.type === "plan") {
    const z = view.elevation ?? 0;

    createHorizontalGrid("activeview_plan", refGrid.xPositions, refGrid.yPositions, z, COLORS.active, 1);

    createLabel(
      "activeview_label",
      view.name,
      COLORS.active,
      mapToBabylon(Math.min(...refGrid.xPositions), Math.min(...refGrid.yPositions) - refGrid.ySpacing * 0.7, z),
    );
  }

  if (view.type === "elevation") {
    if (view.axis === "X") {
      createVerticalGridX(
        "activeview_elev_x",
        view.value,
        refGrid.yPositions,
        maxZ,
        refGrid.storyHeight,
        COLORS.active,
        1,
      );

      createLabel(
        "activeview_label",
        view.name,
        COLORS.active,
        mapToBabylon(view.value, Math.min(...refGrid.yPositions) - refGrid.ySpacing * 0.45, maxZ),
      );
    }

    if (view.axis === "Y") {
      createVerticalGridY(
        "activeview_elev_y",
        view.value,
        refGrid.xPositions,
        maxZ,
        refGrid.storyHeight,
        COLORS.active,
        1,
      );

      createLabel(
        "activeview_label",
        view.name,
        COLORS.active,
        mapToBabylon(Math.min(...refGrid.xPositions) - refGrid.xSpacing * 0.45, view.value, maxZ),
      );
    }
  }
}

// function drawReferenceStructure(refGrid) {
//   const maxZ = refGrid.storyCount * refGrid.storyHeight;

//   // Planos horizontales por nivel
//   for (let i = 0; i <= refGrid.storyCount; i++) {
//     createHorizontalGrid(
//       `ref_floor_${i}`,
//       refGrid.xPositions,
//       refGrid.yPositions,
//       i * refGrid.storyHeight,
//       COLORS.ref,
//       0.22,
//     );
//   }

//   // Planos verticales perimetrales
//   createVerticalGridX(
//     "ref_elev_x_min",
//     Math.min(...refGrid.xPositions),
//     refGrid.yPositions,
//     maxZ,
//     refGrid.storyHeight,
//     COLORS.ref,
//     0.16,
//   );

//   createVerticalGridX(
//     "ref_elev_x_max",
//     Math.max(...refGrid.xPositions),
//     refGrid.yPositions,
//     maxZ,
//     refGrid.storyHeight,
//     COLORS.ref,
//     0.16,
//   );

//   createVerticalGridY(
//     "ref_elev_y_min",
//     Math.min(...refGrid.yPositions),
//     refGrid.xPositions,
//     maxZ,
//     refGrid.storyHeight,
//     COLORS.ref,
//     0.16,
//   );

//   createVerticalGridY(
//     "ref_elev_y_max",
//     Math.max(...refGrid.yPositions),
//     refGrid.xPositions,
//     maxZ,
//     refGrid.storyHeight,
//     COLORS.ref,
//     0.16,
//   );

//   drawAxisLabels(refGrid);
//   drawStoryLabels(refGrid, maxZ);
//   drawWorldAxes(refGrid, maxZ);
// }

function drawReferenceStructure(refGrid) {
  const maxZ = refGrid.storyCount * refGrid.storyHeight;

  const toBabylon = (x2d, y2d, altura) => {
    return new BABYLON.Vector3(x2d, altura, y2d);
  };

  // 🔥 Reducir la opacidad del grid base para que las diagonales resalten
  const gridAlpha = 0.12; // Más transparente que antes (era 0.22)
  const borderAlpha = 0.2;

  // Planos horizontales por nivel (cada piso)
  for (let i = 0; i <= refGrid.storyCount; i++) {
    const altura = i * refGrid.storyHeight;

    const minX = Math.min(...refGrid.xPositions);
    const maxX = Math.max(...refGrid.xPositions);
    const minY = Math.min(...refGrid.yPositions);
    const maxY = Math.max(...refGrid.yPositions);

    // Líneas en X - MÁS TRANSPARENTES
    refGrid.xPositions.forEach((x, idx) => {
      const p1 = toBabylon(x, minY, altura);
      const p2 = toBabylon(x, maxY, altura);
      createLine(`ref_floor_${i}_x_${idx}`, p1, p2, COLORS.ref, gridAlpha);
    });

    // Líneas en Y - MÁS TRANSPARENTES
    refGrid.yPositions.forEach((y, idx) => {
      const p1 = toBabylon(minX, y, altura);
      const p2 = toBabylon(maxX, y, altura);
      createLine(`ref_floor_${i}_y_${idx}`, p1, p2, COLORS.ref, gridAlpha);
    });

    // Contorno del piso
    const borderPoints = [
      toBabylon(minX, minY, altura),
      toBabylon(maxX, minY, altura),
      toBabylon(maxX, maxY, altura),
      toBabylon(minX, maxY, altura),
      toBabylon(minX, minY, altura),
    ];
    createPolyline(`ref_floor_${i}_border`, borderPoints, COLORS.ref, borderAlpha, false);
  }

  // Líneas verticales en esquinas - también más transparentes
  const minX = Math.min(...refGrid.xPositions);
  const maxX = Math.max(...refGrid.xPositions);
  const minY = Math.min(...refGrid.yPositions);
  const maxY = Math.max(...refGrid.yPositions);

  const corners = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];

  corners.forEach((corner, idx) => {
    const p1 = toBabylon(corner.x, corner.y, 0);
    const p2 = toBabylon(corner.x, corner.y, maxZ);
    createLine(`ref_corner_${idx}`, p1, p2, COLORS.ref, 0.15);
  });

  drawAxisLabels(refGrid);
  drawStoryLabels(refGrid, maxZ);
  drawWorldAxes(refGrid, maxZ);
}

// Añade esta función al inicio de grid3d.js, después de los imports
function createAlwaysVisibleLine(name, p1, p2, color, lineWidth = 2) {
  const scene = getScene();
  if (!scene) return null;

  // Crear líneas con material que ignora profundidad
  const lines = BABYLON.MeshBuilder.CreateLines(name, { points: [p1, p2], updatable: false }, scene);

  // 🔥 CRÍTICO: Forzar que se dibuje SIEMPRE al frente
  lines.renderingGroupId = 1; // Grupo más alto (0 es el grupo por defecto)

  // 🔥 CRÍTICO: Deshabilitar prueba de profundidad
  const material = new BABYLON.StandardMaterial(`always_visible_${name}`, scene);
  material.depthWrite = false; // No escribe en Z-buffer
  material.depthTest = false; // No prueba profundidad
  material.emissiveColor = color;
  material.diffuseColor = color;
  material.alpha = 1;

  lines.material = material;
  lines.color = color;
  lines.isPickable = false;

  return registerElement(lines);
}

export function clearReferenceGrid3D() {
  clearByPrefix(["ref_", "activeview_"]);
}

export function drawReferenceGrid3D(context) {
  const scene = getScene();
  if (!scene || !context?.referenceGrid) return;

  const refGrid = context.referenceGrid;

  if (!refGrid.xPositions?.length || !refGrid.yPositions?.length) return;

  clearReferenceGrid3D();
  drawReferenceStructure(refGrid);
  drawActiveView(refGrid, context);
  drawDiagonalGrids3D(context);
}

export function createFull3DGrid(scene) {
  if (!scene) return;

  console.log("📏 Creando grid 3D base");

  const size = 10;
  const spacing = 1;

  for (let x = -size; x <= size; x += spacing) {
    createLine(
      `ref_base_xy_x_${x}`,
      new BABYLON.Vector3(x, 0, -size),
      new BABYLON.Vector3(x, 0, size),
      COLORS.base,
      0.12,
    );
  }

  for (let z = -size; z <= size; z += spacing) {
    createLine(
      `ref_base_xy_z_${z}`,
      new BABYLON.Vector3(-size, 0, z),
      new BABYLON.Vector3(size, 0, z),
      COLORS.base,
      0.12,
    );
  }

  for (let x = -size; x <= size; x += spacing) {
    createLine(
      `ref_base_xz_x_${x}`,
      new BABYLON.Vector3(x, -size, 0),
      new BABYLON.Vector3(x, size, 0),
      COLORS.base,
      0.06,
    );
  }

  for (let y = -size; y <= size; y += spacing) {
    createLine(
      `ref_base_xz_y_${y}`,
      new BABYLON.Vector3(-size, y, 0),
      new BABYLON.Vector3(size, y, 0),
      COLORS.base,
      0.06,
    );
  }

  for (let z = -size; z <= size; z += spacing) {
    createLine(
      `ref_base_yz_z_${z}`,
      new BABYLON.Vector3(0, -size, z),
      new BABYLON.Vector3(0, size, z),
      COLORS.base,
      0.06,
    );
  }

  for (let y = -size; y <= size; y += spacing) {
    createLine(
      `ref_base_yz_y_${y}`,
      new BABYLON.Vector3(0, y, -size),
      new BABYLON.Vector3(0, y, size),
      COLORS.base,
      0.06,
    );
  }

  console.log("✅ Grid base 3D creado");
}

// En grid3d.js, agrega este método para dibujar líneas diagonales en 3D
// export function drawDiagonalGrids3D(context) {
//   const viewer = getViewer3DState();
//   if (!viewer.scene || !viewer.scene.meshes) return;

//   const diagonalGrids = context.diagonalGrids;
//   if (!diagonalGrids) return;

//   const storyCount = context.referenceGrid?.storyCount || 0;
//   const storyHeight = context.referenceGrid?.storyHeight || 3;

//   // Colores para líneas diagonales
//   const colorX = new BABYLON.Color3(1, 0.4, 0.4); // Rojo claro
//   const colorY = new BABYLON.Color3(0.4, 1, 0.4); // Verde claro

//   // Material para líneas diagonales X
//   const materialX = new BABYLON.StandardMaterial("diagXMat", viewer.scene);
//   materialX.emissiveColor = colorX;
//   materialX.diffuseColor = colorX;

//   // Material para líneas diagonales Y
//   const materialY = new BABYLON.StandardMaterial("diagZMat", viewer.scene);
//   materialY.emissiveColor = colorY;
//   materialY.diffuseColor = colorY;

//   // Dibujar ejes diagonales X en todos los pisos
//   diagonalGrids.x.forEach((grid) => {
//     for (let floor = 0; floor <= storyCount; floor++) {
//       const z = floor * storyHeight;

//       const points = [new BABYLON.Vector3(grid.startX, grid.startY, z), new BABYLON.Vector3(grid.endX, grid.endY, z)];

//       const lines = BABYLON.MeshBuilder.CreateLines(
//         `diagX_${grid.name}_floor${floor}`,
//         { points: points },
//         viewer.scene,
//       );
//       lines.material = materialX;
//       lines.color = colorX;
//     }
//   });

//   // Dibujar ejes diagonales Y en todos los pisos
//   diagonalGrids.y.forEach((grid) => {
//     for (let floor = 0; floor <= storyCount; floor++) {
//       const z = floor * storyHeight;

//       const points = [new BABYLON.Vector3(grid.startX, grid.startY, z), new BABYLON.Vector3(grid.endX, grid.endY, z)];

//       const lines = BABYLON.MeshBuilder.CreateLines(
//         `diagY_${grid.name}_floor${floor}`,
//         { points: points },
//         viewer.scene,
//       );
//       lines.material = materialY;
//       lines.color = colorY;
//     }
//   });

//   console.log(`📐 Dibujadas ${diagonalGrids.x.length + diagonalGrids.y.length} líneas diagonales en 3D`);
// }


// Reemplaza drawDiagonalGrids3D con esta versión:
export function drawDiagonalGrids3D(context) {
    const viewer = getViewer3DState();
    if (!viewer.scene) return;

    const diagonalGrids = context.diagonalGrids;
    if (!diagonalGrids) return;

    if (diagonalGrids.x.length === 0 && diagonalGrids.y.length === 0) return;

    const refGrid = context.referenceGrid;
    const storyCount = refGrid?.storyCount || 0;
    const storyHeight = refGrid?.storyHeight || 3;

    function parseColor(colorStr) {
        if (!colorStr) return new BABYLON.Color3(1, 0, 0);
        if (colorStr.startsWith('#')) {
            const r = parseInt(colorStr.slice(1, 3), 16) / 255;
            const g = parseInt(colorStr.slice(3, 5), 16) / 255;
            const b = parseInt(colorStr.slice(5, 7), 16) / 255;
            return new BABYLON.Color3(r, g, b);
        }
        return new BABYLON.Color3(1, 0, 0);
    }

    function createTube(name, start, end, color, diameter = 0.08) {
        if (!start || !end) return null;
        const direction = new BABYLON.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
        const length = direction.length();
        if (length < 0.001) return null;
        const cylinder = BABYLON.MeshBuilder.CreateCylinder(name, { height: length, diameter: diameter }, viewer.scene);
        const midPoint = new BABYLON.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
        cylinder.position = midPoint;
        const originalDir = new BABYLON.Vector3(0, 1, 0);
        const rotationQuat = BABYLON.Quaternion.FromUnitVectorsToRef(originalDir, direction.normalize(), BABYLON.Quaternion.Identity());
        cylinder.rotationQuaternion = rotationQuat;
        const material = new BABYLON.StandardMaterial(`mat_${name}`, viewer.scene);
        material.emissiveColor = color;
        material.diffuseColor = color;
        cylinder.material = material;
        return cylinder;
    }

    // Dibujar diagonales X
    diagonalGrids.x.forEach(grid => {
        // Verificar si es visible
        if (grid.visible === false) return;
        
        const color = parseColor(grid.color || "#ff0000");
        for (let floor = 0; floor <= storyCount; floor++) {
            const altura = floor * storyHeight;
            const p1 = mapToBabylon(grid.startX, grid.startY, altura);
            const p2 = mapToBabylon(grid.endX, grid.endY, altura);
            const tube = createTube(`diagX_${grid.name}_${floor}`, p1, p2, color, 0.08);
            if (tube && viewer.elements) viewer.elements.push(tube);
        }
    });

    // Dibujar diagonales Y
    diagonalGrids.y.forEach(grid => {
        // Verificar si es visible
        if (grid.visible === false) return;
        
        const color = parseColor(grid.color || "#00ff00");
        for (let floor = 0; floor <= storyCount; floor++) {
            const altura = floor * storyHeight;
            const p1 = mapToBabylon(grid.startX, grid.startY, altura);
            const p2 = mapToBabylon(grid.endX, grid.endY, altura);
            const tube = createTube(`diagY_${grid.name}_${floor}`, p1, p2, color, 0.08);
            if (tube && viewer.elements) viewer.elements.push(tube);
        }
    });

    console.log(`✅ Diagonales dibujadas`);
}
