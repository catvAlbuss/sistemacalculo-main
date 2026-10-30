import{S as e,N as t}from"./analisis_estructural_de_armaduras-CLmkH75c.js";import"./livewire.esm-BwfLLVY7.js";import"./analisisEstructural-0Z_61IYw.js";import"./preload-helper-BfFHrpNk.js";import"./color_scale-BGSv3LvJ.js";import"./zapatas2Core-DzAejvGH.js";import"./plotly.min-COokRvoC.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./deflectionCalculator-BFw1L2Wc.js";import"./engineError-CU3s0yX4.js";import"./html2canvas.esm-5Cw11iw4.js";import"./rizabalasociados-BgyDGUXy.js";import"./ubigeo-Cak7qga5.js";const o="lod3DPixelShader",i=`precision highp float;precision highp sampler3D;
#ifndef USE_EXACT_SRGB_CONVERSIONS
#define USE_EXACT_SRGB_CONVERSIONS
#endif
#include<helperFunctions>
varying vec2 vUV;uniform sampler3D textureSampler;uniform float lod;uniform float slice;uniform int gamma; 
void main(void)
{ivec3 textureCoordinates=ivec3(vUV*vec2(textureSize(textureSampler,0).xy),int(slice));gl_FragColor=texelFetch(textureSampler,textureCoordinates,int(lod));if (gamma==0) {gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(GammaEncodePowerApprox));} else if (gamma==2) {gl_FragColor.rgb=toGammaSpaceExact(gl_FragColor.rgb);}}
`;e.ShadersStore[o]||(e.ShadersStore[o]=i);const a=[t];for(const r of a)e.IncludesShadersStore[r.name]||(e.IncludesShadersStore[r.name]=r.shader);const C={name:o,shader:i};export{C as lod3DPixelShader};
