import { AcApDocManager } from "@mlightcad/cad-simple-viewer";

export default () => ({
  cadViewerInstance: null,
  isProcessing: false,

  async initCadViewer(canvasContainer) {
    console.log("🔧 Inicializando importador CAD...");

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvasContainer.appendChild(canvas);

    try {
      this.cadViewerInstance = AcApDocManager.createInstance(canvas);
      console.log("✅ Importador CAD inicializado");
      return true;
    } catch (error) {
      console.error("❌ Error inicializando importador:", error);
      return false;
    }
  },

  // En cad-importer.js
  async extractGeometryFromCAD() {
    const doc = AcApDocManager.instance.curDocument;
    if (!doc || !doc.database) throw new Error("No hay un documento cargado");

    const db = doc.database;
    const modelSpace = db.getModelSpace();

    const nodes = [];
    const beams = [];

    // Variables para calcular bounds
    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    const entities = modelSpace.getEntities();

    for (const entity of entities) {
      if (entity.constructor.name === "AcDbLine") {
        const startPoint = entity.startPoint;
        const endPoint = entity.endPoint;

        if (startPoint && endPoint) {
          // Actualizar bounds
          minX = Math.min(minX, startPoint.x, endPoint.x);
          minY = Math.min(minY, startPoint.y, endPoint.y);
          maxX = Math.max(maxX, startPoint.x, endPoint.x);
          maxY = Math.max(maxY, startPoint.y, endPoint.y);

          const startNodeId = this.findOrCreateNode(nodes, startPoint.x, startPoint.y);
          const endNodeId = this.findOrCreateNode(nodes, endPoint.x, endPoint.y);

          beams.push({
            id: beams.length + 1,
            startNode: startNodeId,
            endNode: endNodeId,
          });
        }
      } else if (entity.constructor.name === "AcDbPolyline") {
        const vertices = entity.vertices;
        for (let i = 0; i < vertices.length - 1; i++) {
          const start = vertices[i];
          const end = vertices[i + 1];

          // Actualizar bounds
          minX = Math.min(minX, start.x, end.x);
          minY = Math.min(minY, start.y, end.y);
          maxX = Math.max(maxX, start.x, end.x);
          maxY = Math.max(maxY, start.y, end.y);

          const startNodeId = this.findOrCreateNode(nodes, start.x, start.y);
          const endNodeId = this.findOrCreateNode(nodes, end.x, end.y);

          beams.push({
            id: beams.length + 1,
            startNode: startNodeId,
            endNode: endNodeId,
          });
        }
      }
    }

    // Devolver también los bounds
    const bounds = { minX, minY, maxX, maxY };
    return { nodes, beams, bounds };
  },

  // Actualizar importCadFile para pasar los bounds
  // En cad-importer.js
  async importCadFile(file, cadSystem) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    try {
      const fileContent = await this.readFile(file);
      await this.cadViewerInstance.openDocument(file.name, fileContent, {
        readOnly: true,
        minimumChunkSize: 1000,
      });

      const { nodes, beams, bounds } = await this.extractGeometryFromCAD();

      // --- IMPORTANTE: Activar modo CAD ---
      if (cadSystem && cadSystem.toggleCadMode) {
        cadSystem.toggleCadMode(true); // Oculta el grid de dibujo
      }

      // Limpiar canvas para que se vea el CAD
      if (cadSystem && cadSystem.clearCanvas) {
        cadSystem.clearCanvas();
      }

      // Convertir geometría a tu sistema (opcional, si quieres importar las líneas)
      // this.convertToYourSystem(nodes, beams, cadSystem)

      console.log(
        `✅ CAD cargado: ${nodes.length} nodos, ${beams.length} barras (bounds: ${bounds?.minX} a ${bounds?.maxX})`,
      );
    } catch (error) {
      console.error("Error al importar CAD:", error);
      this.showError("No se pudo procesar el archivo CAD.");
      throw error;
    } finally {
      this.isProcessing = false;
    }
  },

  findOrCreateNode(nodes, x, y, tolerance = 0.01) {
    let existing = nodes.find((n) => Math.hypot(n.x - x, n.y - y) < tolerance);
    if (existing) return existing.id;

    const newId = nodes.length + 1;
    nodes.push({ id: newId, x: x, y: y });
    return newId;
  },

  convertToYourSystem(cadNodes, cadBeams, cadSystem) {
    console.log("🔄 Convirtiendo a formato del sistema...");

    // Guardar el número actual de elementos
    const existingNodeCount = cadSystem.nodes.length;
    const existingBeamCount = cadSystem.shapes.length;

    // Mapear IDs antiguos a los nuevos objetos de nodo
    const nodeMap = new Map();
    for (const cadNode of cadNodes) {
      const newNode = {
        id: cadSystem.nodes.length + 1,
        position: { x: cadNode.x, y: cadNode.y, z: 0 },
        selected: false,
        soporte: "",
        reaction: { x: 0, y: 0 },
      };
      cadSystem.nodes.push(newNode);
      nodeMap.set(cadNode.id, newNode);
      console.log(`  ✅ Nodo ${newNode.id}: (${cadNode.x}, ${cadNode.y})`);
    }

    // Crear las vigas
    for (const beam of cadBeams) {
      const startNode = nodeMap.get(beam.startNode);
      const endNode = nodeMap.get(beam.endNode);
      if (startNode && endNode) {
        const newBeam = {
          id: cadSystem.shapes.length + 1,
          node1: startNode,
          node2: endNode,
          A: cadSystem.globalA,
          E: cadSystem.globalE,
          fAxial: 0,
          selected: false,
          style: {
            normal: () => {},
            compresion: () => {},
            traccion: () => {},
          },
        };
        cadSystem.shapes.push(newBeam);
        console.log(`  ✅ Barra ${newBeam.id}: nodo${startNode.id} → nodo${endNode.id}`);
      }
    }

    // Actualizar IDs
    if (cadSystem.nextNodeId) {
      cadSystem.nextNodeId = cadSystem.nodes.length + 1;
    }
    if (cadSystem.nextBeamId) {
      cadSystem.nextBeamId = cadSystem.shapes.length + 1;
    }

    // Redibujar
    cadSystem.redraw();
    if (cadSystem.sync3D) cadSystem.sync3D();

    console.log(
      `✅ Importación completada: +${cadSystem.nodes.length - existingNodeCount} nodos, +${cadSystem.shapes.length - existingBeamCount} barras`,
    );
  },

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  },
});
