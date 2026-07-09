import * as BABYLON from "@babylonjs/core";
import { Beam, Node as StructuralNode, Area } from "../shapes.js";
import { getViewer3DState } from "./viewer3d.js";
import { createSimpleAxisLabel } from "./axes3d.js";

function getScene() {
  const viewer = getViewer3DState();
  return viewer.scene;
}

function registerViewerElement(mesh) {
  const viewer = getViewer3DState();
  viewer.elements.push(mesh);
  return mesh;
}

function mapToBabylon(x, y, z = 0) {
  return new BABYLON.Vector3(x, z, y);
}

function renumberModel(context) {
  context.nodes.forEach((node, index) => {
    node.id = index + 1;
  });

  context.shapes.forEach((beam, index) => {
    beam.id = index + 1;
  });
}

function getSelectedNodes(context) {
  return context.selectedNodesState?.selectedObjects?.length
    ? context.selectedNodesState.selectedObjects
    : [];
}

function getNodesToModify(context) {
  const selected = getSelectedNodes(context);
  if (selected.length > 0) return selected;
  return context.nodes ?? [];
}

export function activate3DDrawingMode(context) {
  context.setState(context.trussDrawingState3D);

  const simple3DState = {
    currentPlane: "XY",

    handleMouseDown: (event, stateContext, mouse) => {
      event.preventDefault();

      const worldPos = stateContext.grid.screenToWorld(mouse);
      let x = worldPos.x;
      let y = worldPos.y;
      let z = 0;

      if (context.simple3DPlane === "XZ") {
        x = worldPos.x;
        z = worldPos.y;
        y = 0;
      } else if (context.simple3DPlane === "YZ") {
        y = worldPos.x;
        z = worldPos.y;
        x = 0;
      }

      let node = stateContext.closestNode(mouse);
      if (!node) {
        node = new StructuralNode({ x, y }, stateContext.nodes.length + 1, z);
        stateContext.nodes.push(node);
      }

      if (!context.tempBeam) {
        context.tempBeam = new Beam(stateContext.globalE, stateContext.globalA);
      }

      const done = context.tempBeam.addNode(node);

      if (done) {
        stateContext.shapes.push(context.tempBeam);
        context.tempBeam.id = stateContext.shapes.length;

        context.tempBeam = new Beam(stateContext.globalE, stateContext.globalA);
        context.tempBeam.addNode(node);
      }

      stateContext.sync3D();
    },

    handleKeyDown: (event) => {
      if (event.key === "1") context.simple3DPlane = "XY";
      if (event.key === "2") context.simple3DPlane = "XZ";
      if (event.key === "3") context.simple3DPlane = "YZ";
    },

    handleMouseMove: () => {},
    handleMouseUp: () => {},
    handleMouseWheel: () => {},
    draw: () => {},
  };

  context.simple3DPlane = "XY";
  context.tempBeam = null;
  context.currentState = simple3DState;

  if (!context.show3DView) {
    context.toggleView3D();
  }
}

export function elevateSelectedNodes(context, step = 1) {
  const nodes = getNodesToModify(context);

  if (!nodes.length) {
    context.showMessage?.("⚠️ No hay nodos para elevar", "warning");
    return;
  }

  nodes.forEach((node) => {
    node.position.z = (node.position.z || 0) + step;
  });

  const selected = getSelectedNodes(context);
  const message =
    selected.length > 0
      ? `⬆️ ${selected.length} nodos elevados +${step}m`
      : `⬆️ Todos los nodos elevados +${step}m`;

  context.showMessage?.(message);
  context.sync3D();
}

export function lowerSelectedNodes(context, step = 1) {
  const nodes = getNodesToModify(context);

  if (!nodes.length) {
    context.showMessage?.("⚠️ No hay nodos para bajar", "warning");
    return;
  }

  nodes.forEach((node) => {
    node.position.z = Math.max(0, (node.position.z || 0) - step);
  });

  const selected = getSelectedNodes(context);
  const message =
    selected.length > 0
      ? `⬇️ ${selected.length} nodos bajados -${step}m`
      : `⬇️ Todos los nodos bajados -${step}m`;

  context.showMessage?.(message);
  context.sync3D();
}

// Copia las asignaciones estructurales de un frame origen a uno nuevo:
// sección (id/nombre/props SI), material, rotación de eje local y cargas.
// Así el piso duplicado "respeta el frame" asignado (secciones, material, cargas).
function copyFrameAssignments(src, dst) {
  if (!src || !dst) return;

  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

  // Sección
  dst.sectionId = src.sectionId ?? null;
  dst.sectionName = src.sectionName ?? null;
  dst.sectionLabel = src.sectionLabel ?? null;
  if (src.frameSection) dst.frameSection = clone(src.frameSection);
  if (src.section) dst.section = clone(src.section);
  if (src.sectionProperties) dst.sectionProperties = clone(src.sectionProperties);
  dst.hasAssignedSection = src.hasAssignedSection === true;

  // Propiedades SI que lee el motor (A/Iz/Iy/J/E)
  dst._A = src._A ?? dst._A;
  dst.A = src.A ?? dst.A;
  dst.Iz = src.Iz ?? dst.Iz;
  dst.Iy = src.Iy ?? dst.Iy;
  dst.J = src.J ?? dst.J;
  dst.E = src.E ?? dst.E;

  // Material
  dst.materialId = src.materialId ?? null;
  dst.materialName = src.materialName ?? null;
  dst.materialLabel = src.materialLabel ?? null;
  if (src.materialProperties) dst.materialProperties = clone(src.materialProperties);

  // Rotación de eje local (columnas rectangulares)
  dst.localAxisAngle = src.localAxisAngle ?? 0;
  if (src.angle != null) dst.angle = src.angle;

  // Cargas del frame (distribuidas/puntuales/temperatura)
  if (Array.isArray(src.frameLoads)) dst.frameLoads = clone(src.frameLoads);
  if (Array.isArray(src.lineLoads)) dst.lineLoads = clone(src.lineLoads);
  dst.hasFrameLoads = src.hasFrameLoads === true;
  dst.hasLineLoads = src.hasLineLoads === true;

  if (src.assignment) dst.assignment = clone(src.assignment);
}

// Copia las asignaciones de una losa/área a una nueva (sección de losa, cargas
// de área, peso propio, diafragma, material).
function copyAreaAssignments(src, dst) {
  if (!src || !dst) return;

  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

  const keys = [
    "slabSection", "sectionId", "sectionName", "section",
    "thickness", "material", "materialName",
    "areaLoads", "loads", "slabSelfWeightKgM2", "slabSelfWeight",
    "hasAssignedSection", "assignment",
    "diaphragm", "diaphragmName", "diaphragmId",
  ];

  keys.forEach((k) => {
    if (src[k] !== undefined) dst[k] = clone(src[k]);
  });
}

export function extrudeToNewFloor(context, floorHeight = 3) {
  if (!context.nodes?.length) {
    context.showMessage?.("⚠️ No hay estructura para extruir", "warning");
    return;
  }

  const EPS = 1e-6;
  const zOf = (n) => Number(n?.position?.z || 0);

  const baseNodes = [...context.nodes];
  const currentMaxZ = Math.max(...baseNodes.map(zOf));
  const newZ = currentMaxZ + floorHeight;

  const topLevelNodes = baseNodes.filter((n) => Math.abs(zOf(n) - currentMaxZ) < EPS);
  const nodeMap = new Map();
  const newNodes = [];

  topLevelNodes.forEach((node) => {
    const newNode = new StructuralNode(
      { x: node.position.x, y: node.position.y },
      context.nodes.length + newNodes.length + 1,
      newZ,
    );

    context.nodes.push(newNode);
    newNodes.push(newNode);
    nodeMap.set(node.id, newNode);
  });

  // Columnas existentes que LLEGAN a currentMaxZ (nodo superior en ese nivel):
  // se usan para copiar su sección/material a las nuevas columnas de arriba.
  const columnByTopNodeId = new Map();
  context.shapes.forEach((s) => {
    if (!s.node1 || !s.node2) return;
    const sameXY =
      Math.abs(s.node1.position.x - s.node2.position.x) < EPS &&
      Math.abs(s.node1.position.y - s.node2.position.y) < EPS;
    const vertical = sameXY && Math.abs(zOf(s.node1) - zOf(s.node2)) > EPS;
    if (!vertical) return;

    const topNode = zOf(s.node1) > zOf(s.node2) ? s.node1 : s.node2;
    if (Math.abs(zOf(topNode) - currentMaxZ) < EPS) {
      columnByTopNodeId.set(topNode.id, s);
    }
  });

  // Vigas del nivel superior (a replicar). Se capturan ANTES de agregar nada.
  const topLevelBeams = context.shapes.filter(
    (beam) =>
      beam.node1 &&
      beam.node2 &&
      Math.abs(zOf(beam.node1) - currentMaxZ) < EPS &&
      Math.abs(zOf(beam.node2) - currentMaxZ) < EPS,
  );

  // Nuevas columnas (currentMaxZ → newZ), copiando la sección de la columna de abajo.
  topLevelNodes.forEach((originalNode) => {
    const newNode = nodeMap.get(originalNode.id);
    if (!newNode) return;

    const column = new Beam(context.globalE, context.globalA);
    column.frameType = "column";
    column.structuralRole = "column";
    column.elementType = "column";
    column.type = "column";
    column.addNode(originalNode);
    column.addNode(newNode);

    copyFrameAssignments(columnByTopNodeId.get(originalNode.id), column);

    context.shapes.push(column);
  });

  // Nuevas vigas (en newZ), copiando sección/material/cargas de la viga replicada.
  topLevelBeams.forEach((beam) => {
    const newNode1 = nodeMap.get(beam.node1.id);
    const newNode2 = nodeMap.get(beam.node2.id);

    if (!newNode1 || !newNode2) return;

    const newBeam = new Beam(context.globalE, context.globalA);
    newBeam.frameType = beam.frameType || "beam";
    newBeam.structuralRole = beam.structuralRole || "beam";
    newBeam.addNode(newNode1);
    newBeam.addNode(newNode2);

    copyFrameAssignments(beam, newBeam);

    context.shapes.push(newBeam);
  });

  // Nuevas losas/áreas (en newZ), copiando las del nivel superior con sus asignaciones.
  const topLevelAreas = (context.areas || []).filter(
    (a) =>
      Array.isArray(a.points) &&
      a.points.length >= 3 &&
      a.points.every((p) => Math.abs(Number(p.z ?? a.z ?? 0) - currentMaxZ) < EPS),
  );

  if (topLevelAreas.length) {
    let maxAreaId = (context.areas || []).reduce(
      (m, a) => Math.max(m, Number(a.id) || 0),
      0,
    );

    topLevelAreas.forEach((area) => {
      const newArea = new Area(area.areaType || "slab", newZ);
      newArea.id = ++maxAreaId;

      area.points.forEach((p) => {
        newArea.addPoint({ x: p.x, y: p.y, z: newZ });
      });

      copyAreaAssignments(area, newArea);

      context.areas.push(newArea);
    });
  }

  renumberModel(context);
  context.markAnalysisResultsOutdated?.("Se agregó un piso duplicado.");
  context.sync3D();
  context.redraw?.();
  context.showMessage?.(
    `🏗️ Piso duplicado a ${newZ} m (columnas, vigas y losas con sus asignaciones).`,
  );
}

export function extrudeTo3D(context, floorHeight = 3, numFloors = 1) {
  if (!context.nodes?.length) {
    context.showMessage?.("⚠️ No hay nodos para extruir", "warning");
    return;
  }

  const groundNodes = context.nodes.filter((node) => (node.position.z || 0) === 0);

  if (!groundNodes.length) {
    context.showMessage?.("⚠️ No hay nodos en planta baja", "warning");
    return;
  }

  for (let floor = 1; floor <= numFloors; floor++) {
    const z = floor * floorHeight;

    const floorNodes = groundNodes.map((node) => {
      const newNode = new StructuralNode(
        { x: node.position.x, y: node.position.y },
        context.nodes.length + 1,
        z,
      );
      context.nodes.push(newNode);
      return newNode;
    });

    groundNodes.forEach((node, idx) => {
      const column = new Beam(context.globalE, context.globalA);
      column.addNode(node);
      column.addNode(floorNodes[idx]);
      context.shapes.push(column);
    });
  }

  renumberModel(context);
  context.sync3D();
  context.showMessage?.(`✅ ${numFloors} piso(s) agregados correctamente`);
}

export function selectAllNodes(context) {
  context.setState(context.selectedNodesState, {
    selectedNodes: [...context.nodes],
  });

  context.showMessage?.(`✅ ${context.nodes.length} nodos seleccionados`);
}

export function selectNodesByHeight(context, minZ, maxZ) {
  const selected = context.nodes.filter((node) => {
    const z = node.position.z || 0;
    return z >= minZ && z <= maxZ;
  });

  context.setState(context.selectedNodesState, {
    selectedNodes: selected,
  });

  context.showMessage?.(`✅ ${selected.length} nodos seleccionados (altura ${minZ}-${maxZ}m)`);
}

export function createTestFrame(scene = null) {
  const activeScene = scene || getScene();
  if (!activeScene) {
    console.error("No hay escena Babylon.js disponible");
    return [];
  }

  const created = [];

  const columnColor = new BABYLON.Color3(0.4, 0.6, 0.9);
  const beamColor = new BABYLON.Color3(0.9, 0.6, 0.2);
  const nodeColor = new BABYLON.Color3(1, 0.3, 0.3);

  const nodes = [
    { id: 1, x: 0, y: 0, z: 0 },
    { id: 2, x: 5, y: 0, z: 0 },
    { id: 3, x: 0, y: 0, z: 3 },
    { id: 4, x: 5, y: 0, z: 3 },
  ];

  nodes.forEach((node) => {
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      `test_node_${node.id}`,
      { diameter: 0.2, segments: 16 },
      activeScene,
    );

    sphere.position = mapToBabylon(node.x, node.y, node.z);

    const material = new BABYLON.StandardMaterial(`test_nodeMat_${node.id}`, activeScene);
    material.diffuseColor = nodeColor;
    material.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.1);
    sphere.material = material;

    created.push(registerViewerElement(sphere));
  });

  const columns = [
    { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 3 } },
    { start: { x: 5, y: 0, z: 0 }, end: { x: 5, y: 0, z: 3 } },
  ];

  columns.forEach((col, idx) => {
    const start = mapToBabylon(col.start.x, col.start.y, col.start.z);
    const end = mapToBabylon(col.end.x, col.end.y, col.end.z);

    const direction = end.subtract(start);
    const length = direction.length();

    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
      `test_column_${idx}`,
      { height: length, diameter: 0.15, tessellation: 8 },
      activeScene,
    );

    cylinder.position = start.add(end).scale(0.5);

    const quat = BABYLON.Quaternion.FromUnitVectorsToRef(
      BABYLON.Vector3.Up(),
      direction.normalize(),
      new BABYLON.Quaternion(),
    );
    cylinder.rotationQuaternion = quat;

    const material = new BABYLON.StandardMaterial(`test_columnMat_${idx}`, activeScene);
    material.diffuseColor = columnColor;
    cylinder.material = material;

    created.push(registerViewerElement(cylinder));
  });

  const beamStart = mapToBabylon(0, 0, 3);
  const beamEnd = mapToBabylon(5, 0, 3);
  const beamDirection = beamEnd.subtract(beamStart);
  const beamLength = beamDirection.length();

  const beam = BABYLON.MeshBuilder.CreateCylinder(
    "test_beam",
    { height: beamLength, diameter: 0.12, tessellation: 8 },
    activeScene,
  );

  beam.position = beamStart.add(beamEnd).scale(0.5);
  beam.rotationQuaternion = BABYLON.Quaternion.FromUnitVectorsToRef(
    BABYLON.Vector3.Up(),
    beamDirection.normalize(),
    new BABYLON.Quaternion(),
  );

  const beamMat = new BABYLON.StandardMaterial("test_beamMat", activeScene);
  beamMat.diffuseColor = beamColor;
  beam.material = beamMat;

  created.push(registerViewerElement(beam));

  const arrowCyl = BABYLON.MeshBuilder.CreateCylinder(
    "arrow_cyl",
    { height: 1.2, diameter: 0.05 },
    activeScene,
  );
  arrowCyl.position = new BABYLON.Vector3(0.6, 3.5, 0);
  arrowCyl.rotation.z = Math.PI / 2;

  const arrowCone = BABYLON.MeshBuilder.CreateCylinder(
    "arrow_cone",
    { height: 0.3, diameterTop: 0, diameterBottom: 0.15 },
    activeScene,
  );
  arrowCone.position = new BABYLON.Vector3(1.3, 3.5, 0);
  arrowCone.rotation.z = Math.PI / 2;

  const arrowMat = new BABYLON.StandardMaterial("arrowMat", activeScene);
  arrowMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
  arrowCyl.material = arrowMat;
  arrowCone.material = arrowMat;

  created.push(registerViewerElement(arrowCyl));
  created.push(registerViewerElement(arrowCone));

  const loadText = createSimpleAxisLabel("50 kN", new BABYLON.Color3(1, 0.3, 0.3), activeScene);
  if (loadText) {
    loadText.position = new BABYLON.Vector3(1.8, 3.8, 0);
    created.push(registerViewerElement(loadText));
  }

  return created;
}

export function showTestFrame(context) {
  const viewer = getViewer3DState();

  if (!context.show3DView) {
    context.toggleView3D();

    setTimeout(() => {
      createTestFrame();
    }, 500);

    return;
  }

  if (viewer.scene) {
    viewer.elements.forEach((el) => {
      if (el?.dispose) el.dispose();
    });
    viewer.elements = [];

    createTestFrame(viewer.scene);
  }
}