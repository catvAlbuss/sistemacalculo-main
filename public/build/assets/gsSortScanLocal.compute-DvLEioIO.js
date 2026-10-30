import{S as a}from"./analisis_estructural_de_armaduras-CLmkH75c.js";import"./livewire.esm-BwfLLVY7.js";import"./analisisEstructural-0Z_61IYw.js";import"./preload-helper-BfFHrpNk.js";import"./color_scale-BGSv3LvJ.js";import"./zapatas2Core-DzAejvGH.js";import"./plotly.min-COokRvoC.js";import"./_commonjsHelpers-D6-XlEtG.js";import"./deflectionCalculator-BFw1L2Wc.js";import"./engineError-CU3s0yX4.js";import"./html2canvas.esm-5Cw11iw4.js";import"./rizabalasociados-BgyDGUXy.js";import"./ubigeo-Cak7qga5.js";const r="gsSortScanLocalComputeShader",o=`struct GsSortPassParams {count : u32,
numBlocks : u32,
shift : u32,
chunkCount : u32,}
@group(0) @binding(0) var<storage,read> params : GsSortPassParams;@group(0) @binding(1) var<storage,read_write> sumTable : array<u32>;@group(0) @binding(2) var<storage,read_write> chunkSums : array<u32>;var<workgroup> threadSums : array<u32,256>;@compute @workgroup_size(256,1,1)
fn main(@builtin(local_invocation_id) lid : vec3u,@builtin(workgroup_id) wid : vec3u) {let t=lid.x;let chunk=wid.y*65535u+wid.x;let n=params.numBlocks*16u;let base=chunk*1024u+t*4u;var v : array<u32,4>;var total=0u;for (var j=0u; j<4u; j++) {v[j]=0u;if (base+j<n) {v[j]=sumTable[base+j];}
total+=v[j];}
threadSums[t]=total;workgroupBarrier();for (var off=1u; off<256u; off=off<<1u) {var add=0u;if (t>=off) {add=threadSums[t-off];}
workgroupBarrier();threadSums[t]+=add;workgroupBarrier();}
var running=threadSums[t]-total;for (var j=0u; j<4u; j++) {if (base+j<n) {sumTable[base+j]=running;}
running+=v[j];}
if (t==255u && chunk<params.chunkCount) {chunkSums[chunk]=threadSums[255];}}
`;a.ShadersStoreWGSL[r]||(a.ShadersStoreWGSL[r]=o);const l={name:r,shader:o};export{l as gsSortScanLocalComputeShaderWGSL};
