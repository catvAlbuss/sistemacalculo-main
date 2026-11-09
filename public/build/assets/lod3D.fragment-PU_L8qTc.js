import{S as r,N as t}from"./analisis_estructural_de_armaduras-DaXtVWSt.js";import"./livewire.esm-BwfLLVY7.js";import"./sweetalert2.esm.all-0Z_61IYw.js";import"./preload-helper-BfFHrpNk.js";import"./color_scale-BGSv3LvJ.js";import"./mat4js.read-Dg9kvXpe.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./zapatas2Core-XufHv6tW.js";import"./pressureMap-B8RtmfVq.js";import"./plotTheme-zW9Nz4dg.js";import"./deflectionCalculator-BFw1L2Wc.js";import"./engineError-CU3s0yX4.js";import"./html2canvas.esm-5Cw11iw4.js";import"./rizabalasociados-BgyDGUXy.js";import"./ubigeo-Cak7qga5.js";const o="lod3DPixelShader",i=`precision highp float;precision highp sampler3D;
#ifndef USE_EXACT_SRGB_CONVERSIONS
#define USE_EXACT_SRGB_CONVERSIONS
#endif
#include<helperFunctions>
varying vec2 vUV;uniform sampler3D textureSampler;uniform float lod;uniform float slice;uniform int gamma; 
void main(void)
{ivec3 textureCoordinates=ivec3(vUV*vec2(textureSize(textureSampler,0).xy),int(slice));gl_FragColor=texelFetch(textureSampler,textureCoordinates,int(lod));if (gamma==0) {gl_FragColor.rgb=pow(gl_FragColor.rgb,vec3(GammaEncodePowerApprox));} else if (gamma==2) {gl_FragColor.rgb=toGammaSpaceExact(gl_FragColor.rgb);}}
`;r.ShadersStore[o]||(r.ShadersStore[o]=i);const a=[t];for(const e of a)r.IncludesShadersStore[e.name]||(r.IncludesShadersStore[e.name]=e.shader);const v={name:o,shader:i};export{v as lod3DPixelShader};
