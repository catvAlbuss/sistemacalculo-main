// resources/js/cad/modules/viewFilter.js

export class ViewFilter {
  constructor(cadSystem) {
    this.cadSystem = cadSystem;
  }

  // Obtener nodos filtrados según la vista actual
  getFilteredNodes() {
    const view = this.cadSystem.elevationManager?.current2DView || "plan";
    const tolerance = 0.01;

    console.log(`🔍 FILTRANDO - Vista: ${view}`);
    console.log(`   Nodos totales: ${this.cadSystem.nodes.length}`);

    const filtered = this.cadSystem.nodes.filter((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const z = node.position.z || 0;

      let include = false;
      switch (view) {
        case "plan":
          include = Math.abs(y) < tolerance;
          console.log(
            `   Nodo ${node.id}: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) -> plan: Y=${y.toFixed(2)} -> ${include ? "INCLUIR" : "EXCLUIR"}`,
          );
          break;
        case "elevation-xy":
          include = Math.abs(z) < tolerance;
          console.log(
            `   Nodo ${node.id}: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) -> elevation-xy: Z=${z.toFixed(2)} -> ${include ? "INCLUIR" : "EXCLUIR"}`,
          );
          break;
        case "elevation-zy":
          include = Math.abs(x) < tolerance;
          console.log(
            `   Nodo ${node.id}: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) -> elevation-zy: X=${x.toFixed(2)} -> ${include ? "INCLUIR" : "EXCLUIR"}`,
          );
          break;
        default:
          include = true;
      }
      return include;
    });

    console.log(`   Nodos filtrados: ${filtered.length}`);
    return filtered;
  }

  // Obtener vigas filtradas
  getFilteredBeams() {
    const filteredNodes = this.getFilteredNodes();
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    return this.cadSystem.shapes.filter((beam) => {
      return filteredNodeIds.has(beam.node1.id) && filteredNodeIds.has(beam.node2.id);
    });
  }

  // Proyectar coordenada 3D a 2D para dibujar en canvas
  projectTo2D(point3D) {
    const view = this.cadSystem.elevationManager?.current2DView || "plan";
    switch (view) {
      case "plan":
        return { x: point3D.x, y: point3D.z || 0 };
      case "elevation-xy":
        return { x: point3D.x, y: point3D.y };
      case "elevation-zy":
        return { x: point3D.z || 0, y: point3D.y };
      default:
        return { x: point3D.x, y: point3D.y };
    }
  }
  //Metodo para depurar nodos filtrados
  debugPrintNodes() {
    console.log("=== NODOS ACTUALES ===");
    this.cadSystem.nodes.forEach((node) => {
      console.log(`Nodo ${node.id}: (${node.position.x}, ${node.position.y}, ${node.position.z || 0})`);
    });
  }
}
