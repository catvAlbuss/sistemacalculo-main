import * as BABYLON from "@babylonjs/core";

export class DeflectionAnimator {
  constructor(scene, originalPositions, deformedPositions, frames = 60, duration = 2000) {
    this.scene = scene;
    this.originalPositions = originalPositions;
    this.deformedPositions = deformedPositions;
    this.frames = frames;
    this.duration = duration;
    this.currentFrame = 0;
    this.animating = false;
    this.onFrame = null;
    this.onComplete = null;
    this.loop = false;
    this.direction = 1;
    this.easing = "cubicOut";
  }

  setLoop(loop) {
    this.loop = loop;
    return this;
  }

  setEasing(easing) {
    this.easing = easing;
    return this;
  }

  setDirection(direction) {
    this.direction = direction;
    return this;
  }

  start(onFrameCallback, onCompleteCallback = null) {
    if (this.animating) return;
    this.animating = true;
    this.currentFrame = 0;
    this.onFrame = onFrameCallback;
    this.onComplete = onCompleteCallback;
    this.lastTimestamp = performance.now();
    this.animateLoop();
  }

  stop() {
    this.animating = false;
    this.onFrame = null;
    this.onComplete = null;
  }

  reset() {
    this.currentFrame = 0;
    if (this.onFrame) this.onFrame(0);
  }

  getEasedValue(progress) {
    const easingFunctions = {
      linear: (p) => p,
      cubicIn: (p) => p * p * p,
      cubicOut: (p) => 1 - Math.pow(1 - p, 3),
      cubicInOut: (p) => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
      sineOut: (p) => Math.sin((p * Math.PI) / 2),
      elasticOut: (p) => {
        const c4 = (2 * Math.PI) / 3;
        return p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
      }
    };
    const fn = easingFunctions[this.easing] || easingFunctions.cubicOut;
    let t = fn(progress);
    if (this.direction === -1) t = 1 - t;
    return t;
  }

  animateLoop() {
    if (!this.animating) return;

    const now = performance.now();
    const elapsed = now - this.lastTimestamp;
    const step = this.duration / this.frames;

    if (elapsed >= step) {
      this.currentFrame++;
      const progress = Math.min(1, this.currentFrame / this.frames);
      const easedProgress = this.getEasedValue(progress);
      
      if (this.onFrame) this.onFrame(easedProgress);
      this.lastTimestamp = now;
    }

    if (this.currentFrame <= this.frames) {
      requestAnimationFrame(() => this.animateLoop());
    } else {
      if (this.loop) {
        this.direction *= -1;
        this.currentFrame = 0;
        this.lastTimestamp = performance.now();
        requestAnimationFrame(() => this.animateLoop());
      } else {
        this.animating = false;
        if (this.onComplete) this.onComplete();
      }
    }
  }
}

export class AnimationManager {
  constructor() {
    this.activeAnimations = new Map();
  }

  add(id, animator) {
    this.activeAnimations.set(id, animator);
    return this;
  }

  stop(id) {
    const animator = this.activeAnimations.get(id);
    if (animator) {
      animator.stop();
      this.activeAnimations.delete(id);
    }
  }

  stopAll() {
    this.activeAnimations.forEach((animator, animId) => {
      animator.stop();
    });
    this.activeAnimations.clear();
  }

  isActive(id) {
    const animator = this.activeAnimations.get(id);
    return animator ? animator.animating : false;
  }
}