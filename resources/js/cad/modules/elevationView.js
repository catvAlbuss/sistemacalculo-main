// resources/js/cad/modules/elevationView.js

import * as BABYLON from "@babylonjs/core";

export class ElevationViewManager {
  constructor(cadSystem) {
    this.cadSystem = cadSystem;
    this.current2DView = "plan"; // 'plan', 'elevation-xz', 'elevation-yz'
    this.currentElevation = "1";
    this.currentElevationType = "number";
    this.highlightedPlane = null;
  }

  openElevationModal() {
    window.dispatchEvent(new CustomEvent("open-elevation-modal"));
  }

  // setElevationView(elevation, type) {
  //   console.log(`📐 Cambiando a vista: ${type} - ${elevation}`);

  //   this.currentElevation = elevation;
  //   this.currentElevationType = type;

  //   if (type === 'number') {
  //     this.current2DView = 'elevation-xz';
  //     this.cadSystem.showMessage(`📐 Vista X-Z (Elevación ${elevation})`);
  //   } else {
  //     this.current2DView = 'elevation-yz';
  //     this.cadSystem.showMessage(`📐 Vista Y-Z (Elevación ${elevation})`);
  //   }

  //   // Resaltar el plano en 3D
  //   this.highlightElevationPlane(elevation, type);

  //   // Forzar redibujado completo de la vista 2D
  //   this.cadSystem.redraw();

  //   // Actualizar vista 3D si está activa
  //   if (this.cadSystem.show3DView && window.babylonInitialized) {
  //     this.cadSystem.sync3D();
  //   }
  // }

  setElevationView(elevation, type) {
    console.log(`📐 Cambiando a vista: ${type} - ${elevation}`);

    this.currentElevation = elevation;
    this.currentElevationType = type;

    if (type === "number") {
      // Ejes numéricos (1,2,3...) → Vista X-Y (alzado frontal)
      this.current2DView = "elevation-xy";
      this.cadSystem.showMessage(`📐 Vista X-Y (Eje ${elevation}) - Altura vs Horizontal`);
    } else {
      // Ejes por letra (A,B,C...) → Vista Z-Y (alzado lateral)
      this.current2DView = "elevation-zy";
      this.cadSystem.showMessage(`📐 Vista Z-Y (Eje ${elevation}) - Altura vs Profundidad`);
    }

    // Cambiar al estado de dibujo
    if (this.cadSystem.trussDrawingState3D) {
      this.cadSystem.setState(this.cadSystem.trussDrawingState3D);
    }

    this.highlightElevationPlane(elevation, type);
    this.cadSystem.redraw();
    this.cadSystem.sync3D();
  }

  // También añade un método para volver al modo 2D cuando se vuelve a planta
  resetToPlanView() {
    this.current2DView = "plan";
    this.currentElevation = "1";
    this.currentElevationType = "number";
    this.clearHighlight();

    // Volver al estado de dibujo 2D
    if (this.cadSystem.trussDrawingState) {
      this.cadSystem.setState(this.cadSystem.trussDrawingState);
    }

    this.cadSystem.redraw();
    this.cadSystem.showMessage("📐 Vista PLANTA X-Z (BASE)");
  }

  highlightElevationPlane(elevation, type) {
    if (!window.babylonScene || !this.cadSystem.referenceGrid) return;

    this.clearHighlight();

    const grid = this.cadSystem.referenceGrid;
    const xPositions = grid.xPositions;
    const zPositions = grid.yPositions;
    const planeColor = new BABYLON.Color3(0.3, 0.8, 1); // Celeste
    const totalHeight = grid.storyCount * grid.storyHeight;

    if (type === "number") {
      const index = parseInt(elevation) - 1;
      if (index >= 0 && index < xPositions.length) {
        this.createXPlane(xPositions[index], zPositions, totalHeight, planeColor, elevation);
      }
    } else {
      const letterIndex = grid.xLabels.indexOf(elevation);
      if (letterIndex >= 0 && letterIndex < zPositions.length) {
        this.createZPlane(zPositions[letterIndex], xPositions, totalHeight, planeColor, elevation);
      }
    }
  }

  createXPlane(x, zPositions, height, color, elevation) {
    const minZ = Math.min(...zPositions);
    const maxZ = Math.max(...zPositions);

    // Plano semitransparente
    const plane = BABYLON.MeshBuilder.CreatePlane(
      `highlight_plane_${elevation}`,
      {
        width: maxZ - minZ,
        height: height,
      },
      window.babylonScene,
    );
    plane.position = new BABYLON.Vector3(x, height / 2, 0);
    plane.rotation.y = Math.PI / 2;

    const mat = new BABYLON.StandardMaterial(`highlight_mat_${elevation}`, window.babylonScene);
    mat.diffuseColor = color;
    mat.alpha = 0.3;
    plane.material = mat;

    // Borde del plano
    const outline = BABYLON.MeshBuilder.CreateLines(
      `highlight_outline_${elevation}`,
      {
        points: [
          new BABYLON.Vector3(x, 0, minZ),
          new BABYLON.Vector3(x, height, minZ),
          new BABYLON.Vector3(x, height, maxZ),
          new BABYLON.Vector3(x, 0, maxZ),
          new BABYLON.Vector3(x, 0, minZ),
        ],
      },
      window.babylonScene,
    );
    outline.material = mat;

    window.babylonElements.push(plane, outline);
    this.highlightedPlane = { plane, outline };
  }

  createZPlane(z, xPositions, height, color, elevation) {
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);

    const plane = BABYLON.MeshBuilder.CreatePlane(
      `highlight_plane_${elevation}`,
      {
        width: maxX - minX,
        height: height,
      },
      window.babylonScene,
    );
    plane.position = new BABYLON.Vector3(0, height / 2, z);

    const mat = new BABYLON.StandardMaterial(`highlight_mat_${elevation}`, window.babylonScene);
    mat.diffuseColor = color;
    mat.alpha = 0.3;
    plane.material = mat;

    const outline = BABYLON.MeshBuilder.CreateLines(
      `highlight_outline_${elevation}`,
      {
        points: [
          new BABYLON.Vector3(minX, 0, z),
          new BABYLON.Vector3(minX, height, z),
          new BABYLON.Vector3(maxX, height, z),
          new BABYLON.Vector3(maxX, 0, z),
          new BABYLON.Vector3(minX, 0, z),
        ],
      },
      window.babylonScene,
    );
    outline.material = mat;

    window.babylonElements.push(plane, outline);
    this.highlightedPlane = { plane, outline };
  }

  clearHighlight() {
    if (this.highlightedPlane) {
      if (this.highlightedPlane.plane?.dispose) this.highlightedPlane.plane.dispose();
      if (this.highlightedPlane.outline?.dispose) this.highlightedPlane.outline.dispose();
      this.highlightedPlane = null;
    }
  }

  // get2DProjection(point) {
  //   if (this.current2DView === "plan") {
  //     return { x: point.x, y: point.y };
  //   } else if (this.current2DView === "elevation-xz") {
  //     // Vista X-Z: X horizontal, Z vertical (altura)
  //     return { x: point.x, y: point.z || 0 };
  //   } else {
  //     // Vista Y-Z: Y horizontal, Z vertical (altura)
  //     return { x: point.y, y: point.z || 0 };
  //   }
  // }

  // SE AGREGO NUEVAS FUNCIONES PARA OBTENER LAS COORDENADAS ACTUALES DE ELEVACIÓN SEGÚN LA VISTA ACTIVA
  getCurrentZ() {
    if (this.current2DView === "plan" && this.cadSystem.currentStory && this.cadSystem.stories) {
      const story = this.cadSystem.stories.find((s) => s.name === this.cadSystem.currentStory);
      if (story) return story.z;
    }
    return 0;
  }

  getCurrentElevationY() {
    if (this.current2DView === "elevation-xy") {
      const idx = parseInt(this.currentElevation) - 1;
      if (this.cadSystem.referenceGrid && idx >= 0 && idx < this.cadSystem.referenceGrid.xPositions.length) {
        return this.cadSystem.referenceGrid.xPositions[idx];
      }
    }
    return 0;
  }

  getCurrentElevationX() {
    if (this.current2DView === "elevation-zy") {
      const idx = this.cadSystem.referenceGrid?.xLabels.indexOf(this.currentElevation);
      if (idx >= 0 && idx < this.cadSystem.referenceGrid?.yPositions.length) {
        return this.cadSystem.referenceGrid.yPositions[idx];
      }
    }
    return 0;
  }

  resetView() {
    this.current2DView = "plan";
    this.clearHighlight();
    this.cadSystem.redraw();
  }
}
