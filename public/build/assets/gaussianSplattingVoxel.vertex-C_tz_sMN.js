import{S as t,s as i,i as o,q as s,r as n}from"./analisis_estructural_de_armaduras-CLmkH75c.js";import"./livewire.esm-BwfLLVY7.js";import"./analisisEstructural-0Z_61IYw.js";import"./preload-helper-BfFHrpNk.js";import"./color_scale-BGSv3LvJ.js";import"./zapatas2Core-DzAejvGH.js";import"./plotly.min-COokRvoC.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./deflectionCalculator-BFw1L2Wc.js";import"./engineError-CU3s0yX4.js";import"./html2canvas.esm-5Cw11iw4.js";import"./rizabalasociados-BgyDGUXy.js";import"./ubigeo-Cak7qga5.js";const r="gaussianSplattingVoxelVertexShader",a=`#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute splatIndex0: vec4f;attribute splatIndex1: vec4f;attribute splatIndex2: vec4f;attribute splatIndex3: vec4f;attribute position: vec3f;uniform dataTextureSize: vec2f;uniform alpha: f32;uniform invWorldScale: mat4x4f;uniform viewMatrix: mat4x4f;
#if IS_COMPOUND
uniform partWorld: array<mat4x4<f32>,MAX_PART_COUNT>;uniform partVisibility: array<f32,MAX_PART_COUNT>;
#endif
var rotationsATexture: texture_2d<f32>;var rotationsBTexture: texture_2d<f32>;var rotationScaleTexture: texture_2d<f32>;var centersTexture: texture_2d<f32>;var colorsTexture: texture_2d<f32>;
#if IS_COMPOUND
var partIndicesTexture: texture_2d<f32>;
#endif
varying vNormalizedPosition: vec3f;varying vNormalizedCenterPosition: vec3f;varying vAlpha: f32;varying vPatchPosition: vec2f;
#include<gaussianSplatting>
@vertex
fn main(input: VertexInputs)->FragmentInputs {let splatIndex: f32=getSplatIndex(
i32(vertexInputs.position.z+0.5),
vertexInputs.splatIndex0,vertexInputs.splatIndex1,
vertexInputs.splatIndex2,vertexInputs.splatIndex3
);var splat: Splat=readSplat(splatIndex,uniforms.dataTextureSize);
#if IS_COMPOUND
if (uniforms.partVisibility[splat.partIndex]==0.0) {vertexOutputs.position=vec4f(2.0,2.0,2.0,1.0);return vertexOutputs;}
let splatWorld: mat4x4f=getPartWorld(splat.partIndex);
#else
let splatWorld: mat4x4f=mesh.world;
#endif
let quadPos: vec2f=vertexInputs.position.xy;let worldPos: vec4f=computeVoxelSplatWorldPos(splat.rotationA,splat.rotationB,splat.rotationScale,splat.center.xyz,splatWorld,uniforms.viewMatrix,uniforms.invWorldScale,quadPos);vertexOutputs.vNormalizedPosition=(uniforms.invWorldScale*worldPos).xyz*0.5+0.5;let clipPos: vec4f=uniforms.viewMatrix*uniforms.invWorldScale*worldPos;vertexOutputs.position=vec4f(clipPos.x,clipPos.y,clipPos.z*0.5+0.5,1.0);vertexOutputs.vNormalizedCenterPosition=(uniforms.invWorldScale*splatWorld*vec4f(splat.center.xyz,1.0)).xyz*0.5+0.5;vertexOutputs.vAlpha=splat.color.w*uniforms.alpha;
#if IS_COMPOUND
vertexOutputs.vAlpha*=uniforms.partVisibility[splat.partIndex];
#endif
vertexOutputs.vPatchPosition=quadPos;}
`;t.ShadersStoreWGSL[r]||(t.ShadersStoreWGSL[r]=a);const l=[i,o,s,n];for(const e of l)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);const O={name:r,shader:a};export{O as gaussianSplattingVoxelVertexShaderWGSL};
