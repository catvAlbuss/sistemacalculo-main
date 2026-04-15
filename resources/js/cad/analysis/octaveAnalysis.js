calcularFuerzas(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append(
      "nodos",
      "[" +
      this.nodes
        .map((node, index) => {
          return [index + 1, node.position.x, node.position.y, 0].join(",");
        })
        .join(";") +
      "]",
    );
    formData.append(
      "barras",
      "[" +
      this.shapes
        .map((beam, index) => {
          return [index + 1, this.nodes.indexOf(beam.node1) + 1, this.nodes.indexOf(beam.node2) + 1].join(",");
        })
        .join(";") +
      "]",
    );
    formData.append(
      "cargas",
      "[" +
      this.nodes
        .map((node, index) => {
          return { id: index + 1, node: node };
        })
        .filter(({ node: node }) => {
          return node.tieneCarga();
        })
        .map((value) => {
          return [value.id, value.node.cargaX(), value.node.cargaY(), 0].join(",");
        })
        .join(";") +
      "]",
    );
    formData.append(
      "restringidos",
      "[" +
      this.nodes
        .map((node, index) => {
          return { id: index + 1, node: node };
        })
        .map((value) => {
          let restriccion = [0, 0, 1];
          if (value.node.soporte === "soporteUno") {
            restriccion = [1, 1, 1];
          } else if (value.node.soporte === "soporteDos") {
            restriccion = [0, 1, 1];
          } else if (value.node.soporte === "soporteTres") {
            restriccion = [1, 0, 1];
          }
          return [value.id, ...restriccion];
        })
        .join(";") +
      "]",
    );
    formData.append(
      "propiedades",
      "[" +
      this.shapes
        .map((beam) => {
          return [beam.A, beam.E].join(",");
        })
        .join(";") +
      "]",
    );
    console.log(Object.fromEntries(formData));

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
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
    fetch("/calcularFuerzasArmaduras", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/octet-stream")) {
          return response.arrayBuffer();
        } else {
          const error = await response.text();
          return Promise.reject(error);
        }
      })
      .then((matData) => {
        waitingPopup.hideLoading();
        const fuerzas = readmat(matData);
        console.log(fuerzas);
        const dataObject = fuerzas.data;
        this.matrizDesplazamiento = dataObject.MatrizDesplazamiento;
        this.calcularDeflecciones();
        Object.values(dataObject.resultados.lines).forEach(({ coords: _, fuerza: [f] }, index) => {
          this.shapes[index].fAxial = f;
          if (Math.abs(f) < 0.001) {
            this.shapes[index].style.normal();
          } else if (f < 0) {
            this.shapes[index].style.compresion();
          } else {
            this.shapes[index].style.traccion();
          }
        });
        this.nodes.forEach((n, index) => {
          const rX = dataObject.Reacciones[3 * index];
          const rY = dataObject.Reacciones[3 * index + 1];
          dataObject.Reacciones[3 * index + 2];
          n.reaction.x = Math.abs(rX) < 1.0e-8 ? 0 : rX;
          n.reaction.y = Math.abs(rY) < 1.0e-8 ? 0 : rY;
        });
        this.K_Global_Reducido = fuerzas.data.K_Global_Reducido;
        this.Fuerzas_Globales_Reducidas = fuerzas.data.Fuerzas_Globales_Reducidas;
        this.D_Global_Reducido = fuerzas.data.D_Global_Reducido;
        this.sync3D(); // ← AGREGAR
      })
      .catch((error) => {
        console.log(error);
        waitingPopup.hideLoading();
        swalTailwind.fire({
          icon: "error",
          html: `
            ${error}
          `,
          showConfirmButton: true,
        });
      });
  },

  