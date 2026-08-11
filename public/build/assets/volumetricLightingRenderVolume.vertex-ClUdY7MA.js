import{S as t}from"./analisis_estructural_de_armaduras-DtkCWcOo.js";import"./livewire.esm-CO6ZehnT.js";import"./predimensionamiento-CxryAhEz.js";import"./preload-helper-BfFHrpNk.js";import"./color_scale-BGSv3LvJ.js";import"./zapatas2Core-CNeTvPye.js";import"./mat4js.read-CN22nOIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./deflectionCalculator-DCKf5BFK.js";import"./ubigeo-Cak7qga5.js";const e="volumetricLightingRenderVolumeVertexShader",o=`#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute position : vec3f;varying vWorldPos: vec4f;@vertex
fn main(input : VertexInputs)->FragmentInputs {let worldPos=mesh.world*vec4f(vertexInputs.position,1.0);vertexOutputs.vWorldPos=worldPos;vertexOutputs.position=scene.viewProjection*worldPos;}
`;t.ShadersStoreWGSL[e]||(t.ShadersStoreWGSL[e]=o);const v={name:e,shader:o};export{v as volumetricLightingRenderVolumeVertexShaderWGSL};
