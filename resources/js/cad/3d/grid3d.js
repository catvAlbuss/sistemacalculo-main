// js/cad/3d/grid3d.js
// Versión que respeta la implementación funcional de cad_sys.js

import * as BABYLON from "@babylonjs/core";

// Función auxiliar para crear etiquetas simples (copia de la que funciona en cad_sys)
function createSimpleAxisLabel(text, color, scene) {
    if (!scene) return null;
    try {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
        ctx.font = "Bold 40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 64, 64);

        const texture = new BABYLON.DynamicTexture(`label_${text}`, { width: 128, height: 128 }, scene);
        texture.update(canvas);

        const material = new BABYLON.StandardMaterial(`labelMat_${text}`, scene);
        material.diffuseTexture = texture;
        material.emissiveColor = color;
        material.specularColor = new BABYLON.Color3(0, 0, 0);

        const plane = BABYLON.MeshBuilder.CreatePlane(`labelPlane_${text}`, { width: 0.7, height: 0.7 }, scene);
        plane.material = material;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    } catch (e) {
        console.warn(`Error creando etiqueta ${text}:`, e);
        return null;
    }
}

// Función principal para dibujar el grid 3D de referencia
export function drawReferenceGrid3D(cadSystem) {
    if (!window.babylonScene || !cadSystem?.referenceGrid) return;

    // Verificar si el grid ya existe para no duplicarlo
    if (cadSystem.grid3DDrawn) return;

    const grid = cadSystem.referenceGrid;
    const xPositions = grid.xPositions;
    const yPositions = grid.yPositions;

    if (!xPositions?.length || !yPositions?.length) return;

    console.log("🎨 Dibujando grid 3D de referencia:", { xPositions, yPositions, storyCount: grid.storyCount });

    // Colores para el grid de referencia
    const lineColor = new BABYLON.Color3(0.3, 0.6, 0.9);
    const axisColor = new BABYLON.Color3(1, 0.4, 0.4);
    const textColor = new BABYLON.Color3(0.7, 0.8, 1);

    const groundLevel = -0.05;

    // ========== LÍNEAS DEL SUELO ==========
    yPositions.forEach((z, idx) => {
        const points = [];
        xPositions.forEach((x) => {
            points.push(new BABYLON.Vector3(x, groundLevel, z));
        });
        const lines = BABYLON.MeshBuilder.CreateLines(`ref_ground_x_${idx}`, { points }, window.babylonScene);
        const mat = new BABYLON.StandardMaterial(`ref_ground_x_mat_${idx}`, window.babylonScene);
        mat.diffuseColor = lineColor;
        mat.alpha = 0.5;
        lines.material = mat;
        if (!window.babylonElements) window.babylonElements = [];
        window.babylonElements.push(lines);
    });

    xPositions.forEach((x, idx) => {
        const points = [];
        yPositions.forEach((z) => {
            points.push(new BABYLON.Vector3(x, groundLevel, z));
        });
        const lines = BABYLON.MeshBuilder.CreateLines(`ref_ground_z_${idx}`, { points }, window.babylonScene);
        const mat = new BABYLON.StandardMaterial(`ref_ground_z_mat_${idx}`, window.babylonScene);
        mat.diffuseColor = lineColor;
        mat.alpha = 0.5;
        lines.material = mat;
        window.babylonElements.push(lines);
    });

    // ========== LÍNEAS DE PISOS ==========
    for (let floor = 1; floor <= grid.storyCount; floor++) {
        const y = floor * grid.storyHeight;
        const alpha = 0.35;

        yPositions.forEach((z, idx) => {
            const points = [];
            xPositions.forEach((x) => {
                points.push(new BABYLON.Vector3(x, y, z));
            });
            const lines = BABYLON.MeshBuilder.CreateLines(`ref_floor_${floor}_x_${idx}`, { points }, window.babylonScene);
            const mat = new BABYLON.StandardMaterial(`ref_floor_${floor}_x_mat_${idx}`, window.babylonScene);
            mat.diffuseColor = lineColor;
            mat.alpha = alpha;
            lines.material = mat;
            window.babylonElements.push(lines);
        });

        xPositions.forEach((x, idx) => {
            const points = [];
            yPositions.forEach((z) => {
                points.push(new BABYLON.Vector3(x, y, z));
            });
            const lines = BABYLON.MeshBuilder.CreateLines(`ref_floor_${floor}_z_${idx}`, { points }, window.babylonScene);
            const mat = new BABYLON.StandardMaterial(`ref_floor_${floor}_z_mat_${idx}`, window.babylonScene);
            mat.diffuseColor = lineColor;
            mat.alpha = alpha;
            lines.material = mat;
            window.babylonElements.push(lines);
        });
    }

    // ========== EJES PRINCIPALES ==========
    const maxX = Math.max(...xPositions);
    const minX = Math.min(...xPositions);
    const maxY = Math.max(...yPositions);

    const xAxisPoints = [new BABYLON.Vector3(minX - 1, 0, 0), new BABYLON.Vector3(maxX + 1, 0, 0)];
    const xAxisLine = BABYLON.MeshBuilder.CreateLines("ref_x_axis", { points: xAxisPoints }, window.babylonScene);
    const xAxisMat = new BABYLON.StandardMaterial("ref_x_axis_mat", window.babylonScene);
    xAxisMat.diffuseColor = axisColor;
    xAxisLine.material = xAxisMat;
    window.babylonElements.push(xAxisLine);

    const zAxisPoints = [new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, maxY + 1)];
    const zAxisLine = BABYLON.MeshBuilder.CreateLines("ref_z_axis", { points: zAxisPoints }, window.babylonScene);
    const zAxisMat = new BABYLON.StandardMaterial("ref_z_axis_mat", window.babylonScene);
    zAxisMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 1);
    zAxisLine.material = zAxisMat;
    window.babylonElements.push(zAxisLine);

    const yAxisPoints = [
        new BABYLON.Vector3(0, -0.5, 0),
        new BABYLON.Vector3(0, grid.storyCount * grid.storyHeight + 1, 0),
    ];
    const yAxisLine = BABYLON.MeshBuilder.CreateLines("ref_y_axis", { points: yAxisPoints }, window.babylonScene);
    const yAxisMat = new BABYLON.StandardMaterial("ref_y_axis_mat", window.babylonScene);
    yAxisMat.diffuseColor = new BABYLON.Color3(0.3, 1, 0.3);
    yAxisLine.material = yAxisMat;
    window.babylonElements.push(yAxisLine);

    // ========== ETIQUETAS ==========
    const xLabel = createSimpleAxisLabel("X", new BABYLON.Color3(1, 0.4, 0.4), window.babylonScene);
    if (xLabel) {
        xLabel.position = new BABYLON.Vector3(maxX + 1.2, -0.3, 0);
        window.babylonElements.push(xLabel);
    }

    const zLabel = createSimpleAxisLabel("Z", new BABYLON.Color3(0.3, 0.3, 1), window.babylonScene);
    if (zLabel) {
        zLabel.position = new BABYLON.Vector3(0, -0.3, maxY + 1.2);
        window.babylonElements.push(zLabel);
    }

    const yLabel = createSimpleAxisLabel("Y", new BABYLON.Color3(0.3, 1, 0.3), window.babylonScene);
    if (yLabel) {
        yLabel.position = new BABYLON.Vector3(-0.5, grid.storyCount * grid.storyHeight + 1, -0.5);
        window.babylonElements.push(yLabel);
    }

    // Etiquetas X (A, B, C...)
    const xLabels = grid.xLabels;
    if (xLabels) {
        xPositions.forEach((x, idx) => {
            if (xLabels[idx]) {
                const text = createSimpleAxisLabel(xLabels[idx], new BABYLON.Color3(0.5, 0.8, 1), window.babylonScene);
                if (text) {
                    text.position = new BABYLON.Vector3(x, -0.4, -0.8);
                    window.babylonElements.push(text);
                }
            }
        });
    }

    // Etiquetas Y (1, 2, 3...)
    const yLabels = grid.yLabels;
    if (yLabels) {
        yPositions.forEach((z, idx) => {
            const text = createSimpleAxisLabel(yLabels[idx].toString(), new BABYLON.Color3(0.5, 0.8, 1), window.babylonScene);
            if (text) {
                text.position = new BABYLON.Vector3(-0.8, -0.4, z);
                window.babylonElements.push(text);
            }
        });
    }

    // Etiquetas de pisos
    for (let floor = 1; floor <= grid.storyCount; floor++) {
        const y = floor * grid.storyHeight;
        const text = createSimpleAxisLabel(`P${floor}`, new BABYLON.Color3(0.7, 0.9, 0.5), window.babylonScene);
        if (text) {
            text.position = new BABYLON.Vector3(maxX + 0.8, y, -0.5);
            window.babylonElements.push(text);
        }
    }

    cadSystem.grid3DDrawn = true;
    console.log(`✅ Grid 3D de referencia: ${xPositions.length}x${yPositions.length}, ${grid.storyCount} pisos`);
}

// Función para limpiar el grid 3D
export function clearReferenceGrid3D() {
    if (!window.babylonElements) return;
    
    const toRemove = window.babylonElements.filter(el => {
        return el?.name?.startsWith('ref_') || 
               el?.name?.startsWith('label_') ||
               el?.name?.startsWith('labelPlane_');
    });
    
    toRemove.forEach(el => {
        if (el?.dispose) el.dispose();
    });
    
    window.babylonElements = window.babylonElements.filter(el => {
        return !(el?.name?.startsWith('ref_') || 
                 el?.name?.startsWith('label_') ||
                 el?.name?.startsWith('labelPlane_'));
    });
}

// Función para crear el grid base (suelo, paredes)
export function createFull3DGrid(scene) {
    if (!scene) return;
    
    console.log("📏 Creando grid 3D base - Plano XZ (suelo), Y = altura");

    const gridSize = 20;
    const divisions = 20;
    const spacing = gridSize / divisions;

    const mainLineColor = new BABYLON.Color3(0.35, 0.55, 0.85);
    const minorLineColor = new BABYLON.Color3(0.25, 0.4, 0.6);
    const gridAlpha = 0.4;

    // SUELO: PLANO XZ
    for (let i = 0; i <= divisions; i++) {
        const pos = -gridSize / 2 + i * spacing;
        const isMajor = i % 2 === 0;
        const lineColor = isMajor ? mainLineColor : minorLineColor;
        const alpha = isMajor ? gridAlpha : gridAlpha * 0.6;

        const xLinePoints = [new BABYLON.Vector3(-gridSize / 2, 0, pos), new BABYLON.Vector3(gridSize / 2, 0, pos)];
        const xLine = BABYLON.MeshBuilder.CreateLines(`base_gridXZ_X_${i}`, { points: xLinePoints }, scene);
        const xMat = new BABYLON.StandardMaterial(`base_gridXZ_X_Mat_${i}`, scene);
        xMat.diffuseColor = lineColor;
        xMat.alpha = alpha;
        xLine.material = xMat;

        const zLinePoints = [new BABYLON.Vector3(pos, 0, -gridSize / 2), new BABYLON.Vector3(pos, 0, gridSize / 2)];
        const zLine = BABYLON.MeshBuilder.CreateLines(`base_gridXZ_Z_${i}`, { points: zLinePoints }, scene);
        const zMat = new BABYLON.StandardMaterial(`base_gridXZ_Z_Mat_${i}`, scene);
        zMat.diffuseColor = lineColor;
        zMat.alpha = alpha;
        zLine.material = zMat;
        
        if (!window.babylonElements) window.babylonElements = [];
        window.babylonElements.push(xLine, zLine);
    }

    // EJES PRINCIPALES
    const xAxisPoints = [new BABYLON.Vector3(-gridSize / 2, 0, 0), new BABYLON.Vector3(gridSize / 2, 0, 0)];
    const xAxisLine = BABYLON.MeshBuilder.CreateLines("base_xAxisMain", { points: xAxisPoints }, scene);
    const xAxisMat = new BABYLON.StandardMaterial("base_xAxisMat", scene);
    xAxisMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    xAxisMat.alpha = 0.9;
    xAxisLine.material = xAxisMat;
    window.babylonElements.push(xAxisLine);

    const zAxisPoints = [new BABYLON.Vector3(0, -gridSize / 2, 0), new BABYLON.Vector3(0, gridSize / 2, 0)];
    const zAxisLine = BABYLON.MeshBuilder.CreateLines("base_zAxisMain", { points: zAxisPoints }, scene);
    const zAxisMat = new BABYLON.StandardMaterial("base_zAxisMat", scene);
    zAxisMat.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2);
    zAxisMat.alpha = 0.9;
    zAxisLine.material = zAxisMat;
    window.babylonElements.push(zAxisLine);

    const yAxisPoints = [new BABYLON.Vector3(0, 0, -gridSize / 2), new BABYLON.Vector3(0, 0, gridSize / 2)];
    const yAxisLine = BABYLON.MeshBuilder.CreateLines("base_yAxisMain", { points: yAxisPoints }, scene);
    const yAxisMat = new BABYLON.StandardMaterial("base_yAxisMat", scene);
    yAxisMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 1);
    yAxisMat.alpha = 0.9;
    yAxisLine.material = yAxisMat;
    window.babylonElements.push(yAxisLine);

    // Etiquetas de ejes
    const xLabel = createSimpleAxisLabel("X", new BABYLON.Color3(1, 0.3, 0.3), scene);
    if (xLabel) {
        xLabel.position = new BABYLON.Vector3(gridSize / 2 + 0.6, -0.3, 0);
        window.babylonElements.push(xLabel);
    }

    const zLabel = createSimpleAxisLabel("Z", new BABYLON.Color3(0.3, 1, 0.3), scene);
    if (zLabel) {
        zLabel.position = new BABYLON.Vector3(-0.3, gridSize / 2 + 0.6, 0);
        window.babylonElements.push(zLabel);
    }

    const yLabel = createSimpleAxisLabel("Y", new BABYLON.Color3(0.3, 0.3, 1), scene);
    if (yLabel) {
        yLabel.position = new BABYLON.Vector3(0, -0.3, gridSize / 2 + 0.6);
        window.babylonElements.push(yLabel);
    }

    console.log("✅ Grid 3D base creado");
}

// Función para sincronizar el grid (llamada cuando cambia la vista)
export function syncGrid3D(cadSystem) {
    if (!cadSystem) return;
    
    if (cadSystem.grid3DDrawn && window.babylonScene && cadSystem.referenceGrid) {
        clearReferenceGrid3D();
        drawReferenceGrid3D(cadSystem);
    }
}