import * as BABYLON from "@babylonjs/core";
import { drawCustomGeneralGrids3D } from "./grid3d.js";
import { renderModel3D } from "./objects/renderModel3d.js";
import { DeflectionAnimator, AnimationManager } from "./animation3d.js";

const VIEWER_STATE = {
  engine: null,
  scene: null,
  camera: null,
  canvas: null,
  elements: [],
  initialized: false,
  resizeHandler: null,

  // Evita renderizar mientras se limpian o recrean objetos 3D
  isUpdating: false,

  needsSync: false,

  // Guarda el render loop para poder detenerlo correctamente
  renderLoop: null,

  //Nuevo estado para animación de deformada
  originalPositions: null,
  deflectionAnimator: null,
  animationManger: null,

  // Estado para animación sísmica
  seismicAnimator: null,
};

let currentAnimator = null;

function isSceneDisposed(scene) {
  if (!scene) return true;

  if (typeof scene.isDisposed === "function") {
    return scene.isDisposed();
  }

  return Boolean(scene.isDisposed);
}

// DEFINE COLORES3D BABYLON
const COLORS_3D = {
  activeModel: new BABYLON.Color3(1, 0.3, 0.3), // rojo claro
  activeModelGlow: new BABYLON.Color3(0.35, 0.28, 0.02),

  inactiveModel: new BABYLON.Color3(1, 0, 0), // rojo

  selectedModel: new BABYLON.Color3(1.0, 0.55, 0.1), // naranja (barras)
  selectedGlow: new BABYLON.Color3(0.45, 0.18, 0.02),

  selectedNode: new BABYLON.Color3(0.1, 0.45, 1.0),  // azul (nodos seleccionados)
  selectedNodeGlow: new BABYLON.Color3(0.02, 0.15, 0.5),

  // =====================================================
  // 3D > COLORES PARA BARRAS 3D-ONLY
  // Celeste: barra inclinada normal.
  // Amarillo fuerte: barra inclinada seleccionada.
  // =====================================================
  frame3DOnly: new BABYLON.Color3(0.1, 0.75, 1.0),
  frame3DOnlySelected: new BABYLON.Color3(1.0, 0.9, 0.05),
};

function getViewerContainer() {
  return document.getElementById("viewer3d-container");
}

function disposeViewer() {
  try {
    VIEWER_STATE.isUpdating = true;

    if (VIEWER_STATE.engine && VIEWER_STATE.renderLoop) {
      VIEWER_STATE.engine.stopRenderLoop(VIEWER_STATE.renderLoop);
      VIEWER_STATE.renderLoop = null;
    }

    VIEWER_STATE.elements.forEach((element) => {
      if (element && !element.isDisposed?.()) {
        element.dispose?.(false, true);
      }
    });

    VIEWER_STATE.elements = [];

    if (VIEWER_STATE.resizeHandler) {
      window.removeEventListener("resize", VIEWER_STATE.resizeHandler);
      VIEWER_STATE.resizeHandler = null;
    }

    if (VIEWER_STATE.camera) {
      VIEWER_STATE.camera.detachControl?.();
    }

    if (VIEWER_STATE.scene && !isSceneDisposed(VIEWER_STATE.scene)) {
      VIEWER_STATE.scene.dispose();
    }

    if (VIEWER_STATE.engine) {
      VIEWER_STATE.engine.dispose();
    }

    VIEWER_STATE.engine = null;
    VIEWER_STATE.scene = null;
    VIEWER_STATE.camera = null;
    VIEWER_STATE.canvas = null;
    VIEWER_STATE.initialized = false;
  } catch (error) {
    console.warn("Error al destruir el visor 3D:", error);
  } finally {
    VIEWER_STATE.isUpdating = false;
  }
}

function createCanvas(container) {
  const canvas = document.createElement("canvas");
  canvas.id = "babylon-canvas";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";

  const rect = container.getBoundingClientRect();
  canvas.width = rect.width || container.clientWidth || 800;
  canvas.height = rect.height || container.clientHeight || 600;

  container.innerHTML = "";
  container.appendChild(canvas);

  return canvas;
}

function createCamera(scene, canvas) {
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 4, Math.PI / 5, 20, BABYLON.Vector3.Zero(), scene);

  camera.attachControl(canvas, true);
  camera.panningSensibility = 50;
  camera.zoomSensibility = 50;
  camera.wheelPrecision = 30;
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 200;
  camera.pinchPrecision = 50;

  camera.useBouncingBehavior = true;
  camera.useFramingBehavior = true;

  if (camera.framingBehavior) {
    camera.framingBehavior.elevationReturnTime = 500;
    camera.framingBehavior.zoomOnBoundingInfo = true;
  }

  return camera;
}

function createLights(scene) {
  const hemiLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.6;
  hemiLight.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);

  const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(1, -2, 1), scene);
  directionalLight.intensity = 0.8;
  directionalLight.position = new BABYLON.Vector3(5, 10, 5);

  const backLight = new BABYLON.DirectionalLight("backLight", new BABYLON.Vector3(-1, 0, -1), scene);
  backLight.intensity = 0.3;

  return { hemiLight, directionalLight, backLight };
}

function setupResizeHandler() {
  VIEWER_STATE.resizeHandler = () => {
    if (!VIEWER_STATE.engine) return;

    setTimeout(() => {
      try {
        VIEWER_STATE.engine.resize();
      } catch (error) {
        console.warn("Error al redimensionar el visor 3D:", error);
      }
    }, 100);
  };

  window.addEventListener("resize", VIEWER_STATE.resizeHandler);
}

function mapNodePositionTo3D(node) {
  return new BABYLON.Vector3(node.position.x, node.position.z || 0, node.position.y);
}

// HELPER FUNCTIONS
function belongsToActiveView(nodeOrBeam, context) {
  const view = context?.viewSet?.[context?.activeViewIndex];
  if (!view) return true;

  const tol = 0.05;

  const checkNode = (node) => {
    const x = node.position.x || 0;
    const y = node.position.y || 0;
    const z = node.position.z || 0;

    if (view.type === "plan") {
      return Math.abs(z - view.elevation) <= tol;
    }

    if (view.type === "elevation") {
      if (view.axis === "X") {
        return Math.abs(x - view.value) <= tol;
      }

      if (view.axis === "Y") {
        return Math.abs(y - view.value) <= tol;
      }
    }

    return true;
  };

  // Si es nodo
  if (nodeOrBeam?.position) {
    return checkNode(nodeOrBeam);
  }

  // Si es barra
  if (nodeOrBeam?.node1 && nodeOrBeam?.node2) {
    return checkNode(nodeOrBeam.node1) && checkNode(nodeOrBeam.node2);
  }

  return true;
}

function isNodeSelected(node, context) {
  if (context?.moveObjectState?.selectedObject?.id === node?.id) return true;
  const selectedNodes = context?.selectedNodesState?.selectedObjects ?? [];
  return selectedNodes.some((n) => n?.id === node?.id);
}

// =====================================================
// VALIDAR SI UNA BARRA ESTÁ SELECCIONADA EN EL 3D
// Reconoce selección normal y selección especial 3D-only.
// =====================================================
function isBeamSelected(beam, context) {
  if (!beam) return false;

  if (beam.selected === true || beam.isSelected === true || beam.highlighted3D === true) {
    return true;
  }

  const selectedBeamsState = context?.selectedBeamsState?.selectedObjects ?? [];

  const selectedBeamsDirect = context?.selectedBeams ?? [];

  const selectedBeams = [...selectedBeamsState, ...selectedBeamsDirect];

  return selectedBeams.some((b) => b?.id === beam?.id);
}

// =====================================================
// DETECTAR BARRA 3D-ONLY / INCLINADA EN EL 3D
// Identifica barras creadas entre plantas/elevaciones.
// =====================================================
function isBeam3DOnly(beam) {
  if (!beam?.node1?.position || !beam?.node2?.position) return false;

  if (beam.is3DOnlyFrame === true || beam.isCrossViewFrame === true || beam.showIn2D === false) {
    return true;
  }

  // Si los flags están explícitamente en false, respetar sin caer al check geométrico
  if (beam.is3DOnlyFrame === false && beam.showIn2D === true) {
    return false;
  }

  const p1 = beam.node1.position;
  const p2 = beam.node2.position;

  const tol = 0.001;

  const dx = Math.abs(Number(p2.x || 0) - Number(p1.x || 0));
  const dy = Math.abs(Number(p2.y || 0) - Number(p1.y || 0));
  const dz = Math.abs(Number(p2.z || 0) - Number(p1.z || 0));

  return dz > tol && (dx > tol || dy > tol);
}

function createNodeMesh(node, context) {
  const sphere = BABYLON.MeshBuilder.CreateSphere(
    `node_${node.id}`,
    { diameter: 0.08, segments: 8 },
    VIEWER_STATE.scene,
  );

  sphere.position = mapNodePositionTo3D(node);

  const material = new BABYLON.StandardMaterial(`nodeMat_${node.id}`, VIEWER_STATE.scene);

  const isActiveView = belongsToActiveView(node, context);
  const isSelected = isNodeSelected(node, context);

  if (isSelected) {
    material.diffuseColor = COLORS_3D.selectedNode;
    material.emissiveColor = COLORS_3D.selectedNodeGlow;
    material.alpha = 1;
    sphere.scaling = new BABYLON.Vector3(2.2, 2.2, 2.2);
  } else if (isActiveView) {
    material.diffuseColor = COLORS_3D.activeModel;
    material.emissiveColor = COLORS_3D.activeModelGlow;
    material.alpha = 1;
  } else {
    material.diffuseColor = COLORS_3D.inactiveModel;
    material.emissiveColor = new BABYLON.Color3(0.03, 0.03, 0.03);
    material.alpha = 0.12;
  }

  sphere.material = material;
  sphere.isPickable = true;
  sphere.metadata = { objectType: "node", type: "node", nodeId: node.id, id: node.id, sourceNode: node };

  VIEWER_STATE.elements.push(sphere);
}

// =====================================================
// CREAR MALLA DE BARRA EN EL 3D
// Pinta barras normales, barras 3D-only y barras seleccionadas.
// =====================================================
function createBeamMesh(beam, context) {
  const start = mapNodePositionTo3D(beam.node1);
  const end = mapNodePositionTo3D(beam.node2);

  const lines = BABYLON.MeshBuilder.CreateLines(`beam_${beam.id}`, { points: [start, end] }, VIEWER_STATE.scene);

  const isActiveView = belongsToActiveView(beam, context);
  const isSelected = isBeamSelected(beam, context);
  const is3DOnly = isBeam3DOnly(beam);

  // =====================================================
  // 3D > COLOR SEGÚN ESTADO
  // Seleccionada: amarillo fuerte.
  // 3D-only no seleccionada: celeste.
  // Normal activa: amarillo.
  // Normal inactiva: gris.
  // =====================================================
  if (isSelected) {
    lines.color = is3DOnly ? COLORS_3D.frame3DOnlySelected : COLORS_3D.selectedModel;

    lines.alpha = 1;
  } else if (is3DOnly) {
    lines.color = COLORS_3D.frame3DOnly;
    lines.alpha = 1;
  } else if (isActiveView) {
    lines.color = COLORS_3D.activeModel;
    lines.alpha = 1;
  } else {
    lines.color = COLORS_3D.inactiveModel;
    lines.alpha = 0.1;
  }

  lines.metadata = {
    type: "beam",
    objectType: "frame",
    id: beam.id,
    frameId: beam.id,
    sourceFrame: beam,
    is3DOnlyFrame: is3DOnly,
  };

  VIEWER_STATE.elements.push(lines);
}

export function initViewer3D(context, container) {
  if (VIEWER_STATE.initialized) return;

  VIEWER_STATE.animationManger = new AnimationManager();

  try {
    const canvas = createCanvas(container);
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      adaptToDeviceRatio: true,
    });

    if (!engine) {
      throw new Error("No se pudo crear el motor Babylon.js");
    }

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

    const camera = createCamera(scene, canvas);
    createLights(scene);

    VIEWER_STATE.engine = engine;
    VIEWER_STATE.scene = scene;
    VIEWER_STATE.camera = camera;
    VIEWER_STATE.canvas = canvas;
    VIEWER_STATE.initialized = true;

    if (typeof context.createFull3DGrid === "function") {
      context.createFull3DGrid(scene);
    }

    // if (context.referenceGrid && context.pendingGrid3D) {
    //     context.grid3DDrawn = false;
    //     context.drawReferenceGrid3D();
    //     context.pendingGrid3D = false;
    // } else if (context.referenceGrid && typeof context.drawReferenceGrid3D === "function") {
    //     context.drawReferenceGrid3D();
    // }
    if (context.referenceGrid && context.pendingGrid3D) {
      context.grid3DDrawn = false;
      context.drawReferenceGrid3D();
      drawCustomGeneralGrids3D(scene, context.referenceGrid, context.stories);
      context.pendingGrid3D = false;
    } else if (context.referenceGrid && typeof context.drawReferenceGrid3D === "function") {
      context.drawReferenceGrid3D();
      drawCustomGeneralGrids3D(scene, context.referenceGrid, context.stories);
    }

    let frameCount = 0;
    let lastTime = performance.now();

    const renderLoop = () => {
      const scene = VIEWER_STATE.scene;
      const engine = VIEWER_STATE.engine;

      if (!engine || !scene || isSceneDisposed(scene)) return;

      // Mientras sync3D limpia o reconstruye objetos, no renderizamos ese frame
      if (VIEWER_STATE.isUpdating) return;

      try {
        scene.render();

        frameCount++;

        const now = performance.now();
        if (now - lastTime >= 1000) {
          context.fps = frameCount;
          frameCount = 0;
          lastTime = now;
        }
      } catch (error) {
        console.warn("Render 3D omitido por escena no lista:", error);
      }
    };

    VIEWER_STATE.renderLoop = renderLoop;
    engine.runRenderLoop(renderLoop);

    setupResizeHandler();

    setTimeout(() => {
      drawIn3D(context);
      console.log("🎨 Escena 3D inicializada con contenido existente");
    }, 100);

    console.log("✅ Babylon.js inicializado correctamente");
  } catch (error) {
    console.error("Error inicializando Babylon.js:", error);
    disposeViewer();
  }
}

export function toggleView3D(context) {
  context.show3DView = !context.show3DView;

  if (!context.show3DView) {
    disposeViewer();
    return;
  }

  setTimeout(() => {
    const container = getViewerContainer();
    if (!container) return;

    disposeViewer();
    initViewer3D(context, container);
  }, 200);
}

export function clear3D() {
  if (!VIEWER_STATE.scene) return;
  clearModelElements();
}

export function sync3D(context, updateOnly = false) {
  if (!VIEWER_STATE.initialized || !VIEWER_STATE.scene) return;
  if (isSceneDisposed(VIEWER_STATE.scene)) return;

  if (VIEWER_STATE.isUpdating) {
    VIEWER_STATE.needsSync = true;
    return;
  }

  VIEWER_STATE.isUpdating = true;

  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        if (!VIEWER_STATE.scene || isSceneDisposed(VIEWER_STATE.scene)) return;

        if (context.referenceGrid && typeof context.drawReferenceGrid3D === "function") {
          context.drawReferenceGrid3D();

          drawCustomGeneralGrids3D(VIEWER_STATE.scene, context.referenceGrid, context.stories);
        }

        drawIn3D(context, updateOnly);
      } catch (error) {
        console.warn("Error sincronizando vista 3D:", error);
      } finally {
        VIEWER_STATE.isUpdating = false;
        context.syncPending = false;

        if (VIEWER_STATE.needsSync) {
          VIEWER_STATE.needsSync = false;
          sync3D(context);
        }
      }
    }, 50);
  });
}

// =====================================================
// 3D SELECTION > BUSCAR BARRA DESDE MESH PICKED
// Obtiene la barra original desde metadata del mesh seleccionado.
// =====================================================
function getFrameFromPickedMesh(pickedMesh, context) {
  if (!pickedMesh || !context?.shapes) return null;

  const metadata = pickedMesh.metadata || {};

  if (metadata.sourceFrame) {
    return metadata.sourceFrame;
  }

  const frameId = metadata.frameId || metadata.id;

  if (!frameId) return null;

  return context.shapes.find((frame) => String(frame.id) === String(frameId));
}

// =====================================================
// 3D SELECTION > SELECCIONAR BARRA DESDE 3D
// Clic normal: selecciona solo una barra.
// Ctrl + clic: agrega o quita barras sin límite.
// =====================================================
function selectFrameFrom3D(frame, context, options = {}) {
  if (!frame || !context) return;

  const additive = options.additive === true;

  // =====================================================
  // CTRL + CLIC 3D > AGREGAR / QUITAR BARRA
  // Usa la misma lógica que ya funciona en 2D.
  // =====================================================
  if (additive) {
    if (typeof context.toggleFrameSelection === "function") {
      context.toggleFrameSelection(frame);

      console.log("🟨 Ctrl + clic 3D sobre barra:", {
        id: frame.id,
        seleccionadas: context.getCurrentlySelectedFrames?.().map((f) => f.id),
      });

      return;
    }
  }

  // =====================================================
  // CLIC NORMAL 3D > SELECCIÓN ÚNICA
  // Limpia lo anterior y selecciona solo esta barra.
  // =====================================================
  if (typeof context.selectFramesForEdit === "function") {
    context.multiSelectedFrames = [];

    context.selectFramesForEdit([frame], {
      reason: "3d single frame selection",
    });

    console.log("🖱️ Clic normal 3D sobre barra:", {
      id: frame.id,
    });

    return;
  }

  // =====================================================
  // RESPALDO ANTIGUO
  // Por si todavía no existe selectFramesForEdit.
  // =====================================================
  context.clearAllSelections?.();

  frame.selected = true;
  frame.isSelected = true;
  frame.highlighted3D = true;

  context.setState?.(context.selectedBeamsState, {
    selectedBeams: [frame],
    selectedBeam: frame,
    selectedObjects: [frame],
  });

  context.selectedBeams = [frame];
  context.selectedObjects = [frame];

  context.redraw?.();
  context.sync3D?.();
}

// =====================================================
// 3D SELECTION > SELECCIONAR NODO DESDE CLIC EN 3D
// Clic normal: reemplaza selección con ese nodo.
// Ctrl + clic: agrega o quita el nodo de la selección actual.
// =====================================================
function selectNodeFrom3D(node, context, options = {}) {
  if (!node || !context) return;

  const additive = options.additive === true;

  if (additive) {
    // Ctrl+clic: agrega/quita nodo de la selección múltiple
    const currentNodes = context.selectedNodesState?.selectedObjects ?? [];
    const alreadySelected = currentNodes.some((n) => n?.id === node.id);
    const nextNodes = alreadySelected
      ? currentNodes.filter((n) => n?.id !== node.id)
      : [...currentNodes, node];

    if (nextNodes.length === 0) {
      context.clearAllSelections?.();
      context.setState?.(context.idleState);
    } else {
      context.setState?.(context.selectedNodesState, { selectedNodes: nextNodes });
    }

    console.log("🟨 Ctrl + clic 3D sobre nodo:", { id: node.id, seleccionados: nextNodes.map((n) => n.id) });
  } else {
    // Clic simple: usa moveObjectState (igual que 2D) → muestra ID, Posición, Fuerza, Soporte
    context.setState?.(context.moveObjectState, { selectedObject: node, isMoving: false });

    console.log("🖱️ Clic 3D sobre nodo:", { id: node.id });
  }

  context.redraw?.();
  context.sync3D?.();
}

// =====================================================
// 3D DRAW > CONVERTIR PUNTO BABYLON A MODELO
// En tu visor, el mapeo usado es:
// Modelo:  x, y, z
// Babylon: x, z, y
// Por eso se invierte así.
// =====================================================
function babylonPointToModelPoint(point) {
  if (!point) return null;

  return {
    x: Number(point.x || 0),
    y: Number(point.z || 0),
    z: Number(point.y || 0),
  };
}

// =====================================================
// 3D DRAW > PLANO INVISIBLE DE TRABAJO
// Crea un plano pickeable según la vista activa.
// Planta: plano horizontal.
// Elevación Y: plano vertical X-Z.
// Elevación X: plano vertical Y-Z.
// =====================================================
function ensure3DWorkPlanePickMesh(context) {
  const scene = VIEWER_STATE.scene;

  if (!scene || !context) return null;

  const workPlaneInfo = context.getActive3DWorkPlane?.() || {
    type: "plan",
    fixedAxis: "z",
    value: 0,
  };

  const meshName = "jh_work_plane_3d_pick";

  let workPlane = scene.getMeshByName(meshName);

  // Si cambió el tipo de plano, eliminamos y recreamos.
  if (workPlane && workPlane.metadata?.workPlaneType !== workPlaneInfo.type) {
    workPlane.dispose(false, false);
    workPlane = null;
  }

  if (!workPlane) {
    // =====================================================
    // PLANTA > PLANO HORIZONTAL X-Y
    // En Babylon: CreateGround usa X-Z y altura en Y.
    // Modelo: X-Y con Z fijo.
    // =====================================================
    if (workPlaneInfo.type === "plan") {
      workPlane = BABYLON.MeshBuilder.CreateGround(
        meshName,
        {
          width: 300,
          height: 300,
          subdivisions: 1,
        },
        scene,
      );
    }

    // =====================================================
    // ELEVACIÓN Y > PLANO VERTICAL X-Z, con Y fijo
    // En Babylon: X-Y con Z fijo.
    // =====================================================
    if (workPlaneInfo.type === "elevationY") {
      workPlane = BABYLON.MeshBuilder.CreatePlane(
        meshName,
        {
          width: 300,
          height: 120,
          sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        },
        scene,
      );
    }

    // =====================================================
    // ELEVACIÓN X > PLANO VERTICAL Y-Z, con X fijo
    // En Babylon: rotamos para que quede en Y-Z.
    // =====================================================
    if (workPlaneInfo.type === "elevationX") {
      workPlane = BABYLON.MeshBuilder.CreatePlane(
        meshName,
        {
          width: 300,
          height: 120,
          sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        },
        scene,
      );

      workPlane.rotation.y = Math.PI / 2;
    }

    const mat = new BABYLON.StandardMaterial("mat_jh_work_plane_3d_pick", scene);
    mat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1.0);
    mat.alpha = 0.001;

    workPlane.material = mat;
    workPlane.visibility = 0.001;
    workPlane.isPickable = true;

    workPlane.metadata = {
      objectType: "workPlane3D",
      type: "workPlane3D",
      workPlaneType: workPlaneInfo.type,
    };
  }

  // =====================================================
  // ACTUALIZAR POSICIÓN SEGÚN PLANO
  // Mapeo:
  // Modelo x => Babylon x
  // Modelo y => Babylon z
  // Modelo z => Babylon y
  // =====================================================
  workPlane.position.set(0, 0, 0);

  if (workPlaneInfo.type === "plan") {
    // Modelo Z fijo => Babylon Y fijo.
    workPlane.position.y = Number(workPlaneInfo.value || 0);
    workPlane.rotation.x = 0;
    workPlane.rotation.y = 0;
    workPlane.rotation.z = 0;
  }

  if (workPlaneInfo.type === "elevationY") {
    // Modelo Y fijo => Babylon Z fijo.
    workPlane.position.z = Number(workPlaneInfo.value || 0);
    workPlane.rotation.x = 0;
    workPlane.rotation.y = 0;
    workPlane.rotation.z = 0;
  }

  if (workPlaneInfo.type === "elevationX") {
    // Modelo X fijo => Babylon X fijo.
    workPlane.position.x = Number(workPlaneInfo.value || 0);
    workPlane.rotation.x = 0;
    workPlane.rotation.y = Math.PI / 2;
    workPlane.rotation.z = 0;
  }

  workPlane.isPickable = context?.activeDrawTool === "frame" || context?.isDrawingFrame3D === true;

  workPlane.setEnabled(true);

  return workPlane;
}

// =====================================================
// 3D DRAW > DESACTIVAR PLANO INVISIBLE DE DIBUJO
// Evita que bloquee la selección de barras 3D.
// =====================================================
function disable3DWorkPlanePickMesh() {
  const scene = VIEWER_STATE.scene;

  if (!scene) return;

  const workPlane = scene.getMeshByName("jh_work_plane_3d_pick");

  if (!workPlane) return;

  workPlane.isPickable = false;
  workPlane.setEnabled(false);
}

window.__jhDisable3DWorkPlanePickMesh = disable3DWorkPlanePickMesh;

// =====================================================
// 3D DRAW > BLOQUEAR/DESBLOQUEAR CÁMARA
// Evita que la cámara orbite cuando se está dibujando en 3D.
// =====================================================
function set3DDrawCameraLock(locked) {
  const scene = VIEWER_STATE.scene;
  const canvas = VIEWER_STATE.canvas;

  if (!scene || !scene.activeCamera || !canvas) return;

  const camera = scene.activeCamera;

  if (locked) {
    if (!scene.__jhCameraLockedForDraw) {
      camera.detachControl(canvas);
      scene.__jhCameraLockedForDraw = true;
      console.log("🔒 Cámara 3D bloqueada para dibujo");
    }

    return;
  }

  if (scene.__jhCameraLockedForDraw) {
    camera.attachControl(canvas, true);
    scene.__jhCameraLockedForDraw = false;
    console.log("🔓 Cámara 3D desbloqueada");
  }
}

// =====================================================
// 3D DRAW > CONVERTIR PUNTO MODELO A BABYLON
// Modelo:  x, y, z
// Babylon: x, z, y
// =====================================================
function modelPointToBabylonPoint(point) {
  if (!point) return new BABYLON.Vector3(0, 0, 0);

  return new BABYLON.Vector3(Number(point.x || 0), Number(point.z || 0), Number(point.y || 0));
}

// =====================================================
// 3D DRAW > CREAR / OBTENER MARCADOR DE GRID POINT
// Es la referencia visual que aparece al pasar por un vértice.
// =====================================================
function ensure3DGridPointHoverMarker(context) {
  const scene = VIEWER_STATE.scene;

  if (!scene) return null;

  let marker = scene.getMeshByName("jh_3d_grid_point_hover_marker");

  if (!marker) {
    marker = BABYLON.MeshBuilder.CreateSphere(
      "jh_3d_grid_point_hover_marker",
      {
        diameter: 0.28,
        segments: 16,
      },
      scene,
    );

    const mat = new BABYLON.StandardMaterial("mat_jh_3d_grid_point_hover_marker", scene);

    mat.diffuseColor = new BABYLON.Color3(1, 0.75, 0.05);
    mat.emissiveColor = new BABYLON.Color3(1, 0.55, 0.05);

    marker.material = mat;
    marker.isPickable = false;
    marker.setEnabled(false);

    marker.metadata = {
      objectType: "draw3DHoverMarker",
      type: "draw3DHoverMarker",
    };
  }

  return marker;
}

// =====================================================
// 3D DRAW > CREAR / OBTENER LÍNEA PREVIEW
// Se crea una sola vez y luego se actualiza.
// =====================================================
function ensure3DFramePreviewLine(context) {
  const scene = VIEWER_STATE.scene;

  if (!scene) return null;

  let previewLine = scene.getMeshByName("jh_3d_frame_preview_line");

  if (!previewLine) {
    previewLine = BABYLON.MeshBuilder.CreateLines(
      "jh_3d_frame_preview_line",
      {
        points: [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)],
        updatable: true,
      },
      scene,
    );

    previewLine.color = new BABYLON.Color3(1, 0.85, 0.15);
    previewLine.isPickable = false;
    previewLine.setEnabled(false);

    previewLine.metadata = {
      objectType: "draw3DPreviewLine",
      type: "draw3DPreviewLine",
    };
  }

  return previewLine;
}

// =====================================================
// 3D DRAW > ACTUALIZAR LÍNEA PREVIEW
// No usa dispose(). Solo actualiza la línea existente.
// =====================================================
function update3DFramePreviewLine(context, snappedPoint) {
  const scene = VIEWER_STATE.scene;

  if (!scene) return;

  const previewLine = ensure3DFramePreviewLine(context);

  if (!context?.frame3DStartNode || !snappedPoint || !previewLine) {
    previewLine?.setEnabled(false);
    return;
  }

  const startPoint = context.frame3DStartNode.position;

  const p1 = modelPointToBabylonPoint(startPoint);
  const p2 = modelPointToBabylonPoint(snappedPoint);

  BABYLON.MeshBuilder.CreateLines(
    "jh_3d_frame_preview_line",
    {
      points: [p1, p2],
      instance: previewLine,
    },
    scene,
  );

  previewLine.color = new BABYLON.Color3(1, 0.85, 0.15);
  previewLine.isPickable = false;
  previewLine.setEnabled(true);
}

// =====================================================
// 3D DRAW > ACTUALIZAR ETIQUETA DEL GRID POINT
// No elimina ni recrea el mesh en cada movimiento.
// =====================================================
function update3DGridPointHoverLabel(context, snappedPoint) {
  const scene = VIEWER_STATE.scene;

  if (!scene || !snappedPoint) return;

  const labelPlane = ensure3DGridPointHoverLabel(context);

  if (!labelPlane) return;

  const texture = labelPlane.metadata?.texture;

  if (!texture) return;

  const labelText = `Grid Point ${snappedPoint.xGridId || "-"}-${snappedPoint.yGridId || "-"} | Z=${Number(snappedPoint.z || 0).toFixed(2)}`;

  // Solo redibujar texto si cambió.
  if (labelPlane.metadata.lastText !== labelText) {
    const ctx = texture.getContext();

    ctx.clearRect(0, 0, 512, 128);

    ctx.fillStyle = "rgba(20, 20, 20, 0.78)";
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = "rgba(255, 200, 40, 1)";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 508, 124);

    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(labelText, 24, 78);

    texture.update();

    labelPlane.metadata.lastText = labelText;
  }

  const labelPosition = modelPointToBabylonPoint(snappedPoint);

  labelPlane.position = labelPosition.add(new BABYLON.Vector3(0.45, 0.45, 0.45));

  labelPlane.setEnabled(true);
}

// =====================================================
// 3D DRAW > LIMPIAR REFERENCIA DE GRID POINT
// Oculta marcador, etiqueta, preview y desactiva plano invisible.
// =====================================================
function clear3DGridPointHoverReference() {
  const scene = VIEWER_STATE.scene;

  if (!scene) return;

  const marker = scene.getMeshByName("jh_3d_grid_point_hover_marker");
  const preview = scene.getMeshByName("jh_3d_frame_preview_line");
  const label = scene.getMeshByName("jh_3d_grid_point_hover_label");

  marker?.setEnabled(false);
  preview?.setEnabled(false);
  label?.setEnabled(false);

  // Clave: el plano invisible no debe bloquear la selección 3D.
  disable3DWorkPlanePickMesh();
}

// =====================================================
// 3D DRAW > EXPONER LIMPIEZA DE REFERENCIA
// Permite limpiar desde cad_sys.js al cancelar Draw Lines.
// =====================================================
window.__jhClear3DGridPointHoverReference = clear3DGridPointHoverReference;

// =====================================================
// 3D DRAW > ACTUALIZAR REFERENCIA AL PASAR POR GRID POINT
// No crea nodo. Solo muestra el punto exacto donde se dibujaría.
// =====================================================
function update3DGridPointHoverReference(context, pointerInfo) {
  const scene = VIEWER_STATE.scene;

  if (!scene || !context) return;

  const frameToolActive = context?.isFrameDrawingToolActive?.() === true || context?.activeDrawTool === "frame";

  if (!frameToolActive) {
    clear3DGridPointHoverReference();
    return;
  }

  // =====================================================
  // 3D SNAP > HOVER GLOBAL SOBRE GRID POINTS 3D
  // Esto permite detectar puntos de otros pisos sin cambiar vista.
  // =====================================================
  const nearestSnapPoint = findNearest3DGridSnapPointUnderPointer(context, 18);

  if (nearestSnapPoint?.modelPoint) {
    const snappedPoint = nearestSnapPoint.modelPoint;

    const marker = ensure3DGridPointHoverMarker(context);

    if (marker) {
      marker.position = modelPointToBabylonPoint(snappedPoint);
      marker.setEnabled(true);
    }

    context.hovered3DGridPoint = snappedPoint;

    update3DGridPointHoverLabel(context, snappedPoint);
    update3DFramePreviewLine(context, snappedPoint);

    context.showMessage?.(
      `Grid Point ${snappedPoint.xGridId || "-"}-${snappedPoint.yGridId || "-"} | X=${Number(snappedPoint.x || 0).toFixed(2)} Y=${Number(snappedPoint.y || 0).toFixed(2)} Z=${Number(snappedPoint.z || 0).toFixed(2)}`,
    );

    return;
  }

  ensure3DWorkPlanePickMesh(context);

  const event = pointerInfo?.event;

  const pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => {
    if (!mesh) return false;

    if (mesh.name === "jh_3d_grid_point_hover_marker") return false;
    if (mesh.name === "jh_3d_frame_preview_line") return false;
    if (mesh.name === "jh_3d_grid_point_hover_label") return false;

    return mesh.isPickable === true;
  });

  const pickedPoint = pickInfo?.pickedPoint;

  if (!pickedPoint) {
    clear3DGridPointHoverReference();
    return;
  }

  const approxModelPoint = babylonPointToModelPoint(pickedPoint);

  const snappedPoint = context.snap3DModelPointToGridPoint?.(approxModelPoint);

  if (!snappedPoint) {
    clear3DGridPointHoverReference();
    return;
  }

  const marker = ensure3DGridPointHoverMarker(context);

  if (marker) {
    marker.position = modelPointToBabylonPoint(snappedPoint);
    marker.setEnabled(true);
  }

  context.hovered3DGridPoint = snappedPoint;

  update3DGridPointHoverLabel(context, snappedPoint);
  update3DFramePreviewLine(context, snappedPoint);

  context.showMessage?.(
    `Grid Point ${snappedPoint.xGridId || "-"}-${snappedPoint.yGridId || "-"} | X=${Number(snappedPoint.x || 0).toFixed(2)} Y=${Number(snappedPoint.y || 0).toFixed(2)} Z=${Number(snappedPoint.z || 0).toFixed(2)}`,
  );
}

// =====================================================
// 3D DRAW > EXPONER DESBLOQUEO DE CÁMARA
// Permite que cad_sys.js desbloquee la cámara al presionar Esc.
// =====================================================
window.__jhSet3DDrawCameraLock = set3DDrawCameraLock;

// =====================================================
// 3D SELECTION / DRAW FRAME > INTERACCIÓN EN VISOR 3D
// Si la herramienta Draw Frame está activa, el clic en 3D
// sirve para dibujar barras usando nodos o grid points.
// Si no está activa, el clic sirve para seleccionar barras y Nodos.
// =====================================================
function enable3DFrameSelection(context) {
  const scene = VIEWER_STATE.scene;

  if (!scene || scene.__frameSelectionEnabled) return;

  scene.__frameSelectionEnabled = true;

  // =====================================================
  // 3D DRAW > CONTROL DE ARRASTRE
  // Diferencia clic real de arrastre/orbitado.
  // =====================================================
  let pointerDownPosition3D = null;
  let pointerWasDragged3D = false;

  scene.onPointerObservable.add((pointerInfo) => {
    const event = pointerInfo.event;

    // =====================================================
    // DRAW FRAME > VALIDAR HERRAMIENTA ACTIVA
    // Se calcula al inicio para usarlo en move, down y pick.
    // =====================================================
    const frameToolActive = context?.isFrameDrawingToolActive?.() === true || context?.activeDrawTool === "frame";

    // =====================================================
    // 3D SELECTION > SI NO ESTOY DIBUJANDO, APAGAR PLANO PICK
    // Evita que el plano invisible intercepte clics sobre barras.
    // =====================================================
    if (!frameToolActive && context?.isDrawingFrame3D !== true) {
      disable3DWorkPlanePickMesh();
    }

    // =====================================================
    // 3D DRAW > HOVER SOBRE GRID POINT
    // Muestra referencia visual tipo ETABS al pasar por un vértice.
    // =====================================================
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
      if (frameToolActive) {
        update3DGridPointHoverReference(context, pointerInfo);
      } else {
        clear3DGridPointHoverReference();
      }
    }

    // =====================================================
    // VIEWPORT > VISOR 3D ACTIVO
    // Marca el visor 3D como área activa cuando hay interacción.
    // =====================================================
    if (
      pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE ||
      pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK ||
      pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN
    ) {
      context?.mark3DViewportActive?.("3d pointer interaction");
    }

    // =====================================================
    // 3D DRAW > CONTROL DE CÁMARA SEGÚN HERRAMIENTA
    // Si Draw Frame está activo, bloquea cámara antes del pick.
    // Si no está activo, devuelve control normal.
    // =====================================================
    set3DDrawCameraLock(frameToolActive === true);

    // =====================================================
    // DRAW 3D > ASEGURAR PLANO PICKABLE
    // Permite hacer clic en puntos vacíos de la grilla 3D.
    // =====================================================
    if (frameToolActive || context?.isDrawingFrame3D === true) {
      ensure3DWorkPlanePickMesh(context);
    }

    // =====================================================
    // 3D DRAW > REGISTRAR INICIO DEL CLIC
    // Guardamos la posición inicial solo con clic izquierdo.
    // =====================================================
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
      if (event?.button !== 0) return;

      pointerDownPosition3D = {
        x: event?.clientX || 0,
        y: event?.clientY || 0,
      };

      pointerWasDragged3D = false;
      return;
    }

    // =====================================================
    // 3D DRAW > DETECTAR ARRASTRE
    // Si el mouse se mueve bastante desde el pointerDown,
    // luego se ignorará el pick para no crear nodos accidentales.
    // =====================================================
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE && pointerDownPosition3D) {
      const dx = Math.abs((event?.clientX || 0) - pointerDownPosition3D.x);
      const dy = Math.abs((event?.clientY || 0) - pointerDownPosition3D.y);

      if (dx > 6 || dy > 6) {
        pointerWasDragged3D = true;
      }

      return;
    }

    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERPICK) return;

    // Solo clic izquierdo
    if (event?.button !== 0) return;

    // =====================================================
    // 3D DRAW > IGNORAR SI FUE ARRASTRE
    // Evita crear nodos/barras cuando el usuario intentó mover la vista.
    // =====================================================
    if (pointerDownPosition3D) {
      const dx = Math.abs((event?.clientX || 0) - pointerDownPosition3D.x);
      const dy = Math.abs((event?.clientY || 0) - pointerDownPosition3D.y);

      if (pointerWasDragged3D || dx > 6 || dy > 6) {
        console.log("🖐️ Pick 3D ignorado por arrastre:", {
          dx,
          dy,
          pointerWasDragged3D,
        });

        pointerDownPosition3D = null;
        pointerWasDragged3D = false;
        return;
      }
    }

    pointerDownPosition3D = null;
    pointerWasDragged3D = false;

    const pickedMesh = pointerInfo.pickInfo?.pickedMesh;

    if (!pickedMesh) return;

    const metadata = pickedMesh.metadata || {};

    // =====================================================
    // DRAW FRAME > DIBUJAR EN 3D SI LA HERRAMIENTA ESTÁ ACTIVA
    // Si se hace clic en un nodo existente, lo usa.
    // Si se hace clic en un punto de grilla/mesh, crea nodo exacto.
    // =====================================================
    if (frameToolActive) {
      if (context?.isDrawingFrame3D !== true) {
        context.startFrame3DDrawingMode?.();
      }

      // =====================================================
      // DRAW 3D > CASO 0 REAL: CLIC EN GRID SNAP POINT 3D GLOBAL
      // Permite diagonales espaciales sin cambiar de piso/elevación.
      // Tiene prioridad sobre plano invisible y sobre meshes del modelo.
      // =====================================================
      const nearestSnapPoint = findNearest3DGridSnapPointUnderPointer(context, 18);

      if (nearestSnapPoint?.modelPoint) {
        const modelPoint = nearestSnapPoint.modelPoint;

        let pickedOrCreatedNode = null;

        if (typeof context.findNodeAt3DPoint === "function") {
          pickedOrCreatedNode = context.findNodeAt3DPoint(modelPoint, 0.001);
        }

        if (!pickedOrCreatedNode && typeof context.createNodeAt3DGridPoint === "function") {
          pickedOrCreatedNode = context.createNodeAt3DGridPoint(modelPoint);
        }

        if (pickedOrCreatedNode) {
          console.log("🎯 Grid Snap Point 3D GLOBAL usado:", {
            nodeId: pickedOrCreatedNode.id,
            modelPoint,
            distance: nearestSnapPoint.distance,
          });

          context.handle3DFrameNodePicked?.(pickedOrCreatedNode);
          return;
        }
      }

      // =====================================================
      // DRAW 3D > CASO 0: CLIC EN GRID SNAP POINT 3D
      // Permite dibujar diagonales espaciales sin cambiar de piso/elevación.
      // Este punto ya trae X, Y, Z reales del grid en 3D.
      // =====================================================
      if (metadata.objectType === "gridSnapPoint3D" || metadata.type === "gridSnapPoint3D") {
        const modelPoint = metadata.modelPoint;

        if (modelPoint) {
          let pickedOrCreatedNode = null;

          // Primero busca si ya existe un nodo en ese punto 3D exacto.
          if (typeof context.findNodeAt3DPoint === "function") {
            pickedOrCreatedNode = context.findNodeAt3DPoint(modelPoint, 0.001);
          }

          // Si no existe, crea un nodo exactamente en ese grid point 3D.
          // No usamos findOrCreateNodeAt3DModelPoint aquí porque esa función
          // puede volver a ajustar el punto al plano activo.
          if (!pickedOrCreatedNode && typeof context.createNodeAt3DGridPoint === "function") {
            pickedOrCreatedNode = context.createNodeAt3DGridPoint(modelPoint);
          }

          if (pickedOrCreatedNode) {
            console.log("🎯 Grid Snap Point 3D usado para Draw Frame:", {
              nodeId: pickedOrCreatedNode.id,
              modelPoint,
            });

            context.handle3DFrameNodePicked?.(pickedOrCreatedNode);
            return;
          }
        }
      }

      // =====================================================
      // DRAW 3D > CASO 1: CLIC EN NODO EXISTENTE
      // Usa el nodo ya creado en el modelo.
      // =====================================================
      if (metadata.objectType === "node" || metadata.type === "node") {
        const pickedNode =
          metadata.sourceNode ||
          context.nodes?.find((node) => String(node.id) === String(metadata.nodeId || metadata.id));

        if (pickedNode) {
          context.handle3DFrameNodePicked?.(pickedNode);
          return;
        }
      }

      // =====================================================
      // DRAW 3D > CASO 2: CLIC EN PUNTO DEL 3D
      // Convierte el punto Babylon a coordenada de modelo,
      // lo ajusta a grid point exacto y crea/usa un nodo.
      // =====================================================
      const pickedPoint = pointerInfo.pickInfo?.pickedPoint;

      if (pickedPoint) {
        const approxModelPoint = babylonPointToModelPoint(pickedPoint);

        const pickedOrCreatedNode = context.findOrCreateNodeAt3DModelPoint?.(approxModelPoint);

        if (pickedOrCreatedNode) {
          context.handle3DFrameNodePicked?.(pickedOrCreatedNode);
          return;
        }
      }

      context.showMessage?.("Herramienta de barra activa: haga clic en un nodo o punto de grilla 3D.");

      console.log("⚠️ Draw Frame activo en 3D, pero no se pudo obtener punto válido:", {
        pickedName: pickedMesh?.name,
        objectType: metadata.objectType,
        type: metadata.type,
        frameId: metadata.frameId,
        nodeId: metadata.nodeId,
        hasPickedPoint: Boolean(pointerInfo.pickInfo?.pickedPoint),
      });

      return;
    }

    const pickedPoint3D = pointerInfo.pickInfo?.pickedPoint;

    // =====================================================
    // 3D SELECTION > CLIC EN ESFERA DE NODO
    // =====================================================
    if (metadata.objectType === "node" || metadata.type === "node") {
      const pickedNode =
        metadata.sourceNode ||
        context.nodes?.find((n) => String(n.id) === String(metadata.nodeId || metadata.id));

      if (pickedNode) {
        selectNodeFrom3D(pickedNode, context, { additive: event?.ctrlKey === true });
        return;
      }
    }

    // =====================================================
    // 3D SELECTION > SELECCIONAR BARRA EN 3D
    // =====================================================
    if (metadata.objectType !== "frame" && metadata.type !== "beam") {
      return;
    }

    const frame = getFrameFromPickedMesh(pickedMesh, context);
    if (!frame) return;

    // =====================================================
    // 3D SELECTION > PRIORIDAD AL NODO EN EXTREMOS DE BARRA
    // Los cilindros capturan el pick en sus tapas sólidas (extremos).
    // Si el clic cayó a menos de 0.8m de un extremo, selecciona el nodo.
    // Umbral pequeño para no interferir cuando se hace clic en el centro.
    // =====================================================
    if (pickedPoint3D && frame.node1 && frame.node2) {
      const NODE_ENDPOINT_THRESHOLD = 0.8;

      for (const node of [frame.node1, frame.node2]) {
        const pos = node?.position;
        if (!pos) continue;
        // Conversión modelo→Babylon: (x, y, z) → (x, z, y)
        const dx = pickedPoint3D.x - (pos.x ?? 0);
        const dy = pickedPoint3D.y - (pos.z ?? 0);
        const dz = pickedPoint3D.z - (pos.y ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist <= NODE_ENDPOINT_THRESHOLD) {
          selectNodeFrom3D(node, context, { additive: event?.ctrlKey === true });
          return;
        }
      }
    }

    selectFrameFrom3D(frame, context, {
      additive: event?.ctrlKey === true,
    });
  });

  console.log("✅ Selección directa de barras en 3D activada");
}

// =====================================================
// 3D DRAW > CREAR / OBTENER ETIQUETA DE GRID POINT
// Se crea una sola vez para evitar warnings WebGL.
// =====================================================
function ensure3DGridPointHoverLabel(context) {
  const scene = VIEWER_STATE.scene;

  if (!scene) return null;

  let labelPlane = scene.getMeshByName("jh_3d_grid_point_hover_label");

  if (!labelPlane) {
    const texture = new BABYLON.DynamicTexture(
      "tex_jh_3d_grid_point_hover_label",
      {
        width: 512,
        height: 128,
      },
      scene,
      false,
    );

    const mat = new BABYLON.StandardMaterial("mat_jh_3d_grid_point_hover_label", scene);

    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.backFaceCulling = false;

    labelPlane = BABYLON.MeshBuilder.CreatePlane(
      "jh_3d_grid_point_hover_label",
      {
        width: 3.8,
        height: 0.9,
      },
      scene,
    );

    labelPlane.material = mat;
    labelPlane.isPickable = false;
    labelPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    labelPlane.setEnabled(false);

    labelPlane.metadata = {
      objectType: "draw3DHoverLabel",
      type: "draw3DHoverLabel",
      texture,
      lastText: null,
    };
  }

  return labelPlane;
}

// =====================================================
// UTILIDAD 3D > OBTENER ROTACIÓN ENTRE DOS VECTORES
// Devuelve un Vector3 con rotación en radianes para cada eje.
// =====================================================
function getRotationBetweenVectors(from, to) {
  const quat = BABYLON.Quaternion.FromUnitVectorsToRef(from.normalize(), to.normalize(), new BABYLON.Quaternion());
  const euler = new BABYLON.Vector3();
  quat.toEulerAnglesToRef(euler);
  return euler;
}

// =====================================================
// UTILIDAD 3D > CREAR MATERIAL COLOREADO
// Crea un material con color difuso y emisivo para que resalte.
// =====================================================
function createColoredMaterial(name, color, scene) {
  const mat = new BABYLON.StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.emissiveColor = color;
  return mat;
}

// =====================================================
// UTILIDAD 3D > CREAR ETIQUETA EN 3D
// Crea un plano con textura dinámica para mostrar texto en 3D.
// El plano siempre mira a la cámara (billboard) y se posiciona en el punto dado.
// =====================================================
function createLabel3D(text, position, color = new BABYLON.Color3(1, 1, 1), size = 0.3) {
  const scene = VIEWER_STATE.scene;
  const dynamicTexture = new BABYLON.DynamicTexture(
    `label_${Date.now()}_${Math.random()}`,
    { width: 256, height: 128 },
    scene,
    false,
  );
  dynamicTexture.hasAlpha = true;
  const ctx = dynamicTexture.getContext();
  ctx.fillStyle = "rgba(9, 8, 8, 0.65)";
  ctx.fillRect(0, 0, 256, 128);
  ctx.font = "Bold 32px Arial";
  ctx.fillStyle = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 1)`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 64);
  dynamicTexture.update();

  const plane = BABYLON.MeshBuilder.CreatePlane(
    `label_plane_${Date.now()}_${Math.random()}`,
    { width: size * 1.8, height: size * 0.9 },
    scene,
  );
  const material = new BABYLON.StandardMaterial(`label_mat`, scene);
  material.diffuseTexture = dynamicTexture;
  material.emissiveTexture = dynamicTexture;
  material.backFaceCulling = false;
  plane.material = material;
  plane.position = position;
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  plane.metadata = { type: "label" };
  VIEWER_STATE.elements.push(plane);
  return plane;
}

// =====================================================
// UTILIDAD 3D > OBTENER VECTOR PERPENDICULAR
// =====================================================
function getPerpendicularVector(dir) {
  // Devuelve un vector unitario perpendicular a 'dir' (en el plano XZ si dir es horizontal)
  // Si dir es vertical (cerca de Y), usa un vector perpendicular fijo.
  const up = new BABYLON.Vector3(0, 1, 0);
  const perp = BABYLON.Vector3.Cross(dir, up);
  if (perp.length() < 0.01) {
    // dir es vertical, usar otro eje
    return new BABYLON.Vector3(1, 0, 0);
  }
  return perp.normalize();
}

// =====================================================
// UTILIDAD 3D > CREAR FLECHA DE FUERZA
// Dibuja una flecha con dirección, magnitud y color dados.
// La flecha se escala según la magnitud para mejor visualización.
// =====================================================
function createForceArrow3D(
  origin,
  direction,
  magnitude,
  color,
  scale = 0.08,
  maxLength = 1.5,
  showLabel = true,
  sideOffset = 0.45,
) {
  const scene = VIEWER_STATE.scene;
  if (!scene || !origin || !direction) return;

  let length = Math.min(Math.abs(magnitude) * scale, maxLength);
  if (length < 0.15) length = 0.15;

  const shaftLength = length * 0.85;
  const headLength = length * 0.25;
  const shaftRadius = 0.04;
  const headRadius = 0.07;

  const dirNorm = direction.normalize();
  const end = origin.add(dirNorm.scale(length));

  // eje de la flecha como cilindro
  const shaft = BABYLON.MeshBuilder.CreateCylinder(
    `force_shaft_${Date.now()}_${Math.random()}`,
    { height: shaftLength, diameter: shaftRadius * 2 },
    scene,
  );
  shaft.position = origin.add(dirNorm.scale(shaftLength / 2));
  shaft.rotation = getRotationBetweenVectors(new BABYLON.Vector3(0, 1, 0), dirNorm);
  shaft.material = createColoredMaterial(`force_shaft_mat`, color, scene);

  // cabeza de la flecha como cono
  const head = BABYLON.MeshBuilder.CreateCylinder(
    `force_head_${Date.now()}_${Math.random()}`,
    { height: headLength, diameterTop: 0, diameterBottom: headRadius * 2 },
    scene,
  );
  head.position = origin.add(dirNorm.scale(shaftLength + headLength / 2));
  head.rotation = getRotationBetweenVectors(new BABYLON.Vector3(0, 1, 0), dirNorm);
  head.material = createColoredMaterial(`force_head_mat`, color, scene);

  VIEWER_STATE.elements.push(shaft, head);
  // Etiqueta con la magnitud
  if (showLabel && Math.abs(magnitude) > 0.01) {
    const perp = getPerpendicularVector(dirNorm);
    // Posición a la mitad de la flecha + desplazamiento lateral
    const midPoint = origin.add(dirNorm.scale(length / 2));
    const labelPos = midPoint.add(perp.scale(sideOffset));
    const formatted = magnitude.toFixed(2);
    createLabel3D(formatted, labelPos, color, 0.25);
  }

  return { shaft, head };
}

// =====================================================
// 3D DRAW > HELPERS PARA SOPORTES
// =====================================================

/** Registra un mesh de soporte en VIEWER_STATE para limpieza posterior. */
function addSupportMesh(mesh) {
  mesh.isPickable = false;
  VIEWER_STATE.elements.push(mesh);
  return mesh;
}

/**
 * Soporte 1 — Empotrado (Fixed): placa base + rigidizadores diagonales.
 * Restringe traslación X, Y, Z y rotación X, Y, Z.
 * Color: naranja, estilo ETABS.
 */
function drawFixedSupport(origin, id) {
  const scene = VIEWER_STATE.scene;
  const color = new BABYLON.Color3(0.85, 0.45, 0.1);
  const mat = createColoredMaterial(`support_mat_${id}`, color, scene);
  mat.alpha = 0.92;

  // Placa base horizontal
  const plate = BABYLON.MeshBuilder.CreateBox(
    `support_${id}_plate`,
    { width: 0.38, height: 0.05, depth: 0.38 },
    scene,
  );
  plate.position = new BABYLON.Vector3(origin.x, origin.y - 0.025, origin.z);
  plate.material = mat;
  addSupportMesh(plate);

  // Rigidizadores diagonales estilo ETABS (rayas a 45°)
  const stripColor = new BABYLON.Color3(0.6, 0.28, 0.04);
  const stripMat = createColoredMaterial(`support_mat_${id}_strip`, stripColor, scene);
  stripMat.alpha = 0.92;

  const stripPositions = [
    { x: -0.11, z: 0 },
    { x:  0,    z: 0 },
    { x:  0.11, z: 0 },
  ];
  stripPositions.forEach((pos, i) => {
    const strip = BABYLON.MeshBuilder.CreateBox(
      `support_${id}_strip_${i}`,
      { width: 0.04, height: 0.07, depth: 0.28 },
      scene,
    );
    strip.position = new BABYLON.Vector3(
      origin.x + pos.x,
      origin.y + 0.035,
      origin.z + pos.z,
    );
    strip.rotation.y = Math.PI / 4;
    strip.material = stripMat;
    addSupportMesh(strip);
  });
}

/**
 * Soporte 2 — Articulado (Pinned): pirámide de 4 lados con vértice en el nodo.
 * Restringe traslación X, Y, Z; libre en rotación.
 * Color: verde, estilo ETABS.
 */
function drawPinnedSupport(origin, id) {
  const scene = VIEWER_STATE.scene;
  const color = new BABYLON.Color3(0.18, 0.72, 0.32);
  const mat = createColoredMaterial(`support_mat_${id}`, color, scene);
  mat.alpha = 0.92;

  const pyramidHeight = 0.28;

  // Pirámide: diameterTop=0 → apex en la parte superior (+Y)
  // position.y = origin.y - pyramidHeight/2 → apex roza el nodo
  const pyramid = BABYLON.MeshBuilder.CreateCylinder(
    `support_${id}_pyramid`,
    {
      diameterTop: 0,
      diameterBottom: 0.32,
      height: pyramidHeight,
      tessellation: 4,
    },
    scene,
  );
  pyramid.position = new BABYLON.Vector3(origin.x, origin.y - pyramidHeight / 2, origin.z);
  pyramid.rotation.y = Math.PI / 4;
  pyramid.material = mat;
  addSupportMesh(pyramid);

  // Placa base
  const base = BABYLON.MeshBuilder.CreateBox(
    `support_${id}_base`,
    { width: 0.38, height: 0.04, depth: 0.38 },
    scene,
  );
  base.position = new BABYLON.Vector3(origin.x, origin.y - pyramidHeight - 0.02, origin.z);
  base.material = mat;
  addSupportMesh(base);
}

/**
 * Soporte 3 — Deslizante en Z (Roller Z): pirámide + rodillos cilíndricos.
 * Restringe solo traslación Z; libre en X, Y y rotaciones.
 * Color: azul, estilo ETABS.
 */
function drawRollerZSupport(origin, id) {
  const scene = VIEWER_STATE.scene;
  const color = new BABYLON.Color3(0.22, 0.44, 0.92);
  const mat = createColoredMaterial(`support_mat_${id}`, color, scene);
  mat.alpha = 0.92;

  const pyramidHeight = 0.28;

  const pyramid = BABYLON.MeshBuilder.CreateCylinder(
    `support_${id}_pyramid`,
    {
      diameterTop: 0,
      diameterBottom: 0.32,
      height: pyramidHeight,
      tessellation: 4,
    },
    scene,
  );
  pyramid.position = new BABYLON.Vector3(origin.x, origin.y - pyramidHeight / 2, origin.z);
  pyramid.rotation.y = Math.PI / 4;
  pyramid.material = mat;
  addSupportMesh(pyramid);

  // Rodillos horizontales (indican libertad de deslizamiento)
  const rollerColor = new BABYLON.Color3(0.14, 0.3, 0.72);
  const rollerMat = createColoredMaterial(`support_mat_${id}_roller`, rollerColor, scene);
  rollerMat.alpha = 0.92;

  [-0.12, 0, 0.12].forEach((offset, i) => {
    const roller = BABYLON.MeshBuilder.CreateCylinder(
      `support_${id}_roller_${i}`,
      { diameter: 0.07, height: 0.34, tessellation: 12 },
      scene,
    );
    roller.position = new BABYLON.Vector3(
      origin.x + offset,
      origin.y - pyramidHeight - 0.035,
      origin.z,
    );
    roller.rotation.z = Math.PI / 2;
    roller.material = rollerMat;
    addSupportMesh(roller);
  });

  // Placa base bajo los rodillos
  const base = BABYLON.MeshBuilder.CreateBox(
    `support_${id}_base`,
    { width: 0.44, height: 0.03, depth: 0.38 },
    scene,
  );
  base.position = new BABYLON.Vector3(origin.x, origin.y - pyramidHeight - 0.075, origin.z);
  base.material = mat;
  addSupportMesh(base);
}

/** Soporte personalizado: restricciones parciales no estándar — cubo gris. */
function drawCustomSupport(origin, id) {
  const scene = VIEWER_STATE.scene;
  const mat = createColoredMaterial(`support_mat_${id}`, new BABYLON.Color3(0.55, 0.55, 0.55), scene);
  mat.alpha = 0.82;

  const box = BABYLON.MeshBuilder.CreateBox(
    `support_${id}`,
    { width: 0.22, height: 0.1, depth: 0.22 },
    scene,
  );
  box.position = new BABYLON.Vector3(origin.x, origin.y - 0.05, origin.z);
  box.material = mat;
  addSupportMesh(box);
}

// =====================================================
// 3D DRAW > DIBUJAR SOPORTES EN 3D
// Clasifica cada nodo según sus restricciones y dibuja
// el símbolo 3D correspondiente al estilo ETABS.
// Lee node.restraints (nuevo) con fallback a node.soporte (legacy).
// =====================================================
function drawSupportsIn3D(context) {
  const nodes = context.nodes;
  if (!nodes) return;

  nodes.forEach((node) => {
    const r = node.restraints || node.constraints || {};
    const anyRestraint = r.ux || r.uy || r.uz || r.rx || r.ry || r.rz;

    let supportType = null;

    if (anyRestraint) {
      if (r.ux && r.uy && r.uz && r.rx && r.ry && r.rz) {
        supportType = "fixed";
      } else if (r.ux && r.uy && r.uz) {
        supportType = "pinned";
      } else if (r.uz && !r.ux && !r.uy) {
        supportType = "rollerZ";
      } else {
        supportType = "custom";
      }
    } else if (node.soporte) {
      // Compatibilidad con modelos guardados antes del sistema de restricciones
      switch (node.soporte) {
        case "soporteUno":  supportType = "fixed";   break;
        case "soporteDos":  supportType = "pinned";  break;
        case "soporteTres": supportType = "rollerZ"; break;
        default:            supportType = "custom";
      }
    }

    if (!supportType) return;

    const origin = mapNodePositionTo3D(node);
    const id = node.id;

    switch (supportType) {
      case "fixed":   drawFixedSupport(origin, id);   break;
      case "pinned":  drawPinnedSupport(origin, id);  break;
      case "rollerZ": drawRollerZSupport(origin, id); break;
      default:        drawCustomSupport(origin, id);  break;
    }
  });
}

// =====================================================
// 3D DRAW > DIBUJAR FUERZAS EN 3D
// Dibuja flechas para cada componente de fuerza en los nodos.
// El color varía según el tipo de carga para fácil identificación.
// =====================================================
function drawForcesIn3D(context) {
  if (!context.options?.showForces) return;

  const nodes = context.nodes;
  const currentLoad = context.options.currentLoad || "CM";
  const colors = {
    CM: new BABYLON.Color3(0.65, 0.16, 0.16),
    CV: new BABYLON.Color3(1.0, 0.65, 0.0),
    CVVM: new BABYLON.Color3(1.0, 1.0, 1.0),
    CVVP: new BABYLON.Color3(0.0, 0.0, 0.0),
    CN: new BABYLON.Color3(0.96, 0.96, 0.96),
    CLL: new BABYLON.Color3(0.68, 0.85, 0.9),
  };
  const defaultColor = new BABYLON.Color3(1.0, 0.0, 0.0);

  nodes.forEach((node) => {
    const load = node.force?.loads?.[currentLoad];
    if (!load) return;

    const fx = Number(load.x || 0);
    const fy = Number(load.y || 0);
    const fz = Number(load.z || 0);
    const origin = mapNodePositionTo3D(node);
    const color = colors[currentLoad] || defaultColor;

    if (Math.abs(fx) > 0.01) {
      const dir = new BABYLON.Vector3(Math.sign(fx), 0, 0);
      createForceArrow3D(origin, dir, fx, color, 0.08, 1.2, true, 0.35);
    }
    if (Math.abs(fy) > 0.01) {
      const dir = new BABYLON.Vector3(0, 0, Math.sign(fy));
      createForceArrow3D(origin, dir, fy, color, 0.08, 1.2, true, 0.3);
    }
    if (Math.abs(fz) > 0.01) {
      const dir = new BABYLON.Vector3(0, Math.sign(fz), 0);
      createForceArrow3D(origin, dir, fz, color, 0.08, 1.2, true, 0.35);
    }
  });
}

// =====================================================
// 3D DRAW > DIBUJAR REACCIONES EN 3D
// Dibuja flechas para cada componente de reacción en los nodos.
// El color es cian suave para diferenciarlas de las fuerzas aplicadas.
// =====================================================
function drawReactionsIn3D(context) {
  if (!context.options?.showReactions) return;

  const nodes = context.nodes;
  const reactionColor = new BABYLON.Color3(0.5, 1.0, 0.83);

  nodes.forEach((node) => {
    const rxn = node.reaction;
    if (!rxn) return;

    const rx = Number(rxn.x || 0);
    const ry = Number(rxn.y || 0);
    const rz = Number(rxn.z || 0);
    const origin = mapNodePositionTo3D(node);

    if (Math.abs(rx) > 0.01) {
      const dir = new BABYLON.Vector3(Math.sign(rx), 0, 0);
      const startPos = origin.subtract(dir.clone().scale(1.2));
      createForceArrow3D(startPos, dir, rx, reactionColor, 0.08, 1.2, true, 0.35);
    }
    if (Math.abs(ry) > 0.01) {
      const dir = new BABYLON.Vector3(0, 0, Math.sign(ry));
      const startPos = origin.subtract(dir.clone().scale(1.2));
      createForceArrow3D(startPos, dir, ry, reactionColor, 0.08, 1.2, true, 0.35);
    }
    if (Math.abs(rz) > 0.01) {
      const dir = new BABYLON.Vector3(0, Math.sign(rz), 0);
      const startPos = origin.subtract(dir.clone().scale(1.2));
      createForceArrow3D(startPos, dir, rz, reactionColor, 0.08, 1.2, true, 0.35);
    }
  });
}

// =====================================================
// DIBUJAR MODELO COMPLETO EN EL 3D
// Envía también el context para que renderModel3D pueda
// reconocer barras seleccionadas y barras 3D-only.
// =====================================================
export function drawIn3D(context, updateOnly = false) {
  if (!VIEWER_STATE.scene || !context.nodes) return;

  // if (!VIEWER_STATE.scene || !context.nodes) return;

  console.log(
    `🎨 drawIn3D: ${context.nodes.length} nodos, showDeflection=${context.options?.showDeflection}, desplazamientos=${context.desplazamientosPosition?.length}`,
  );

  const keepLabels = updateOnly && VIEWER_STATE.deflectionAnimator?.animating === true;
  // Limpiar elementos anteriores del modelo (nodos y barras)
  clearModelElements(keepLabels);

  // Dibujar nodos deformados (si corresponde)
  context.nodes.forEach((node) => {
    const pos3d = getNodePosition3D(node, context);
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      `node_${node.id}`,
      { diameter: 0.08, segments: 8 },
      VIEWER_STATE.scene,
    );
    sphere.position = pos3d;

    const material = new BABYLON.StandardMaterial(`nodeMat_${node.id}`, VIEWER_STATE.scene);
    const isActiveView = belongsToActiveView(node, context);
    const isSelected = isNodeSelected(node, context);

    if (isSelected) {
      material.diffuseColor = COLORS_3D.selectedNode;
      material.emissiveColor = COLORS_3D.selectedNodeGlow;
      sphere.scaling = new BABYLON.Vector3(2.2, 2.2, 2.2);
    } else if (isActiveView) {
      material.diffuseColor = COLORS_3D.activeModel;
      material.emissiveColor = COLORS_3D.activeModelGlow;
    } else {
      material.diffuseColor = COLORS_3D.inactiveModel;
      material.emissiveColor = new BABYLON.Color3(0.03, 0.03, 0.03);
      material.alpha = 0.12;
    }
    sphere.material = material;
    sphere.isPickable = true;
    sphere.metadata = { objectType: "node", type: "node", nodeId: node.id, id: node.id, sourceNode: node };
    VIEWER_STATE.elements.push(sphere);
  });

  // Dibujar barras deformadas
  context.shapes.forEach((beam) => {
    const [start, end] = getBeamPoints(beam, context);
    const lines = BABYLON.MeshBuilder.CreateLines(`beam_${beam.id}`, { points: [start, end] }, VIEWER_STATE.scene);
    const isActiveView = belongsToActiveView(beam, context);
    const isSelected = isBeamSelected(beam, context);

    if (isSelected) {
      lines.color = COLORS_3D.selectedModel;
    } else if (isActiveView) {
      lines.color = COLORS_3D.activeModel;
    } else {
      lines.color = COLORS_3D.inactiveModel;
      lines.alpha = 0.1;
    }
    lines.metadata = { type: "beam", id: beam.id };
    VIEWER_STATE.elements.push(lines);
  });

  // =====================================================
  // 3D > RENDERIZAR MODELO CON CONTEXTO CAD
  // Se envía context para detectar barras seleccionadas.
  // =====================================================
  renderModel3D(VIEWER_STATE, context.nodes, context.shapes, context.areas || [], context);

  // =====================================================
  // 3D SELECTION > ACTIVAR CLIC SOBRE BARRAS
  // Se ejecuta una sola vez por escena.
  // =====================================================
  enable3DFrameSelection(context);

  // =====================================================
  // 3D DRAW > DIBUJAR SOPORTES, FUERZAS Y REACCIONES
  // Se dibujan al final para que queden visibles sobre el modelo.
  // =====================================================

  // Guardar posiciones originales para animación (solo una vez)
  if (!VIEWER_STATE.originalPositions || VIEWER_STATE.originalPositions.length === 0) {
    VIEWER_STATE.originalPositions = context.nodes.map((node) => mapNodePositionTo3D(node));
    console.log("📦 Posiciones originales guardadas:", VIEWER_STATE.originalPositions.length);
  } else if (VIEWER_STATE.originalPositions.length !== context.nodes.length) {
    // Si cambió el número de nodos, actualizar posiciones originales
    VIEWER_STATE.originalPositions = context.nodes.map((node) => mapNodePositionTo3D(node));
    console.log("📦 Posiciones originales actualizadas:", VIEWER_STATE.originalPositions.length);
  }

  // Dibujar apoyos siempre (no tienen toggle)
  drawSupportsIn3D(context);

  // Dibujar cargas solo si showForces está activo
  if (context.options?.showForces) {
    drawForcesIn3D(context);
  }

  // Dibujar reacciones solo si showReactions está activo
  if (context.options?.showReactions) {
    drawReactionsIn3D(context);
  }
}

function rebuild3DGridSnapPoints(context) {
  const scene = VIEWER_STATE.scene;
  if (!scene || !context) return;

  // Borrar snap points anteriores
  scene.meshes
    .filter((mesh) => mesh.metadata?.objectType === "gridSnapPoint3D")
    .forEach((mesh) => mesh.dispose(false, true));

  const xGrids = context.referenceGrid?.xGrids || [];
  const yGrids = context.referenceGrid?.yGrids || [];
  const stories = context.stories || [];

  xGrids.forEach((xGrid) => {
    yGrids.forEach((yGrid) => {
      stories.forEach((story) => {
        const x = Number(xGrid.ordinate || 0);
        const y = Number(yGrid.ordinate || 0);
        const z = Number(story.elevation || 0);

        const snapPoint = BABYLON.MeshBuilder.CreateSphere(
          `jh_snap_${xGrid.id}_${yGrid.id}_${story.id || story.name}`,
          {
            diameter: 0.22,
            segments: 8,
          },
          scene,
        );

        snapPoint.position = new BABYLON.Vector3(x, z, y);
        snapPoint.isPickable = true;
        snapPoint.visibility = 0.001;

        snapPoint.metadata = {
          objectType: "gridSnapPoint3D",
          type: "gridSnapPoint3D",

          modelPoint: {
            x,
            y,
            z,
            xGridId: xGrid.id,
            yGridId: yGrid.id,
            storyId: story.id,
            storyName: story.name,
          },
        };
      });
    });
  });

  console.log("✅ Snap points 3D reconstruidos");
}

window.__jhRebuild3DGridSnapPoints = rebuild3DGridSnapPoints;

// =====================================================
// 3D SNAP > BUSCAR GRID POINT 3D MÁS CERCANO AL MOUSE
// No depende del plano invisible ni del scene.pick.
// Proyecta todos los snap points 3D a pantalla y toma el más cercano.
// =====================================================
function findNearest3DGridSnapPointUnderPointer(context, maxScreenDistance = 18) {
  const scene = VIEWER_STATE.scene;
  const engine = VIEWER_STATE.engine;

  if (!scene || !engine || !scene.activeCamera || !context) return null;

  const camera = scene.activeCamera;
  const pointerX = scene.pointerX;
  const pointerY = scene.pointerY;

  const viewport = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());

  let closest = null;
  let bestDistance = maxScreenDistance;

  const snapMeshes = scene.meshes.filter((mesh) => {
    return mesh?.metadata?.objectType === "gridSnapPoint3D" || mesh?.metadata?.type === "gridSnapPoint3D";
  });

  snapMeshes.forEach((mesh) => {
    if (!mesh || mesh.isEnabled() === false) return;

    const screenPoint = BABYLON.Vector3.Project(
      mesh.getAbsolutePosition(),
      BABYLON.Matrix.Identity(),
      scene.getTransformMatrix(),
      viewport,
    );

    const distance = Math.hypot(screenPoint.x - pointerX, screenPoint.y - pointerY);

    if (distance <= bestDistance) {
      bestDistance = distance;

      closest = {
        mesh,
        metadata: mesh.metadata || {},
        modelPoint: mesh.metadata?.modelPoint || null,
        screenPoint,
        distance,
      };
    }
  });

  return closest;
}

export function getViewer3DState() {
  return VIEWER_STATE;
}

function clearModelElements(keepLabels = false) {
  try {
    const modelTypes = new Set(["node", "beam", "frame", "line", "area", "slab", "wall", "opening"]);
    // Prefijos de las mallas de fuerzas y reacciones (excluyendo etiquetas)
    const forcePrefixes = ["force_shaft_", "force_head_", "support_"];

    // Las etiquetas solo se eliminan si keepLabels es false
    const labelPrefixes = keepLabels ? [] : ["label_plane_"];

    VIEWER_STATE.elements = VIEWER_STATE.elements.filter((element) => {
      if (!element) return true;

      const type = String(element?.metadata?.type || "").toLowerCase();
      const source = String(element?.metadata?.source || "").toLowerCase();
      const name = element.name || "";

      const isModelElement = modelTypes.has(type) || source === "model" || source === "model3d";
      const isForceElement = forcePrefixes.some((prefix) => name.startsWith(prefix));
      const isLabelElement = labelPrefixes.some((prefix) => name.startsWith(prefix));

      if (isModelElement || isForceElement || isLabelElement) {
        if (element && !element.isDisposed?.()) {
          element.dispose?.(false, true);
        }
        return false;
      }
      return true;
    });
  } catch (error) {
    console.warn("Error al limpiar elementos del modelo 3D:", error);
  }
}

function getNodePosition3D(node, context) {
  const useDeflection = context.options?.showDeflection && context.desplazamientosPosition;
  if (useDeflection) {
    const idx = node.id - 1;
    if (idx >= 0 && idx < context.desplazamientosPosition.length) {
      // const def = context.desplazamientosPosition[idx];
      // if (def && !isNaN(def.x) && !isNaN(def.y) && !isNaN(def.z)) {
      //     // Conversión correcta: (x, y, z) estructural -> Babylon (x, z, y)
      //     return new BABYLON.Vector3(def.x, def.z, def.y);
      // } else {
      //     console.warn(`Posición deformada inválida para nodo ${node.id}, usando original`);
      // }

      const def = context.desplazamientosPosition[idx];
      if (
        def &&
        typeof def.x === "number" &&
        !isNaN(def.x) &&
        typeof def.y === "number" &&
        !isNaN(def.y) &&
        typeof def.z === "number" &&
        !isNaN(def.z)
      ) {
        // Babylon: (x, z, y)
        return new BABYLON.Vector3(def.x, def.z, def.y);
      } else {
        console.warn(`Posición deformada inválida para nodo ${node.id}, usando original`, def);
      }
    } else {
      // console.warn(`Índice ${idx} fuera de rango (len=${context.desplazamientosPosition.length}) para nodo ${node.id}`);
    }
  }
  // fallback a posición original
  return mapNodePositionTo3D(node);
}

// Obtener los puntos deformados de una barra
function getBeamPoints(beam, context) {
  const start = getNodePosition3D(beam.node1, context);
  const end = getNodePosition3D(beam.node2, context);
  return [start, end];
}

export function removeBeamMeshById(beamId) {
  if (!VIEWER_STATE.scene) return;
  const mesh = VIEWER_STATE.scene.getMeshByName(`beam_${beamId}`);
  if (mesh && !mesh.isDisposed()) {
    mesh.dispose();
    VIEWER_STATE.elements = VIEWER_STATE.elements.filter((el) => el !== mesh);
    console.log(`🗑️ Malla 3D de la barra ${beamId} eliminada`);
  }
}

// =====================================================
// 3D ANIMATION > ACTUALIZAR POSICIONES DE NODOS Y BARRAS
// Se llama después de actualizar context.desplazamientosPosition para reflejar cambios.
// Solo actualiza las posiciones de nodos y barras existentes sin recrear todo el modelo.
// =====================================================
function updateNodePositions3D() {
  if (!VIEWER_STATE.scene) return;

  // actualiza los nodos existentes sin recrearlas
  VIEWER_STATE.elements.forEach((mesh) => {
    if (element.metadata?.type === "node") {
      const nodeId = element.metadata?.nodeId || element.metadata?.id;
      const node = context.nodes?.find((n) => n.id === nodeId);

      if (node) {
        const pos3d = getNodePosition3D(node, context);
        element.position = pos3d;
      }
    }
  });

  // Actualizar las barras existentes
  VIEWER_STATE.elements.forEach((element) => {
    if (element.metadata?.type === "beam") {
      const beamId = element.metadata?.id;
      const beam = context.shapes?.find((b) => b.id === beamId);

      if (beam && beam.node1 && beam.node2) {
        const start = getNodePosition3D(beam.node1, context);
        const end = getNodePosition3D(beam.node2, context);

        // recrear las lineas con nuevos puntos (sin eliminar el mesh viejo)
        const newLine = BABYLON.MeshBuilder.CreateLines(
          `beam_${beamId}`,
          { points: [start, end], updatable: false },
          VIEWER_STATE.scene,
        );
        newLine.color = element.color.clone();
        newLine.metadata = { type: "beam", id: beamId };

        // Reemplazar en VIEWER_STATE.elements
        const idx = VIEWER_STATE.elements.indexOf(element);
        if (idx !== -1) VIEWER_STATE.elements[idx] = newLine;
        element.dispose();
      }
    }
  });
}

// // ================================================
// // 3D ANIMATION > ACTUALIZAR POSICIONES DE NODOS Y BARRAS DEFORMADOS
// // Se llama en cada frame de la animación para interpolar entre posiciones originales y deformadas.
// // ================================================
function updateDeformedPositions(t, context) {
  if (!VIEWER_STATE.originalPositions || VIEWER_STATE.originalPositions.length === 0) {
    console.warn("⚠️ updateDeformedPositions: originalPositions vacío");
    return;
  }
  if (!context.desplazamientosPosition || context.desplazamientosPosition.length === 0) {
    console.warn("⚠️ updateDeformedPositions: desplazamientos vacíos");
    return;
  }

  // Interpolar posiciones de nodos
  const newPositions = VIEWER_STATE.originalPositions.map((orig, idx) => {
    const def = context.desplazamientosPosition[idx];
    if (!def) return orig.clone();
    const deformed = new BABYLON.Vector3(def.x, def.z, def.y);
    return BABYLON.Vector3.Lerp(orig, deformed, t);
  });

  let nodesUpdated = 0;
  let beamsUpdated = 0;

  // Actualizar mallas de nodos
  VIEWER_STATE.elements.forEach((mesh) => {
    if (mesh.metadata?.type === "node") {
      const nodeId = mesh.metadata?.nodeId || mesh.metadata?.id;
      const idx = context.nodes.findIndex((n) => n.id === nodeId);
      if (idx !== -1 && newPositions[idx]) {
        mesh.position = newPositions[idx];
        nodesUpdated++;
      }
    }
  });

  // Actualizar barras
  const beamsToUpdate = VIEWER_STATE.elements.filter((m) => m.metadata?.type === "beam");
  beamsToUpdate.forEach((beam) => {
    const beamId = beam.metadata?.id;
    const originalBeam = context.shapes?.find((b) => b.id === beamId);
    if (originalBeam && originalBeam.node1 && originalBeam.node2) {
      const idx1 = context.nodes?.findIndex((n) => n.id === originalBeam.node1.id);
      const idx2 = context.nodes?.findIndex((n) => n.id === originalBeam.node2.id);
      if (idx1 !== -1 && idx2 !== -1 && newPositions[idx1] && newPositions[idx2]) {
        const newLine = BABYLON.MeshBuilder.CreateLines(
          `beam_${beamId}`,
          { points: [newPositions[idx1], newPositions[idx2]] },
          VIEWER_STATE.scene,
        );
        newLine.color = beam.color;
        newLine.metadata = beam.metadata;
        const idx = VIEWER_STATE.elements.indexOf(beam);
        if (idx !== -1) VIEWER_STATE.elements[idx] = newLine;
        beam.dispose();
        beamsUpdated++;
      }
    }
  });
  if (t === 0 || t === 1) {
    console.log(`📊 updateDeformedPositions: t=${t}, nodos=${nodesUpdated}, barras=${beamsUpdated}`);
  }
}
// =====================================================
// 3D ANIMATION > INICIAR ANIMACIÓN DE DEFORMACIÓN
// Crea un DeflectionAnimator que interpola entre posiciones originales y deformadas.
// Se puede configurar duración, número de frames, tipo de easing y si se repite en loop.
// =====================================================

export function startBabylonDeflectionAnimation(context, options = {}) {
  console.log("🎬 Iniciando animación Babylon...");

  if (!VIEWER_STATE.originalPositions) {
    console.warn("❌ No hay posiciones originales. VIEWER_STATE.originalPositions =", VIEWER_STATE.originalPositions);
    return false;
  }

  if (!context?.desplazamientosPosition) {
    console.warn("❌ No hay desplazamientos. context.desplazamientosPosition =", context?.desplazamientosPosition);
    return false;
  }

  console.log("📊 Posiciones originales:", VIEWER_STATE.originalPositions.length);
  console.log("📊 Desplazamientos:", context.desplazamientosPosition.length);

  // Detener animación existente
  if (VIEWER_STATE.deflectionAnimator) {
    VIEWER_STATE.deflectionAnimator.stop();
  }

  const frames = options.frames || 60;
  const duration = options.duration || 2000;
  const loop = options.loop !== false;
  const easing = options.easing || "cubicOut";

  // CORREGIDO: construir el array de vectores deformados correctamente
  const deformedVectors = context.desplazamientosPosition.map((d) => {
    return new BABYLON.Vector3(d.x, d.z, d.y);
  });

  // Declarar frameCount aquí (corregido)
  let frameCount = 0;

  VIEWER_STATE.deflectionAnimator = new DeflectionAnimator(
    VIEWER_STATE.scene,
    VIEWER_STATE.originalPositions,
    deformedVectors,
    frames,
    duration,
  );

  VIEWER_STATE.deflectionAnimator.setLoop(loop).setEasing(easing);

  VIEWER_STATE.deflectionAnimator.start(
    (t) => {
      frameCount++;
      if (frameCount % 30 === 0) console.log(`🎬 Animación frame ${frameCount}, t=${t.toFixed(3)}`);
      updateDeformedPositions(t, context);
    },
    () => console.log("✅ Animación de deflexión completada"),
  );

  if (VIEWER_STATE.animationManager) {
    VIEWER_STATE.animationManager.add("deflection", VIEWER_STATE.deflectionAnimator);
  }

  console.log("✅ Animación Babylon iniciada correctamente");
  return true;
}

export function stopBabylonDeflectionAnimation() {
  // No necesita parámetro context
  if (VIEWER_STATE.deflectionAnimator) {
    VIEWER_STATE.deflectionAnimator.stop();
    VIEWER_STATE.deflectionAnimator = null;
  }
  if (VIEWER_STATE.animationManager) {
    VIEWER_STATE.animationManager.stop("deflection");
  }
}

export function isBabylonDeflectionAnimating() {
  return VIEWER_STATE.deflectionAnimator?.animating === true;
}

// =====================================================
// 3D SEISMIC ANIMATION > ANIMAR FORMA MODAL DOMINANTE
// Oscila la estructura con sin(2πt/T₁) usando los
// desplazamientos sísmicos almacenados en cada nodo.
// =====================================================

function _updateSeismicPositions(context, dispByNodeId, t, scale) {
  if (!VIEWER_STATE.originalPositions || !VIEWER_STATE.scene) return;

  const newPositions = {};
  context.nodes.forEach((node, idx) => {
    const orig = VIEWER_STATE.originalPositions[idx];
    if (!orig) return;
    const d = dispByNodeId[node.id];
    if (!d) {
      newPositions[node.id] = orig.clone();
      return;
    }
    // Structural → Babylon: (structX, structY, structZ) → Babylon (x, z, y)
    // Seismic horizontal: dx=structX → Babylon x, dy=structY → Babylon z
    newPositions[node.id] = new BABYLON.Vector3(
      orig.x + scale * (d.dx ?? 0) * t,
      orig.y + scale * (d.dz ?? 0) * t,
      orig.z + scale * (d.dy ?? 0) * t,
    );
  });

  VIEWER_STATE.elements.forEach((mesh) => {
    if (mesh.metadata?.type === "node") {
      const nodeId = mesh.metadata?.nodeId || mesh.metadata?.id;
      if (newPositions[nodeId]) mesh.position = newPositions[nodeId];
    }
  });

  const beamsToUpdate = VIEWER_STATE.elements.filter((m) => m.metadata?.type === "beam");
  beamsToUpdate.forEach((beam) => {
    const beamId = beam.metadata?.id;
    const b = context.shapes?.find((s) => s.id === beamId);
    if (b?.node1 && b?.node2) {
      const p1 = newPositions[b.node1.id];
      const p2 = newPositions[b.node2.id];
      if (p1 && p2) {
        const newLine = BABYLON.MeshBuilder.CreateLines(
          `beam_${beamId}`,
          { points: [p1, p2] },
          VIEWER_STATE.scene,
        );
        newLine.color = beam.color;
        newLine.metadata = beam.metadata;
        const idx = VIEWER_STATE.elements.indexOf(beam);
        if (idx !== -1) VIEWER_STATE.elements[idx] = newLine;
        beam.dispose();
      }
    }
  });
}

//====================================================================
// 
export function startBabylonSeismicAnimation(context, options = {}) {
  const { period = 1.0, scale = 100, speedFactor = 1 } = options;

  if (VIEWER_STATE.seismicAnimator?.animating) {
    stopBabylonSeismicAnimation();
  }

  if (!VIEWER_STATE.originalPositions || VIEWER_STATE.originalPositions.length === 0) {
    console.warn("startBabylonSeismicAnimation: no hay posiciones originales guardadas");
    return false;
  }

  const dispByNodeId = {};
  (context.nodes || []).forEach((n) => {
    if (n.seismicDisplacement) {
      dispByNodeId[n.id] = n.seismicDisplacement;
    }
  });

  if (!Object.keys(dispByNodeId).length) {
    console.warn("startBabylonSeismicAnimation: ningún nodo tiene seismicDisplacement");
    return false;
  }

  let startTime = null;
  let animFrameId = null;
  // Mutable state so setSpeedFactor can adjust without restarting the loop.
  const state = { effectivePeriod: period / speedFactor, period };

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;
    const t = Math.sin((2 * Math.PI * elapsed) / state.effectivePeriod);
    _updateSeismicPositions(context, dispByNodeId, t, scale);
    animFrameId = requestAnimationFrame(animate);
  }

  animFrameId = requestAnimationFrame(animate);

  VIEWER_STATE.seismicAnimator = {
    animating: true,
    setSpeedFactor(sf) {
      const now = performance.now();
      if (startTime !== null) {
        // Preserve the current sine phase so the transition is seamless.
        const elapsed = (now - startTime) / 1000;
        const phase = (2 * Math.PI * elapsed) / state.effectivePeriod;
        state.effectivePeriod = state.period / sf;
        const newElapsed = (phase * state.effectivePeriod) / (2 * Math.PI);
        startTime = now - newElapsed * 1000;
      } else {
        state.effectivePeriod = state.period / sf;
      }
    },
    stop() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      this.animating = false;
    },
  };

  return true;
}

export function stopBabylonSeismicAnimation() {
  if (VIEWER_STATE.seismicAnimator) {
    VIEWER_STATE.seismicAnimator.stop();
    VIEWER_STATE.seismicAnimator = null;
  }
}

export function isBabylonSeismicAnimating() {
  return VIEWER_STATE.seismicAnimator?.animating === true;
}

export function setSeismicAnimationSpeed(speedFactor) {
  VIEWER_STATE.seismicAnimator?.setSpeedFactor?.(speedFactor);
}