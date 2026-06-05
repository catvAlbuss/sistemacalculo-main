import{S as o}from"./analisis_estructural_de_armaduras-CX2mi5p2.js";import"./livewire.esm-CO6ZehnT.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./predimensionamiento-CxryAhEz.js";const e="volumetricLightingRenderVolumeVertexShader",r=`#include<__decl__sceneVertex>
#include<__decl__meshVertex>
attribute vec3 position;varying vec4 vWorldPos;void main(void) {vec4 worldPos=world*vec4(position,1.0);vWorldPos=worldPos;gl_Position=viewProjection*worldPos;}
`;o.ShadersStore[e]||(o.ShadersStore[e]=r);const m={name:e,shader:r};export{m as volumetricLightingRenderVolumeVertexShader};
