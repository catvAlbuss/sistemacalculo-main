<<<<<<<< HEAD:public/build/assets/oitFinalSimpleBlend.fragment-BSYPe4ue.js
import{S as o}from"./analisis_estructural_de_armaduras-IcJOIdMp.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./predimensionamiento-CxryAhEz.js";const r="oitFinalSimpleBlendPixelShader",t=`var uFrontColor: texture_2d<f32>;@fragment
========
import{S as o}from"./analisis_estructural_de_armaduras-MifHR-Uw.js";import"./preload-helper-BfFHrpNk.js";import"./mat4js.read-DcrXhSIi.js";import"./_commonjsHelpers-_d1bhYXs.js";import"./___vite-browser-external_commonjs-proxy-BQ48sp8I.js";import"./predimensionamiento-CxryAhEz.js";const r="oitFinalSimpleBlendPixelShader",t=`var uFrontColor: texture_2d<f32>;@fragment
>>>>>>>> origin/mayk:public/build/assets/oitFinalSimpleBlend.fragment-C9Wv0iEO.js
fn main(input: FragmentInputs)->FragmentOutputs {var fragCoord: vec2i=vec2i(fragmentInputs.position.xy);var frontColor: vec4f=textureLoad(uFrontColor,fragCoord,0);fragmentOutputs.color=frontColor;}
`;o.ShadersStoreWGSL[r]||(o.ShadersStoreWGSL[r]=t);const S={name:r,shader:t};export{S as oitFinalSimpleBlendPixelShaderWGSL};
