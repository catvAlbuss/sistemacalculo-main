<<<<<<<< HEAD:public/build/assets/selection.fragment-DNYiZIDY.js
import{S as i}from"./analisis_estructural_de_armaduras-C7RXyntu.js";import"./predimensionamiento-CxryAhEz.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";const e="selectionPixelShader",d=`#ifdef INSTANCES
========
import{S as i}from"./analisis_estructural_de_armaduras-CX2mi5p2.js";import"./livewire.esm-CO6ZehnT.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./predimensionamiento-CxryAhEz.js";const e="selectionPixelShader",o=`#ifdef INSTANCES
>>>>>>>> fa7af0d5a017e5adae3bf7762d83e92290946653:public/build/assets/selection.fragment-BiPy4tjh.js
flat varying float vSelectionId;
#else
uniform float selectionId;
#endif
#ifdef STORE_CAMERASPACE_Z
varying float vViewPosZ;
#else
varying float vDepthMetric;
#endif
#ifdef ALPHATEST
varying vec2 vUV;uniform sampler2D diffuseSampler;
#endif
#include<clipPlaneFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
#ifdef ALPHATEST
if (texture2D(diffuseSampler,vUV).a<0.4)
discard;
#endif
#ifdef INSTANCES
float id=vSelectionId;
#else
float id=selectionId;
#endif
#ifdef STORE_CAMERASPACE_Z
gl_FragColor=vec4(id,vViewPosZ,0.0,1.0);
#else
gl_FragColor=vec4(id,vDepthMetric,0.0,1.0);
#endif
#define CUSTOM_FRAGMENT_MAIN_END
}
`;i.ShadersStore[e]||(i.ShadersStore[e]=o);const S={name:e,shader:o};export{S as selectionPixelShader};
