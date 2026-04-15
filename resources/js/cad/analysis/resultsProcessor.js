// Procesar resultados de OpenSees
  processOpenSeesResults(results) {
    // Procesar fuerzas axiales
    Object.entries(results.forces).forEach(([id, axialForce]) => {
      const beamIndex = parseInt(id) - 1;
      if (this.shapes[beamIndex]) {
        this.shapes[beamIndex].fAxial = axialForce;
        if (Math.abs(axialForce) < 0.001) {
          this.shapes[beamIndex].style.normal();
        } else if (axialForce < 0) {
          this.shapes[beamIndex].style.compresion();
        } else {
          this.shapes[beamIndex].style.traccion();
        }
      }
    });

    // Procesar desplazamientos
    this.matrizDesplazamiento = Object.values(results.displacements).map((d) => [d.dx, d.dy, 0]);
    this.calcularDeflecciones();

    // Procesar reacciones
    Object.entries(results.reactions).forEach(([id, reaction]) => {
      const nodeIndex = parseInt(id) - 1;
      if (this.nodes[nodeIndex]) {
        this.nodes[nodeIndex].reaction.x = reaction.rx;
        this.nodes[nodeIndex].reaction.y = reaction.ry;
      }
    });

    // Sincronizar vista 3D
    this.sync3D();

    if (results.displacements) {
      // Aplicar desplazamientos a la visualización 3D
      this.applyDeformationsTo3D(results.displacements);
    }

    console.log("✅ Resultados de OpenSees procesados:", results);
  },

  // Después de runOpenSeesAnalysis(), agrega:
  applyDeformationsTo3D(displacements, scale = 100) {
    if (!window.babylonScene || !this.nodes) return;

    console.log("🎨 Aplicando deformaciones a vista 3D...");

    // Guardar posiciones originales si no existen
    if (!this._originalPositions) {
      this._originalPositions = this.nodes.map((node) => ({
        x: node.position.x,
        y: node.position.y,
        z: node.position.z || 0,
      }));
    }

    // Aplicar desplazamientos escalados
    this.nodes.forEach((node, i) => {
      const nodeId = node.id;
      const disp = displacements[nodeId];

      if (disp) {
        // Posición original
        const orig = this._originalPositions[i];

        // Nueva posición = original + desplazamiento * escala
        node.position.x = orig.x + (disp.dx || 0) * scale;
        node.position.y = orig.y + (disp.dy || 0) * scale;
        node.position.z = (orig.z || 0) + (disp.dz || 0) * scale;
      }
    });

    // Redibujar la escena 3D
    this.drawIn3D();

    console.log("✅ Deformaciones aplicadas (escala: " + scale + "x)");
  },

  calcularDeflecciones() {
      this.desplazamientosPosition = this.matrizDesplazamiento.map(([x, y, _], index) => {
        return {
          x: x * this.options.deflectionScale + this.nodes[index].position.x,
          y: y * this.options.deflectionScale + this.nodes[index].position.y,
        };
      });
      this.deflecciones = this.shapes.map((b) => {
        return {
          x: [this.desplazamientosPosition[b.node1.id - 1].x, this.desplazamientosPosition[b.node2.id - 1].x],
          y: [this.desplazamientosPosition[b.node1.id - 1].y, this.desplazamientosPosition[b.node2.id - 1].y],
        };
      });
    },