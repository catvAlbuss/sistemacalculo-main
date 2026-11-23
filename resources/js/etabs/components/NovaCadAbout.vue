<template>
  <EtabsModal title="Acerca de NovaCad" :subtitle="product.provider" size="lg" @close="emit('close')">
    <div class="nc-about-tabs" role="group" aria-label="Información del producto">
      <button type="button" :aria-pressed="section==='product'" @click="section='product'">Producto</button>
      <button type="button" :aria-pressed="section==='licenses'" @click="showLicenses">Créditos y licencias</button>
    </div>
    <section v-if="section==='product'" class="nc-about-product">
      <div class="nc-about-heading"><span class="nc-about-mark"><NovaCadIcon name="brand" /></span><div><h3>Planos e ingeniería asistida</h3><p>Un espacio de trabajo de {{ product.provider }}.</p></div></div>
      <p>Integra dibujo técnico, herramientas de cimentación y automatización asistida para desarrollar y revisar planos de ingeniería civil.</p>
      <dl class="nc-about-features"><div><dt>Dibujo y documentación</dt><dd>Trabajo con planos DWG y DXF, geometría, capas y anotaciones.</dd></div><div><dt>Ingeniería y automatización</dt><dd>Cimentación, revisión de resultados y agente NovaCad integrado al plano.</dd></div></dl>
      <p class="nc-about-attribution">NovaCad incorpora motores y bibliotecas de terceros. Sus autores conservan sus derechos y licencias; consulta los créditos para ver sus avisos completos.</p>
      <dl class="nc-about-provider"><div><dt>Proveedor de NovaCad</dt><dd>{{ product.provider }}</dd></div><div v-if="product.ruc"><dt>RUC del proveedor</dt><dd>{{ product.ruc }}</dd></div><div v-if="product.email"><dt>Atención</dt><dd><a :href="`mailto:${product.email}`">{{ product.email }}</a></dd></div><div v-if="product.phone"><dt>Contacto</dt><dd>{{ product.phone }}</dd></div></dl>
    </section>
    <section v-else class="nc-about-licenses">
      <h3>Componentes de terceros</h3>
      <p>El visor y su núcleo mlightcad utilizan MIT. Los lectores DXF y DWG incluyen componentes GPL-3.0, entre ellos dxf-json y LibreDWG. Consulta el inventario para conocer la licencia de cada componente; todos conservan su autoría y condiciones de uso.</p>
      <div class="nc-about-links"><a href="/build/licenses/THIRD-PARTY-NOTICES.txt" target="_blank" rel="noopener">Avisos completos y copyrights</a><a href="/build/licenses/inventory.json" target="_blank" rel="noopener">Inventario de esta compilación</a></div>
      <p v-if="loading" role="status">Cargando versiones y licencias…</p>
      <div v-else-if="error" role="alert"><p>{{ error }}</p><button type="button" class="fz-btn" @click="loadLicenses">Reintentar</button></div>
      <div v-else class="fz-table-wrap"><table class="fz-table nc-license-table"><thead><tr><th class="fz-left">Componente</th><th>Versión</th><th>Licencia</th><th>Avisos</th></tr></thead><tbody><tr v-for="pkg in packages" :key="pkg.name+pkg.version"><td class="fz-left">{{ pkg.name }}</td><td>{{ pkg.version }}</td><td>{{ pkg.license }}</td><td><a v-for="file in pkg.files" :key="file.url" :href="file.url" target="_blank" rel="noopener">{{ file.name }}</a><span v-if="!pkg.files.length">Ver repositorio del componente</span></td></tr></tbody></table></div>
      <p class="nc-about-attribution">Los avisos se generan a partir de los paquetes incluidos en el build y los workers distribuidos. Cada licencia mantiene sus propias condiciones; este inventario no certifica su cumplimiento.</p>
    </section>
    <template #footer><span class="nc-about-owner">Interfaz e integración NovaCad · {{ product.provider }}</span><button type="button" class="fz-btn fz-btn-primary" @click="emit('close')">Cerrar</button></template>
  </EtabsModal>
</template>
<script setup>
import {ref} from 'vue';
import EtabsModal from './EtabsModal.vue';
import NovaCadIcon from './NovaCadIcon.vue';
import {novaCadMetadata} from '../product/metadata.js';
const emit=defineEmits(['close']);
const product=novaCadMetadata(),section=ref('product'),packages=ref([]),loading=ref(false),error=ref('');
async function loadLicenses(){
  loading.value=true;error.value='';
  try {const response=await fetch('/build/licenses/inventory.json',{cache:'no-store'});if(!response.ok)throw Error('No se pudo cargar el inventario de licencias de esta compilación.');const data=await response.json();if(!Array.isArray(data.packages))throw Error('El inventario no tiene un formato válido.');packages.value=data.packages;}
  catch(cause){error.value=cause.message;}finally{loading.value=false;}
}
function showLicenses(){section.value='licenses';if(!packages.value.length&&!loading.value)loadLicenses();}
</script>
<style scoped>
.nc-about-tabs{display:flex;gap:4px;padding:3px;margin-bottom:20px;border:1px solid var(--pr-line);border-radius:7px;background:var(--pr-soft)}
.nc-about-tabs button{flex:1;padding:8px;border:0;border-radius:5px;background:transparent;color:var(--pr-muted);font:inherit;cursor:pointer}
.nc-about-tabs button[aria-pressed=true]{background:var(--pr-panel);color:var(--pr-blue);font-weight:600;box-shadow:0 1px 3px #0001}
.nc-about-heading{display:flex;align-items:center;gap:14px;margin-bottom:18px}.nc-about-heading h3{margin:0;font-size:20px;letter-spacing:-.4px}.nc-about-heading p{margin:4px 0 0;color:var(--pr-muted)}
.nc-about-mark{display:grid;place-items:center;flex-shrink:0;width:54px;height:54px;border-radius:10px;border:1px solid var(--pr-line);background:var(--pr-soft);color:var(--pr-blue)}.nc-about-mark svg{width:34px;height:34px}
.nc-about-product>p,.nc-about-licenses>p{line-height:1.6}.nc-about-features{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0;padding-block:16px;border-block:1px solid var(--pr-line)}dt{font-weight:600}dd{margin:4px 0 0;color:var(--pr-muted)}
.nc-about-provider{display:grid;gap:8px;margin:16px 0}.nc-about-provider>div{display:grid;grid-template-columns:150px 1fr;gap:12px}.nc-about-provider dd{margin:0;overflow-wrap:anywhere}.nc-about-attribution{font-size:12px;color:var(--pr-muted)}
.nc-about-owner{margin-right:auto;font-size:11px;color:var(--pr-muted)}.nc-about-links{display:flex;flex-wrap:wrap;gap:10px 18px;margin:16px 0}.nc-about-licenses a,.nc-about-provider a{color:var(--pr-blue);text-decoration:underline;text-underline-offset:2px}.nc-license-table a{display:block}.nc-license-table{font-size:11px}.nc-about-licenses .fz-table-wrap{max-height:42vh}
@media(max-width:600px){.nc-about-features{grid-template-columns:1fr}.nc-about-provider>div{grid-template-columns:1fr;gap:2px}.nc-about-owner{width:100%}}
</style>
