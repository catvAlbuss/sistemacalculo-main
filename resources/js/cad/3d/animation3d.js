import * as BABYLON from "@babylonjs/core";

export class DeflectionAnimation {
  constructor(scene, originalPositions, deformedPositions, frames = 60, duration = 2000) {
    this.scente = scene;
    this.originalPositions = originalPositions; //Array de vector3 (posiciones originales)
    this.deformedPositions = deformedPositions; //Array de vector3 (posiciones deformadas finales)
    this.frames = frames;
    this.duration = duration;
    this.currentFrame = 0;
    this.animating = false;
    this.onFrame = null;
  }

  //===================================================
  // Método para iniciar la animación
  //===================================================
  start(onFrameCallBack) {
    if (this.animating) return;
    this.animating = true;
    this.currentFrame = 0;
    this.onFrame = onFrameCallBack;
    this.lastTimesStamp = performance.now();
    this.animateLoop();
  }

  stop() {
    this.animating = false;
    this.onFrame = null;
  }

  //===================================================
  // Método de animación con easing (suavizado)
  //===================================================
  animateLoop() {
    if (!this.animating) return;

    const now = performance.now();
    const elapsed = now - this.lastTimesStamp;
    const step = this.duration / this.frames;
    if (elapsed >= step) {
      this.currentFrame++;
      const t = Math.min(1, this.currentFrame / this.frames);
      const eased = 1 - Math.pow(1 - t, 3); // Ease out cubic
      if (this.onFrame) this.onFrame(eased);
      this.lastTimesStamp = now;
    }
    if (this.currentFrame <= this.frames) {
      requestAnimationFrame(() => this.animateLoop());
    } else {
      this.animating = false;
      if (this.onFrame) this.onFrame(1);
    }
  }
}
