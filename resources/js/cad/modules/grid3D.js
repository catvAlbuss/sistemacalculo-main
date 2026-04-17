// resources/js/cad/modules/grid3D.js
    
import * as BABYLON from "@babylonjs/core";

export class Grid3DManager {
  constructor(cadSystem) {
    this.cadSystem = cadSystem;
    this.grid3DDrawn = false;
  }

  drawReferenceGrid3D() {
    if (!window.babylonScene || !this.cadSystem.referenceGrid) return;
    if (this.grid3DDrawn) return;
    
    const grid = this.cadSystem.referenceGrid;
    const xPositions = grid.xPositions;
    const yPositions = grid.yPositions;

    if (xPositions.length === 0 || yPositions.length === 0) return;

    const lineColor = new BABYLON.Color3(0.3, 0.6, 0.9);
    const axisColor = new BABYLON.Color3(1, 0.4, 0.4);
    const groundLevel = -0.05;

    // Líneas del suelo
    yPositions.forEach((z, idx) => {
      const points = xPositions.map(x => new BABYLON.Vector3(x, groundLevel, z));
      this.createLines(`ref_ground_x_${idx}`, points, lineColor, 0.5);
    });

    xPositions.forEach((x, idx) => {
      const points = yPositions.map(z => new BABYLON.Vector3(x, groundLevel, z));
      this.createLines(`ref_ground_z_${idx}`, points, lineColor, 0.5);
    });

    // Líneas de pisos
    for (let floor = 1; floor <= grid.storyCount; floor++) {
      const y = floor * grid.storyHeight;
      
      yPositions.forEach((z, idx) => {
        const points = xPositions.map(x => new BABYLON.Vector3(x, y, z));
        this.createLines(`ref_floor_${floor}_x_${idx}`, points, lineColor, 0.35);
      });

      xPositions.forEach((x, idx) => {
        const points = yPositions.map(z => new BABYLON.Vector3(x, y, z));
        this.createLines(`ref_floor_${floor}_z_${idx}`, points, lineColor, 0.35);
      });
    }

    // Ejes principales
    const maxX = Math.max(...xPositions);
    const minX = Math.min(...xPositions);
    const maxY = Math.max(...yPositions);
    const totalHeight = grid.storyCount * grid.storyHeight;

    this.createAxis([new BABYLON.Vector3(minX - 1, 0, 0), new BABYLON.Vector3(maxX + 1, 0, 0)], axisColor, 'ref_x_axis');
    this.createAxis([new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, maxY + 1)], new BABYLON.Color3(0.3, 0.3, 1), 'ref_z_axis');
    this.createAxis([new BABYLON.Vector3(0, -0.5, 0), new BABYLON.Vector3(0, totalHeight + 1, 0)], new BABYLON.Color3(0.3, 1, 0.3), 'ref_y_axis');

    // Etiquetas
    this.createLabels(xPositions, grid.xLabels, (x) => new BABYLON.Vector3(x, -0.4, -0.8), new BABYLON.Color3(0.5, 0.8, 1));
    this.createLabels(yPositions, grid.yLabels, (z) => new BABYLON.Vector3(-0.8, -0.4, z), new BABYLON.Color3(0.5, 0.8, 1));
    
    for (let floor = 1; floor <= grid.storyCount; floor++) {
      const y = floor * grid.storyHeight;
      const text = this.cadSystem.createSimpleAxisLabel(`P${floor}`, new BABYLON.Color3(0.7, 0.9, 0.5), window.babylonScene);
      if (text) {
        text.position = new BABYLON.Vector3(maxX + 0.8, y, -0.5);
        window.babylonElements.push(text);
      }
    }

    this.grid3DDrawn = true;
    console.log(`✅ Grid 3D: ${xPositions.length}x${yPositions.length}, ${grid.storyCount} pisos`);
  }

  createLines(name, points, color, alpha) {
    const lines = BABYLON.MeshBuilder.CreateLines(name, { points }, window.babylonScene);
    const mat = new BABYLON.StandardMaterial(`${name}_mat`, window.babylonScene);
    mat.diffuseColor = color;
    mat.alpha = alpha;
    lines.material = mat;
    window.babylonElements.push(lines);
  }

  createAxis(points, color, name) {
    const axis = BABYLON.MeshBuilder.CreateLines(name, { points }, window.babylonScene);
    const mat = new BABYLON.StandardMaterial(`${name}_mat`, window.babylonScene);
    mat.diffuseColor = color;
    axis.material = mat;
    window.babylonElements.push(axis);
  }

  createLabels(positions, labels, positionFunc, color) {
    positions.forEach((pos, idx) => {
      const text = this.cadSystem.createSimpleAxisLabel(labels[idx], color, window.babylonScene);
      if (text) {
        text.position = positionFunc(pos);
        window.babylonElements.push(text);
      }
    });
  }

  reset() {
    this.grid3DDrawn = false;
  }
}