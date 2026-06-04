import{S as t}from"./analisis_estructural_de_armaduras-CX2mi5p2.js";import"./livewire.esm-CO6ZehnT.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./predimensionamiento-CxryAhEz.js";const e="volumetricLightingRenderVolumeVertexShader",o=`#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute position : vec3f;varying vWorldPos: vec4f;@vertex
fn main(input : VertexInputs)->FragmentInputs {let worldPos=mesh.world*vec4f(vertexInputs.position,1.0);vertexOutputs.vWorldPos=worldPos;vertexOutputs.position=scene.viewProjection*worldPos;}
`;t.ShadersStoreWGSL[e]||(t.ShadersStoreWGSL[e]=o);const d={name:e,shader:o};export{d as volumetricLightingRenderVolumeVertexShaderWGSL};
