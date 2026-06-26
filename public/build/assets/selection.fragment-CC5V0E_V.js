<<<<<<<< HEAD:public/build/assets/selection.fragment-D0OzBdtn.js
import{S as i}from"./analisis_estructural_de_armaduras-C7RXyntu.js";import"./predimensionamiento-CxryAhEz.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";const e="selectionPixelShader",r=`#ifdef INSTANCES
========
import{S as i}from"./analisis_estructural_de_armaduras-CX2mi5p2.js";import"./livewire.esm-CO6ZehnT.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./predimensionamiento-CxryAhEz.js";const e="selectionPixelShader",r=`#ifdef INSTANCES
>>>>>>>> fa7af0d5a017e5adae3bf7762d83e92290946653:public/build/assets/selection.fragment-CC5V0E_V.js
flat varying vSelectionId: f32;
#else
uniform selectionId: f32;
#endif
#ifdef STORE_CAMERASPACE_Z
varying vViewPosZ: f32;
#else
varying vDepthMetric: f32;
#endif
#ifdef ALPHATEST
varying vUV: vec2f;var diffuseSamplerSampler: sampler;var diffuseSampler: texture_2d<f32>;
#endif
#include<clipPlaneFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
#ifdef ALPHATEST
if (textureSample(diffuseSampler,diffuseSamplerSampler,fragmentInputs.vUV).a<0.4) {discard;}
#endif
#ifdef INSTANCES
var id: f32=fragmentInputs.vSelectionId;
#else
var id: f32=uniforms.selectionId;
#endif
#ifdef STORE_CAMERASPACE_Z
fragmentOutputs.color=vec4(id,fragmentInputs.vViewPosZ,0.0,1.0);
#else
fragmentOutputs.color=vec4(id,fragmentInputs.vDepthMetric,0.0,1.0);
#endif
#define CUSTOM_FRAGMENT_MAIN_END
}
`;i.ShadersStoreWGSL[e]||(i.ShadersStoreWGSL[e]=r);const m={name:e,shader:r};export{m as selectionPixelShaderWGSL};
