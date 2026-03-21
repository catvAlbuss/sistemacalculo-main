import { createSpreeadSheetTable } from "../../tabulator_base/table_factory.js";
import { TABLE_CONFIG } from "../config/constants.js";

const { GROUPS, UNITS } = TABLE_CONFIG;

export const createTable = (containerId, numTramos, existingInstance = null) => {
    // Destruir instancia anterior si existe
    if (existingInstance) {
        try {
            existingInstance.destroy();
        } catch (e) {
            console.warn("Error al destruir tabla:", e);
        }
    }

    const datosGeneralesModel = (id) => {
        const generarColumnasTramos = (numTramos) => {
            const columnas = [];

            for (let i = 1; i <= numTramos; i++) {
                columnas.push({
                    title: `B${i}`,
                    columns: [
                        {
                            title: "Inicio",
                            field: `b${i}_a`,
                            editor: "number",
                            hozAlign: "center",
                            width: 100,
                            formatter: (cell) => {
                                const data = cell.getRow().getData();
                                if (data._isLuzRow) {
                                    const el = cell.getElement();
                                    el.style.gridColumn = 'span 3';
                                    el.style.width = '300px';
                                }
                                return cell.getValue() ?? "";
                            }
                        },
                        {
                            title: "Medio",
                            field: `b${i}_b`,
                            editor: "number",
                            hozAlign: "center",
                            width: 100,
                            formatter: (cell) => {
                                const data = cell.getRow().getData();
                                if (data._isLuzRow) {
                                    cell.getElement().style.display = 'none';
                                }
                                return cell.getValue() ?? "";
                            }
                        },
                        {
                            title: "Final",
                            field: `b${i}_c`,
                            editor: "number",
                            hozAlign: "center",
                            width: 100,
                            formatter: (cell) => {
                                const data = cell.getRow().getData();
                                if (data._isLuzRow) {
                                    cell.getElement().style.display = 'none';
                                }
                                return cell.getValue() ?? "";
                            }
                        },
                    ],
                });
            }

            return columnas;
        };

        const generarDatosIniciales = (numTramos) => {
            const datos = [];
            let idCounter = 1;

            // Fila LUZ
            const filaLuz = { id: idCounter++, encabezado_fila: "LUZ", _isLuzRow: true };
            for (let i = 1; i <= numTramos; i++) {
                filaLuz[`b${i}_a`] = 2.7;
                filaLuz[`b${i}_b`] = "";
                filaLuz[`b${i}_c`] = "";
            }
            datos.push(filaLuz);

            const filaBase = { id: idCounter++, encabezado_fila: "BASE", _isBaseRow: true };
            for (let i = 1; i <= numTramos; i++) {
                filaBase[`b${i}_a`] = 40;
                filaBase[`b${i}_b`] = "";
                filaBase[`b${i}_c`] = "";
            }
            datos.push(filaBase);

            const filaAltura = { id: idCounter++, encabezado_fila: "ALTURA", _isAlturaRow: true };
            for (let i = 1; i <= numTramos; i++) {
                filaAltura[`b${i}_a`] = 90;
                filaAltura[`b${i}_b`] = "";
                filaAltura[`b${i}_c`] = "";
            }
            datos.push(filaAltura);

            // Grupos Principal y conceptos
            Object.entries(GROUPS).forEach(([mainGroup, subGroups]) => {
                // Header del Grupo Principal (POSITIVO / NEGATIVO)
                const filaMain = {
                    id: idCounter++,
                    encabezado_fila: mainGroup.toUpperCase(),
                    _isMainGroup: true,
                    _mainGroup: mainGroup
                };
                for (let i = 1; i <= numTramos; i++) {
                    filaMain[`b${i}_a`] = "";
                    filaMain[`b${i}_b`] = "";
                    filaMain[`b${i}_c`] = "";
                }
                datos.push(filaMain);

                // Fila CAPAS
                const filaCapas = {
                    id: idCounter++,
                    encabezado_fila: "CAPAS",
                    _isCapasRow: true,
                    _mainGroup: mainGroup
                };
                for (let i = 1; i <= numTramos; i++) {
                    filaCapas[`b${i}_a`] = 1; // Valor por defecto 1 capa
                    filaCapas[`b${i}_b`] = "";
                    filaCapas[`b${i}_c`] = "";
                }
                datos.push(filaCapas);

                // Iterar subgrupos
                subGroups.forEach(({ grupo, conceptos }) => {
                    const filaGrupo = {
                        id: idCounter++,
                        encabezado_fila: grupo,
                        _isGrupo: true,
                        _mainGroup: mainGroup
                    };
                    for (let i = 1; i <= numTramos; i++) {
                        filaGrupo[`b${i}_a`] = "";
                        filaGrupo[`b${i}_b`] = "";
                        filaGrupo[`b${i}_c`] = "";
                    }
                    datos.push(filaGrupo);

                    conceptos.forEach(concepto => {
                        const filaConcepto = {
                            id: idCounter++,
                            encabezado_fila: `  ${concepto}`,
                            _concepto: concepto,
                            _unidad: UNITS[concepto] || "",
                            _grupo: grupo,
                            _mainGroup: mainGroup
                        };

                        for (let i = 1; i <= numTramos; i++) {
                            filaConcepto[`b${i}_a`] = 0;
                            filaConcepto[`b${i}_b`] = 0;
                            filaConcepto[`b${i}_c`] = 0;
                        }
                        datos.push(filaConcepto);
                    });
                });
            });

            return datos;
        };

        const aplicarEstilosRow = (row) => {
            const data = row.getData();
            const cells = row.getCells();
            const firstCell = cells[0];

            if (data._isLuzRow) {
                if (firstCell) firstCell.getElement().style.fontWeight = 'bold';

                for (let i = 1; i < cells.length; i++) {
                    const cell = cells[i];
                    const field = cell.getField();
                    const el = cell.getElement();

                    if (field?.endsWith('_a')) {
                        el.style.gridColumn = 'span 3';
                        el.style.width = '300px';
                    } else if (field?.endsWith('_b') || field?.endsWith('_c')) {
                        el.style.display = 'none';
                    }
                }
            } else if (data._isBaseRow) {
                if (firstCell) firstCell.getElement().style.fontWeight = 'bold';

                for (let i = 1; i < cells.length; i++) {
                    const cell = cells[i];
                    const field = cell.getField();
                    const el = cell.getElement();

                    if (field?.endsWith('_a')) {
                        el.style.gridColumn = 'span 3';
                        el.style.width = '300px';
                    } else if (field?.endsWith('_b') || field?.endsWith('_c')) {
                        el.style.display = 'none';
                    }
                }
            } else if (data._isAlturaRow) {
                if (firstCell) firstCell.getElement().style.fontWeight = 'bold';

                for (let i = 1; i < cells.length; i++) {
                    const cell = cells[i];
                    const field = cell.getField();
                    const el = cell.getElement();

                    if (field?.endsWith('_a')) {
                        el.style.gridColumn = 'span 3';
                        el.style.width = '300px';
                    } else if (field?.endsWith('_b') || field?.endsWith('_c')) {
                        el.style.display = 'none';
                    }
                }
            } else if (data._isMainGroup) {
                // Estilo para POSITIVO / NEGATIVO
                const isPositivo = data._mainGroup === 'positivo';
                const bgColor = isPositivo ? '#C8E6C9' : '#FFCDD2'; // Verde suave / Rojo suave

                if (firstCell) {
                    firstCell.getElement().style.fontWeight = 'bold';
                    firstCell.getElement().style.textAlign = 'center';
                    firstCell.getElement().style.backgroundColor = bgColor;
                    firstCell.getElement().style.color = '#333';
                    firstCell.getElement().style.fontSize = '0.8em'; // Reduce font size
                }
                row.getElement().style.backgroundColor = bgColor;
                cells.forEach(cell => {
                    cell.getElement().style.backgroundColor = bgColor;
                    cell.getElement().style.pointerEvents = 'none';
                    cell.getElement().style.fontSize = '0.8em'; // Reduce font size for all cells in row
                });
            } else if (data._isCapasRow) {
                // Estilo para CAPAS (igual que LUZ/BASE/ALTURA)
                if (firstCell) firstCell.getElement().style.fontWeight = 'bold';

                for (let i = 1; i < cells.length; i++) {
                    const cell = cells[i];
                    const field = cell.getField();
                    const el = cell.getElement();

                    if (field?.endsWith('_a')) {
                        el.style.gridColumn = 'span 3';
                        el.style.width = '300px';
                    } else if (field?.endsWith('_b') || field?.endsWith('_c')) {
                        el.style.display = 'none';
                    }
                }
            } else if (data._isGrupo) {
                if (firstCell) {
                    firstCell.getElement().style.fontWeight = 'bold';
                    firstCell.getElement().style.backgroundColor = '#B2E5FC';
                }
                row.getElement().style.backgroundColor = '#B2E5FC';
                cells.forEach(cell => {
                    cell.getElement().style.backgroundColor = '#B2E5FC';
                    cell.getElement().style.pointerEvents = 'none';
                    cell.getElement().style.opacity = '0.7';
                });
            }
        };

        return {
            id: id,
            data: generarDatosIniciales(numTramos),
            config: {
                height: 500,
                layout: "fitDataStretch",
                renderComplete: function () {
                    this.getRows().forEach(row => aplicarEstilosRow(row));
                },
                rowFormatter: aplicarEstilosRow,
                cellEditing: (cell) => {
                    const data = cell.getRow().getData();
                    if (data._isMainGroup || data._isGrupo) return false;
                    return true;
                },
                columns: [
                    {
                        title: "",
                        field: "encabezado_fila",
                        frozen: true,
                        editor: false,
                        width: 60,
                        headerSort: false,
                        cssClass: "header-column",
                        formatter: (cell) => {
                            const data = cell.getRow().getData();
                            if (data._unidad) {
                                return `${data.encabezado_fila}<br><span style="font-size: 0.8em; color: #666;">${data._unidad}</span>`;
                            }
                            return data.encabezado_fila;
                        }
                    },
                    ...generarColumnasTramos(numTramos),
                ],
            },
        };
    };

    // Crear nueva instancia
    const resultado = createSpreeadSheetTable(datosGeneralesModel(containerId));

    // Retornar la referencia correcta a la tabla
    const tableInstance = resultado?.table || resultado;
    //console.log("Tabla creada:", tableInstance);
    return tableInstance;
};
