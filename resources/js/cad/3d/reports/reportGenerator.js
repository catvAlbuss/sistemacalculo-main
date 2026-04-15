generarReporte() {
    this.save();
    this.fitContentToScreen();
    this.redraw();
    const diseño = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.currentRenderer = this.deflexionRenderer;
    this.redraw();
    const deflexion = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.currentRenderer = this.axialRenderer;
    this.redraw();
    const axial = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.restore();
    const colSpan = (this.K_Global_Reducido[0] ?? []).length - 1;
    const minmax = this.nodes.length !== 0 ? [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] : [-0, 0];
    const [minx, maxx] = this.matrizDesplazamiento.reduce(
      ([min, max], [x, y, z]) => [Math.min(min, x), Math.max(max, x)],
      minmax,
    );
    const [miny, maxy] = this.matrizDesplazamiento.reduce(
      ([min, max], [x, y, z]) => [Math.min(min, y), Math.max(max, y)],
      minmax,
    );
    /* const maxDefx = ;
    const minDefy = ;
    const minDefy = ; */
    const docDefinition = {
      pageOrientation: "landscape",
      content: [
        { text: "1.- Nodos", style: "header", pageOrientation: "landscape" },
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*", "*", "*", "*"],
            body: [
              [{ text: "Nodos", style: "tableHeader", colSpan: 7, alignment: "center" }, {}, {}, {}, {}, {}, {}],
              [
                { text: "ID", style: "tableHeader", alignment: "center" },
                { text: "Dx", style: "tableHeader", alignment: "center" },
                { text: "Dy", style: "tableHeader", alignment: "center" },
                { text: "X", style: "tableHeader", alignment: "center" },
                { text: "Y", style: "tableHeader", alignment: "center" },
                { text: "Fx", style: "tableHeader", alignment: "center" },
                { text: "Fy", style: "tableHeader", alignment: "center" },
              ],
              ...this.nodes.map((n, index) => {
                return [
                  {
                    text: n.id,
                    alignment: "center",
                  },
                  {
                    text: axisToFixed(this.matrizDesplazamiento[index][0]),
                    alignment: "center",
                  },
                  {
                    text: axisToFixed(this.matrizDesplazamiento[index][1]),
                    alignment: "center",
                  },
                  {
                    text: n.position.x.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: n.position.y.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: n.cargaX().toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: n.cargaX().toFixed(2),
                    alignment: "center",
                  },
                ];
              }),
            ],
          },
          layout: "lightHorizontalLines",
        },
        { text: "2.- Barras", style: "header" },
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
            body: [
              [
                { text: "Barras", style: "tableHeader", colSpan: 11, alignment: "center" },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
              ],
              [
                { text: "ID", style: "tableHeader", alignment: "center" },
                { text: "Axial", style: "tableHeader", alignment: "center" },
                { text: "Cercano", style: "tableHeader", alignment: "center" },
                { text: "Lejano", style: "tableHeader", alignment: "center" },
                { text: "X1", style: "tableHeader", alignment: "center" },
                { text: "Y1", style: "tableHeader", alignment: "center" },
                { text: "X2", style: "tableHeader", alignment: "center" },
                { text: "Y2", style: "tableHeader", alignment: "center" },
                { text: "L", style: "tableHeader", alignment: "center" },
                { text: "E", style: "tableHeader", alignment: "center" },
                { text: "A", style: "tableHeader", alignment: "center" },
              ],
              ...this.shapes.map((s) => {
                return [
                  {
                    text: s.id,
                    alignment: "center",
                  },
                  {
                    text: s.fAxial.toFixed(3),
                    alignment: "center",
                  },
                  {
                    text: s.node1.id,
                    alignment: "center",
                  },
                  {
                    text: s.node2.id,
                    alignment: "center",
                  },
                  {
                    text: s.node1.position.x.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.node1.position.y.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.node2.position.x.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.node2.position.y.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: pointDistance(s.node1.position, s.node2.position).toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.E.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.A.toFixed(2),
                    alignment: "center",
                  },
                ];
              }),
            ],
          },
          layout: "lightHorizontalLines",
        },
        { text: "3.- Diseño", style: "header", pageBreak: "before", pageOrientation: "portrait" },
        {
          image: diseño,
          width: 500,
        },
        { text: "4.- Deflexion", style: "header" },
        {
          image: deflexion,
          width: 500,
        },
        { text: "5.- Axial", style: "header", pageBreak: "before" },
        {
          image: axial,
          width: 500,
        },
        { text: "6.- Resultados", style: "header", pageBreak: "before", pageOrientation: "landscape" },
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            widths: [
              ...(this.K_Global_Reducido[0] ?? [1]).map(() => {
                return "*";
              }),
              "*",
              "*",
            ],
            body: [
              /* [{ text: "", alignment: "center" }], */
              [
                {
                  text: "K Global Reducido",
                  style: "tableHeader",
                  colSpan: this.K_Global_Reducido[0]?.length ?? 1,
                  alignment: "center",
                },
                ...Array.from(Array(colSpan < 0 ? 0 : colSpan), () => {
                  return {};
                }),
                { text: "Fuerzas Globales Reducidas", style: "tableHeader", alignment: "center" },
                { text: "D Global Reducido", style: "tableHeader", alignment: "center" },
              ],
              ...this.K_Global_Reducido.map((valores, index) => {
                return [
                  ...valores.map((val) => {
                    return {
                      text: val.toFixed(2),
                      alignment: "center",
                      style: "resultados",
                    };
                  }),
                  {
                    text: this.Fuerzas_Globales_Reducidas[index].toFixed(2),
                    alignment: "center",
                    style: "resultados",
                  },
                  {
                    text: this.D_Global_Reducido[index].toFixed(2),
                    alignment: "center",
                    style: "resultados",
                  },
                ];
              }),
            ],
          },
          layout: "lightHorizontalLines",
        },
        {
          text: `La maxima deflexion en x es: ${axisToFixed(maxx)}`,
          style: "tableExample",
          pageBreak: "before",
          pageOrientation: "landscape",
        },
        {
          text: `La minima deflexion en x es: ${axisToFixed(minx)}`,
          style: "tableExample",
        },
        {
          text: `La maxima deflexion en y es: ${axisToFixed(maxy)}`,
          style: "tableExample",
        },
        {
          text: `La minima deflexion en y es: ${axisToFixed(miny)}`,
          style: "tableExample",
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
        resultados: {
          fontSize: 8,
          color: "black",
        },
      },
    };
    pdfMake.createPdf(docDefinition).download("aligerados.pdf");
  },