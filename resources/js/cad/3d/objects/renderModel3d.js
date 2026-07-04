import * as BABYLON from "@babylonjs/core";
import { createNode3D, updateNode3D } from "./node3d.js";
import { createBeam3D, updateBeam3D } from "./beam3d.js";
import { createArea3D, updateArea3D } from "./area3d.js";

function getAreaElevation(area) {
  if (typeof area?.z === "number") return area.z;
  if (area?.points?.length && typeof area.points[0]?.z === "number") return area.points[0].z;
  return 0;
}

function pointInPolygon2D(point, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect =
      ((yi > point.y) !== (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-9) + xi);

    if (intersect) inside = !inside;
  }

  return inside;
}

function getPolygonCentroid(points = []) {
  if (!points.length) return null;

  let x = 0;
  let y = 0;

  points.forEach((p) => {
    x += p.x ?? 0;
    y += p.y ?? 0;
  });

  return {
    x: x / points.length,
    y: y / points.length,
  };
}

function openingBelongsToSlab(opening, slab) {
  if (!opening?.points?.length || !slab?.points?.length) return false;

  const zOpen = getAreaElevation(opening);
  const zSlab = getAreaElevation(slab);

  if (Math.abs(zOpen - zSlab) > 1e-6) return false;

  const center = getPolygonCentroid(opening.points);
  if (!center) return false;

  return pointInPolygon2D(center, slab.points);
}

// =====================================================
// DETECTAR BARRA 3D-ONLY / INCLINADA EN EL 3D
// Identifica barras creadas entre plantas/elevaciones.
// =====================================================
function isFrame3DOnly(frame) {
  if (!frame?.node1?.position || !frame?.node2?.position) return false;

  if (
    frame.is3DOnlyFrame === true ||
    frame.isCrossViewFrame === true ||
    frame.showIn2D === false
  ) {
    return true;
  }

  // Si los flags están explícitamente marcados como NO 3D-only, respetar eso
  // sin caer al check geométrico (evita falsos positivos en diagonales de elevación).
  if (frame.is3DOnlyFrame === false && frame.showIn2D === true) {
    return false;
  }

  // Fallback geométrico solo si los flags no están definidos
  const p1 = frame.node1.position;
  const p2 = frame.node2.position;

  const tol = 0.001;

  const dx = Math.abs(Number(p2.x || 0) - Number(p1.x || 0));
  const dy = Math.abs(Number(p2.y || 0) - Number(p1.y || 0));
  const dz = Math.abs(Number(p2.z || 0) - Number(p1.z || 0));

  return dz > tol && (dx > tol || dy > tol);
}

// =====================================================
// 3D > DETECTAR BARRA SELECCIONADA
// Reconoce selección directa, selección por estado actual
// y selección especial 3D-only desde Alt + clic.
// =====================================================
function isFrameSelected3D(frame, context = null) {
  if (!frame) return false;

  if (
    frame.selected === true ||
    frame.isSelected === true ||
    frame.highlighted3D === true
  ) {
    return true;
  }

  const selectedFromContext = [
    ...(context?.selectedBeams || []),
    ...(context?.selectedObjects || []),

    ...(context?.selectedBeamsState?.selectedBeams || []),
    ...(context?.selectedBeamsState?.selectedObjects || []),

    ...(context?.currentState?.selectedBeams || []),
    ...(context?.currentState?.selectedObjects || []),
  ];

  // Solo comparar contra BARRAS reales (node1+node2). Los ids de nodos y
  // áreas son secuencias independientes que colisionan con los de barras:
  // sin este filtro, seleccionar el nodo id=7 pintaba también la barra id=7.
  return selectedFromContext.some(
    (selected) => selected?.node1 && selected?.node2 && selected?.id === frame?.id,
  );
}

// =====================================================
// 3D > CREAR / REUTILIZAR MATERIALES DE BARRAS
// Actualiza el color aunque el material ya exista.
// =====================================================
function getFrameMaterial(scene, key, color) {
  if (!scene) return null;

  if (!scene.__frame3DMaterials) {
    scene.__frame3DMaterials = {};
  }

  const BABYLONRef = BABYLON;

  if (!BABYLONRef) return null;

  if (!scene.__frame3DMaterials[key]) {
    scene.__frame3DMaterials[key] =
      new BABYLONRef.StandardMaterial(key, scene);
  }

  const material = scene.__frame3DMaterials[key];

  material.diffuseColor = color;
  material.emissiveColor = color.scale(0.25);
  material.specularColor = new BABYLONRef.Color3(0.2, 0.2, 0.2);

  return material;
}

// =====================================================
// 3D > OBTENER COLOR/MATERIAL DE BARRA
// Barra 3D-only normal: amarillo.
// Barra 3D-only seleccionada: fucsia.
// Barra normal seleccionada: naranja.
// =====================================================
function getFrameVisualConfig(scene, frame, context = null) {
  const BABYLONRef = BABYLON;

  if (!BABYLONRef) {
    return {
      color: null,
      material: null,
      alpha: 1,
    };
  }

  const selected = isFrameSelected3D(frame, context);
  const is3DOnly = isFrame3DOnly(frame);

  // =====================================================
  // 3D > BARRA SELECCIONADA
  // Si es barra inclinada/3D-only seleccionada, se pinta fucsia.
  // =====================================================
  if (selected) {
    const color = is3DOnly
      ? new BABYLONRef.Color3(1.0, 0.0, 0.85) // fucsia: 3D-only seleccionada
      : new BABYLONRef.Color3(1.0, 0.55, 0.1); // naranja: barra normal seleccionada

    return {
      color,
      material: getFrameMaterial(
        scene,
        is3DOnly ? "mat_frame_3d_only_selected" : "mat_frame_selected",
        color
      ),
      alpha: 1,
    };
  }

  // =====================================================
  // 3D > BARRA 3D-ONLY NORMAL
  // Amarillo cuando no está seleccionada.
  // =====================================================
  if (is3DOnly) {
    const color = new BABYLONRef.Color3(1.0, 0.85, 0.05); // amarillo

    return {
      color,
      material: getFrameMaterial(scene, "mat_frame_3d_only", color),
      alpha: 1,
    };
  }

  // =====================================================
  // 3D > BARRA NORMAL NO SELECCIONADA
  // Amarillo para que coincida con el canvas 2D.
  // =====================================================
  const color = new BABYLONRef.Color3(1.0, 0.85, 0.05); // amarillo

  return {
    color,
    material: getFrameMaterial(scene, "mat_frame_normal", color),
    alpha: 1,
  };
}

// =====================================================
// APLICAR COLOR A MESH O HIJOS EN EL 3D
// Funciona con LinesMesh, Mesh, TransformNode o contenedores.
// =====================================================
function applyFrameVisualToMesh(mesh, visualConfig) {
  if (!mesh || mesh.isDisposed?.()) return;

  const { color, material, alpha } = visualConfig || {};

  // Si es línea de Babylon, usa color/alpha directamente.
  if ("color" in mesh && color) {
    mesh.color = color;
  }

  if ("alpha" in mesh && typeof alpha === "number") {
    mesh.alpha = alpha;
  }

  // Si es mesh sólido/cilindro/tubo, usa material.
  if ("material" in mesh && material) {
    mesh.material = material;
  }

  if (typeof mesh.getChildMeshes === "function") {
    mesh.getChildMeshes().forEach((child) => {
      applyFrameVisualToMesh(child, visualConfig);
    });
  }
}

// =====================================================
// APLICAR ESTADO VISUAL A BARRA EN EL 3D
// Marca metadata y pinta según sea normal, 3D-only o seleccionada.
// =====================================================
function applyFrame3DVisualState(mesh, frame, scene, context = null) {
  if (!mesh || !frame) return;

  const is3DOnly = isFrame3DOnly(frame);
  const isSelected = isFrameSelected3D(frame, context);

  // if (is3DOnly || isSelected) {
  //   console.log("🎨 3D pintando barra:", {
  //     id: frame.id,
  //     is3DOnly,
  //     isSelected,
  //     selected: frame.selected,
  //     isSelectedFlag: frame.isSelected,
  //     highlighted3D: frame.highlighted3D,
  //   });
  // }

  const visualConfig = getFrameVisualConfig(scene, frame, context);

  applyFrameVisualToMesh(mesh, visualConfig);

  mesh.isPickable = true;

  mesh.metadata = {
    ...(mesh.metadata || {}),
    objectType: "frame",
    type: "beam",
    frameId: frame.id,
    id: frame.id,
    sourceFrame: frame,
    is3DOnlyFrame: is3DOnly,
    isSelected,
  };

  // =====================================================
  // 3D > PROPAGAR METADATA A HIJOS
  // Si la barra tiene meshes internos, también podrán seleccionarse.
  // =====================================================
  if (typeof mesh.getChildMeshes === "function") {
    mesh.getChildMeshes().forEach((child) => {
      child.isPickable = true;

      child.metadata = {
        ...(child.metadata || {}),
        objectType: "frame",
        type: "beam",
        frameId: frame.id,
        id: frame.id,
        sourceFrame: frame,
        is3DOnlyFrame: is3DOnly,
        isSelected,
      };
    });
  }
}

// =====================================================
// 3D > CONVERTIR PUNTO DEL MODELO A BABYLON
// Modelo: X/Y/Z. Babylon: X/Z/Y visual.
// =====================================================
function mapFramePointToBabylon(point) {
  const BABYLONRef = BABYLON;

  return new BABYLONRef.Vector3(
    Number(point?.x || 0),
    Number(point?.z || 0),
    Number(point?.y || 0)
  );
}

// =====================================================
// 3D > MATERIAL DE HIGHLIGHT DE BARRA SELECCIONADA
// Color usado cuando una barra inclinada/3D-only está seleccionada.
// =====================================================
function getSelectedFrameHighlightMaterial(scene) {
  const BABYLONRef = BABYLON;

  if (!scene || !BABYLONRef) return null;

  if (!scene.__selectedFrameHighlightMaterial) {
    scene.__selectedFrameHighlightMaterial = new BABYLONRef.StandardMaterial(
      "mat_selected_frame_highlight_3d",
      scene
    );
  }

  const mat = scene.__selectedFrameHighlightMaterial;

  // COLOR DE LA BARRA INCLINADA SELECCIONADA EN 3D
  mat.diffuseColor = new BABYLONRef.Color3(1.0, 0.85, 0.05);   // verde fuerte
  mat.emissiveColor = new BABYLONRef.Color3(0.7, 0.45, 0.0);  // brillo verde
  mat.specularColor = new BABYLONRef.Color3(0.2, 0.2, 0.2);
  mat.alpha = 1;

  return mat;
}

// =====================================================
// 3D > CREAR HIGHLIGHT SUPERPUESTO DE BARRA
// Dibuja un tubo fucsia encima de la barra seleccionada.
// =====================================================
function createSelectedFrameHighlight3D(scene, frame) {
  if (!scene || !BABYLON) return null;
  if (!frame?.node1?.position || !frame?.node2?.position) return null;

  const start = new BABYLON.Vector3(
    Number(frame.node1.position.x || 0),
    Number(frame.node1.position.z || 0),
    Number(frame.node1.position.y || 0)
  );

  const end = new BABYLON.Vector3(
    Number(frame.node2.position.x || 0),
    Number(frame.node2.position.z || 0),
    Number(frame.node2.position.y || 0)
  );

  const highlight = BABYLON.MeshBuilder.CreateTube(
    `frame_selected_highlight_${frame.id}`,
    {
      path: [start, end],
      radius: 0.09,
      tessellation: 16,
      cap: BABYLON.Mesh.CAP_ALL,
      updatable: false,
    },
    scene
  );

  highlight.material = getSelectedFrameHighlightMaterial(scene);
  highlight.isPickable = false;

  highlight.metadata = {
    objectType: "frame-highlight",
    frameId: frame.id,
    sourceFrame: frame,
  };

  console.log("💗 Highlight 3D creado para barra seleccionada:", {
    id: frame.id,
    start,
    end,
  });

  return highlight;
}

// =====================================================
// 3D > ACTUALIZAR HIGHLIGHT DE BARRA SELECCIONADA
// Crea o elimina el resaltado según el estado de selección.
// =====================================================
function updateSelectedFrameHighlight3D(scene, highlightMap, frame, context = null) {
  if (!scene || !highlightMap || !frame?.id) return;

  const shouldHighlight =
    isFrame3DOnly(frame) &&
    isFrameSelected3D(frame, context);

  const existingHighlight = highlightMap.get(frame.id);

  // =====================================================
  // 3D > ELIMINAR HIGHLIGHT SI YA NO ESTÁ SELECCIONADA
  // Esto se ejecuta cuando presionas Esc o limpias selección.
  // =====================================================
  if (!shouldHighlight) {
    if (existingHighlight && !existingHighlight.isDisposed?.()) {
      existingHighlight.dispose(false, false);

      console.log("🧹 Highlight 3D eliminado:", {
        id: frame.id,
        selected: frame.selected,
        isSelected: frame.isSelected,
        highlighted3D: frame.highlighted3D,
      });
    }

    highlightMap.delete(frame.id);
    return;
  }

  // Recreamos para asegurar posición y color correctos.
  if (existingHighlight && !existingHighlight.isDisposed?.()) {
    existingHighlight.dispose(false, false);
  }

  const newHighlight = createSelectedFrameHighlight3D(scene, frame);

  if (newHighlight) {
    highlightMap.set(frame.id, newHighlight);

    console.log("💗 Highlight 3D creado para barra seleccionada:", {
      id: frame.id,
      is3DOnlyFrame: frame.is3DOnlyFrame,
      selected: frame.selected,
      isSelected: frame.isSelected,
      highlighted3D: frame.highlighted3D,
    });
  }
}

// =====================================================
// 3D > METADATA DE NODO
// Permite seleccionar nodos 3D y usarlos como puntos
// para graficar barras directamente en el visor 3D.
// =====================================================
function applyNode3DMetadata(nodeMesh, node) {
  if (!nodeMesh || !node) return;

  nodeMesh.isPickable = true;

  nodeMesh.metadata = {
    ...(nodeMesh.metadata || {}),
    objectType: "node",
    type: "node",
    nodeId: node.id,
    id: node.id,
    sourceNode: node,
  };

  // Si el nodo tiene meshes hijos, también serán detectables.
  if (typeof nodeMesh.getChildMeshes === "function") {
    nodeMesh.getChildMeshes().forEach((child) => {
      child.isPickable = true;

      child.metadata = {
        ...(child.metadata || {}),
        objectType: "node",
        type: "node",
        nodeId: node.id,
        id: node.id,
        sourceNode: node,
      };
    });
  }
}

export function renderModel3D(viewer3D, nodes = [], shapes = [], areas = [], context = null) {
  if (!viewer3D || !viewer3D.scene) return;

  const scene = viewer3D.scene;

  // =====================================================
  // 3D > ESTADO PERSISTENTE DE MALLAS
  // No reinicia los mapas en cada render, para poder
  // eliminar highlights anteriores correctamente.
  // =====================================================
  if (!scene.__structuralState) {
    scene.__structuralState = {};
  }

  if (!scene.__structuralState.nodeMeshes) {
    scene.__structuralState.nodeMeshes = new Map();
  }

  if (!scene.__structuralState.beamMeshes) {
    scene.__structuralState.beamMeshes = new Map();
  }

  if (!scene.__structuralState.areaMeshes) {
    scene.__structuralState.areaMeshes = new Map();
  }

  if (!scene.__structuralState.beamHighlightMeshes) {
    scene.__structuralState.beamHighlightMeshes = new Map();
  }

  const {
    nodeMeshes,
    beamMeshes,
    areaMeshes,
    beamHighlightMeshes,
  } = scene.__structuralState;

  const nodeIds = new Set();
  const beamIds = new Set();
  const areaIds = new Set();

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // =========================
  // NODOS
  // =========================
  for (const node of nodes) {
    if (!node || node.id == null) continue;

    nodeIds.add(node.id);

    let nodeMesh = nodeMeshes.get(node.id);

    if (nodeMesh && !nodeMesh.isDisposed()) {
      updateNode3D(nodeMesh, node);
    } else {
      nodeMesh = createNode3D(scene, node);

      if (nodeMesh) {
        nodeMeshes.set(node.id, nodeMesh);
      }
    }

    // =====================================================
    // 3D > METADATA DE NODO
    // Permite usar los nodos como puntos para dibujar barras en 3D.
    // Se aplica tanto a nodos nuevos como a nodos ya existentes.
    // =====================================================
    if (nodeMesh && !nodeMesh.isDisposed?.()) {
      nodeMesh.isPickable = true;

      nodeMesh.metadata = {
        ...(nodeMesh.metadata || {}),
        objectType: "node",
        type: "node",
        nodeId: node.id,
        id: node.id,
        sourceNode: node,
      };

      // Si el nodo tiene meshes hijos, también serán detectables.
      if (typeof nodeMesh.getChildMeshes === "function") {
        nodeMesh.getChildMeshes().forEach((child) => {
          child.isPickable = true;

          child.metadata = {
            ...(child.metadata || {}),
            objectType: "node",
            type: "node",
            nodeId: node.id,
            id: node.id,
            sourceNode: node,
          };
        });
      }

      // =====================================================
      // 3D > COLOR DEL NODO SEGÚN ESTADO
      // Azul: seleccionado. Rojo: activo. Gris tenue: inactivo.
      // =====================================================
      const isNodeSelected =
        node.selected === true ||
        context?.moveObjectState?.selectedObject?.id === node.id ||
        context?.selectedNodesState?.selectedObjects?.some((n) => n?.id === node.id);

      if (!nodeMesh.material || nodeMesh.material.isDisposed?.()) {
        nodeMesh.material = new BABYLON.StandardMaterial(`nodeMat3D_${node.id}`, scene);
      }

      const mat = nodeMesh.material;

      if (isNodeSelected) {
        mat.diffuseColor = new BABYLON.Color3(0.1, 0.45, 1.0);
        mat.emissiveColor = new BABYLON.Color3(0.02, 0.15, 0.5);
        mat.alpha = 1;
        nodeMesh.scaling.setAll(1.5);
      } else {
        mat.diffuseColor = new BABYLON.Color3(1.0, 0.3, 0.3);
        mat.emissiveColor = new BABYLON.Color3(0.1, 0.04, 0.04);
        mat.alpha = 1;
        nodeMesh.scaling.setAll(1.0);
      }
    }
  }

  for (const [nodeId, mesh] of nodeMeshes.entries()) {
    if (!nodeIds.has(nodeId)) {
      if (mesh && !mesh.isDisposed()) {
        safeDisposeMeshAfterRender(mesh, scene);
      }

      nodeMeshes.delete(nodeId);
    }
  }

  // =========================
  // BARRAS
  // =========================
  for (const shape of shapes) {
    if (!shape || shape.id == null) continue;

    beamIds.add(shape.id);

    const existingMesh = beamMeshes.get(shape.id);

    const node1 =
      typeof shape.node1 === "object"
        ? shape.node1
        : nodeMap.get(shape.node1);

    const node2 =
      typeof shape.node2 === "object"
        ? shape.node2
        : nodeMap.get(shape.node2);

    if (!node1 || !node2) continue;

    if (existingMesh && !existingMesh.isDisposed()) {
      const updatedMesh = updateBeam3D(existingMesh, shape, node1, node2);

      const meshToPaint = updatedMesh || existingMesh;

      if (updatedMesh && updatedMesh !== existingMesh) {
        beamMeshes.set(shape.id, updatedMesh);
      }

      // =====================================================
      // 3D > ACTUALIZAR COLOR DE BARRA EXISTENTE
      // Si fue seleccionada desde 2D, cambia de color en 3D.
      // =====================================================
      applyFrame3DVisualState(meshToPaint, { ...shape, node1, node2 }, scene, context);
    } else {
      const beamMesh = createBeam3D(scene, {
        ...shape,
        node1,
        node2,
      });

      if (beamMesh) {
        applyFrame3DVisualState(beamMesh, { ...shape, node1, node2 }, scene, context);

        beamMeshes.set(shape.id, beamMesh);
      }
    }

    // =====================================================
    // 3D > HIGHLIGHT DE BARRA 3D-ONLY SELECCIONADA
    // Se actualiza en cada render para que el tubo de highlight
    // se cree, mueva o elimine correctamente al deseleccionar.
    // =====================================================
    updateSelectedFrameHighlight3D(
      scene,
      beamHighlightMeshes,
      { ...shape, node1, node2 },
      context
    );
  }

  for (const [beamId, mesh] of beamMeshes.entries()) {
    if (!beamIds.has(beamId)) {
      if (mesh && !mesh.isDisposed()) {
        safeDisposeMeshAfterRender(mesh, scene);
      }

      beamMeshes.delete(beamId);
    }
  }

  // =====================================================
  // 3D > LIMPIAR HIGHLIGHTS DE BARRAS ELIMINADAS
  // Evita que queden resaltados fantasmas en la escena.
  // =====================================================
  for (const [beamId, highlightMesh] of beamHighlightMeshes.entries()) {
    if (!beamIds.has(beamId)) {
      if (highlightMesh && !highlightMesh.isDisposed?.()) {
        highlightMesh.dispose(false, false);
      }

      beamHighlightMeshes.delete(beamId);
    }
  }

  // =========================
  // ÁREAS
  // =========================
  const openings = areas.filter((a) => a?.areaType === "opening");
  const nonOpeningAreas = areas.filter((a) => a?.areaType !== "opening");

  for (const area of nonOpeningAreas) {
    if (!area || area.id == null) continue;

    areaIds.add(area.id);

    const existingMesh = areaMeshes.get(area.id);

    const holes =
      area.areaType === "slab"
        ? openings.filter((opening) => openingBelongsToSlab(opening, area))
        : [];

    if (existingMesh && !existingMesh.isDisposed()) {
      const updatedMesh = updateArea3D(existingMesh, scene, area, { holes });
      if (updatedMesh) {
        areaMeshes.set(area.id, updatedMesh);
      }
    } else {
      const areaMesh = createArea3D(scene, area, { holes });
      if (areaMesh) {
        areaMeshes.set(area.id, areaMesh);
      }
    }
  }

  // Renderizar también los contornos de abertura
  for (const opening of openings) {
    if (!opening || opening.id == null) continue;

    const openingMeshId = `opening-${opening.id}`;
    areaIds.add(openingMeshId);

    const existingMesh = areaMeshes.get(openingMeshId);

    if (existingMesh && !existingMesh.isDisposed()) {
      const updatedMesh = updateArea3D(existingMesh, scene, opening);
      if (updatedMesh) {
        areaMeshes.set(openingMeshId, updatedMesh);
      }
    } else {
      const mesh = createArea3D(scene, opening);
      if (mesh) {
        areaMeshes.set(openingMeshId, mesh);
      }
    }
  }

  for (const [areaId, mesh] of areaMeshes.entries()) {
    if (!areaIds.has(areaId)) {
      if (mesh && !mesh.isDisposed()) safeDisposeMeshAfterRender(mesh, scene);
      areaMeshes.delete(areaId);
    }
  }

  function safeDisposeMeshAfterRender(mesh, scene) {
    if (!mesh || mesh.isDisposed()) return;

    mesh.setEnabled(false);
    mesh.isPickable = false;

    const disposeNow = () => {
      try {
        if (mesh && !mesh.isDisposed()) {
          // Desvincular el material antes de eliminar el mesh.
          // No eliminamos materiales aquí para evitar errores WebGL en Babylon.
          mesh.material = null;

          // IMPORTANTE:
          // El segundo parámetro debe ser false.
          // true puede eliminar material/texturas y provocar:
          // WebGL INVALID_VALUE getProgramParameter deleted object.
          mesh.dispose(false, false);
        }
      } catch (error) {
        console.warn("No se pudo liberar mesh 3D:", error);
      }
    };

    if (scene?.onAfterRenderObservable) {
      scene.onAfterRenderObservable.addOnce(disposeNow);
    } else {
      setTimeout(disposeNow, 0);
    }
  }
}