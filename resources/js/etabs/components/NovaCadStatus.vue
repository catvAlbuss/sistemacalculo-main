<template><button type="button" class="nc-product-status" title="Acerca de NovaCad · Información del producto" aria-label="Acerca de NovaCad" @click="emit('about')"><NovaCadIcon name="brand" /><strong>NovaCad</strong><span>Planos e ingeniería</span></button></template>
<script setup>
import NovaCadIcon from './NovaCadIcon.vue';
const emit=defineEmits(['about']);
</script>
<style scoped>
.nc-product-status{display:inline-flex;align-items:center;gap:6px;flex-shrink:0;min-height:24px;margin-inline:6px;padding:2px 7px;border:1px solid var(--pr-line);border-radius:5px;background:var(--pr-soft);color:var(--pr-text);font:inherit;font-size:11px;cursor:pointer;white-space:nowrap}
.nc-product-status svg{width:16px;height:16px;color:var(--pr-blue)}.nc-product-status strong{font-weight:700}.nc-product-status span{font-size:10px;color:var(--pr-muted)}.nc-product-status:hover{border-color:var(--pr-blue)}.nc-product-status:focus-visible{outline:2px solid var(--pr-blue);outline-offset:-2px}
@media(max-width:1100px){.nc-product-status span{display:none}}@media(max-width:540px){.nc-product-status{margin-inline:2px;padding-inline:3px;font-size:10px}.nc-product-status svg{width:13px;height:13px}}
</style>
