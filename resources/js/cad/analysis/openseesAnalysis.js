// Función principal que reemplazará a calcularFuerzas cuando esté listo
  async calcularFuerzasOpenSees(event) {
    if (event) event.preventDefault();

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando con OpenSees!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Primero, verificar si OpenSeesPy está disponible
      const statusResponse = await fetch("/api/opensees/status");
      const status = await statusResponse.json();

      let results;

      if (status.status === "online") {
        // Usar OpenSeesPy
        results = await this.analyzeWithOpenSees();
      } else {
        // Fallback a Octave
        console.log("OpenSees no disponible, usando Octave...");
        waitingPopup.hideLoading();
        return this.calcularFuerzas(event);
      }

      waitingPopup.hideLoading();

      if (results.success) {
        this.processOpenSeesResults(results);
        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo completado!",
          html: "Los resultados se han actualizado correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(results.error || "Error en el cálculo");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error:", error);
      swalTailwind
        .fire({
          icon: "error",
          title: "Error",
          html: error.message || "Hubo un problema al calcular las fuerzas. Usando Octave...",
          showConfirmButton: true,
        })
        .then(() => {
          // Fallback a Octave
          this.calcularFuerzas(event);
        });
    }
  },

  // Versión híbrida que intenta OpenSees primero y fallback a Octave
  async calcularFuerzasHybrid(event) {
    if (event) event.preventDefault();

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Intentar llamar a OpenSees directamente
      const results = await this.analyzeWithOpenSees();
      waitingPopup.hideLoading();

      if (results && results.success) {
        this.processOpenSeesResults(results);
        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo completado!",
          html: "Resultados de OpenSeesPy",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      } else if (results && results.error) {
        throw new Error(results.error);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error en OpenSees:", error);

      // Fallback a Octave
      console.log("Usando Octave como fallback...");
      swalTailwind
        .fire({
          icon: "info",
          title: "Usando motor alternativo",
          html: "OpenSees no está disponible. Usando Octave...",
          timer: 1500,
          showConfirmButton: false,
        })
        .then(() => {
          this.calcularFuerzas(event);
        });
    }
  },

  async analyzeWithOpenSees() {
    // ============================================================
    // 1. CAPTURAR DATOS DE TU INTERFAZ
    // ============================================================

    // Nodos: posición (x, y) de cada nodo
    const nodes = this.nodes.map((node, index) => ({
      id: index + 1,
      x: node.position.x,
      y: node.position.y,
    }));

    // Elementos: conexiones entre nodos
    const elements = this.shapes.map((beam, index) => ({
      id: index + 1,
      node_i: beam.node1.id,
      node_j: beam.node2.id,
      area: beam.A || 0.01, // Área de la sección
      E: beam.E || 200e9, // Módulo de elasticidad
    }));

    // Apoyos: restricciones (1=fijo, 0=libre)
    const supports = this.nodes.map((node, index) => ({
      node: index + 1,
      ux: node.soporte === "soporteUno" || node.soporte === "soporteTres" ? 1 : 0,
      uy: node.soporte !== "" ? 1 : 0,
    }));

    // Cargas: fuerzas aplicadas
    const loads = this.nodes.map((node, index) => ({
      node: index + 1,
      fx: node.cargaX(),
      fy: node.cargaY(),
    }));

    // ============================================================
    // 2. MOSTRAR EN CONSOLA PARA DEPURAR
    // ============================================================
    console.log("📤 DATOS ENVIADOS A OPENSEES:");
    console.log("   Nodos:", nodes);
    console.log("   Elementos:", elements);
    console.log("   Apoyos:", supports);
    console.log("   Cargas:", loads);

    // ============================================================
    // 3. ENVIAR AL SERVIDOR PYTHON
    // ============================================================
    const response = await fetch("http://localhost:5001/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nodes: nodes,
        elements: elements,
        supports: supports,
        loads: loads,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const results = await response.json();
    console.log("📥 RESULTADOS RECIBIDOS:", results);

    return results;
  },

  
  async analyze3DWithOpenSees() {
    // ============================================================
    // 1. CAPTURAR DATOS 3D DE TU INTERFAZ
    // ============================================================

    const nodes = this.nodes.map((node, index) => ({
      id: index + 1,
      x: node.position.x,
      y: node.position.y,
      z: node.position.z || 0, // ← Coordenada Z (altura)
    }));

    const elements = this.shapes.map((beam, index) => ({
      id: index + 1,
      node_i: beam.node1.id,
      node_j: beam.node2.id,
      area: beam.A || 0.01,
      E: beam.E || 200e9,
      Iz: 0.0001, // Momento de inercia Z
      Iy: 0.0001, // Momento de inercia Y
      J: 1e-6, // Constante de torsión
    }));

    const supports = this.nodes.map((node, index) => ({
      node: index + 1,
      ux: node.soporte === "soporteUno" ? 1 : 0,
      uy: node.soporte === "soporteUno" || node.soporte === "soporteTres" ? 1 : 0,
      uz: node.soporte === "soporteUno" ? 1 : 0,
      rx: node.soporte === "soporteUno" ? 1 : 0,
      ry: node.soporte === "soporteUno" ? 1 : 0,
      rz: 1,
    }));

    const loads = this.nodes.map((node, index) => ({
      node: index + 1,
      fx: node.cargaX(),
      fy: node.cargaY(),
      fz: node.cargaZ() || 0,
      mx: 0,
      my: 0,
      mz: 0,
    }));

    console.log("📤 DATOS 3D ENVIADOS:", { nodes, elements, supports, loads });

    const response = await fetch("http://localhost:5001/api/analyze-3d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, elements, supports, loads }),
    });

    return response.json();
  },