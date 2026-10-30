import{S as o}from"./analisis_estructural_de_armaduras-CLmkH75c.js";import"./livewire.esm-BwfLLVY7.js";import"./analisisEstructural-0Z_61IYw.js";import"./preload-helper-BfFHrpNk.js";import"./color_scale-BGSv3LvJ.js";import"./zapatas2Core-DzAejvGH.js";import"./plotly.min-COokRvoC.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./deflectionCalculator-BFw1L2Wc.js";import"./engineError-CU3s0yX4.js";import"./html2canvas.esm-5Cw11iw4.js";import"./rizabalasociados-BgyDGUXy.js";import"./ubigeo-Cak7qga5.js";const r="gsSortScanSumsComputeShader",t=`struct GsSortPassParams {count : u32,
numBlocks : u32,
shift : u32,
chunkCount : u32,}
@group(0) @binding(0) var<storage,read> params : GsSortPassParams;@group(0) @binding(1) var<storage,read_write> chunkSums : array<u32>;var<workgroup> sums : array<u32,256>;@compute @workgroup_size(256,1,1)
fn main(@builtin(local_invocation_id) lid : vec3u) {let t=lid.x;let v=select(0u,chunkSums[t],t<params.chunkCount);sums[t]=v;workgroupBarrier();for (var off=1u; off<256u; off=off<<1u) {var add=0u;if (t>=off) {add=sums[t-off];}
workgroupBarrier();sums[t]+=add;workgroupBarrier();}
if (t<params.chunkCount) {chunkSums[t]=sums[t]-v;}}
`;o.ShadersStoreWGSL[r]||(o.ShadersStoreWGSL[r]=t);const h={name:r,shader:t};export{h as gsSortScanSumsComputeShaderWGSL};
