<template>
  <section class="prg-group" :style="slotStyle" aria-label="NovaCad">
    <div class="prg-buttons">
      <button type="button" class="prg-button etabs-cimentacion-open" :aria-expanded="cimentacionOpen" aria-controls="etabs-foundation-panel" :class="{ 'is-active': cimentacionOpen, 'has-pending': foundationPending && !cimentacionOpen }"
        :title="foundationPending ? 'Cimentación 2.0: hay datos del agente listos para cargar' : 'Cimentación 2.0: zapatas y presiones'" @click="emit('open-cimentacion')">
        <NovaCadIcon name="foundation" />
        <span>Cimentación<br />2.0</span>
      </button>
      <button type="button" class="prg-button etabs-agent-open" :aria-expanded="agentOpen" :class="{ 'is-active': agentOpen }" title="Agente NovaCad: dibuja y lee el plano" @click="emit('open-agent')">
        <NovaCadIcon name="agent" />
        <span>Agente<br />NovaCad</span>
      </button>
      <button type="button" class="prg-button etabs-results-open" :disabled="!hasResults" title="Resultados de cimentación" @click="emit('open-results')">
        <NovaCadIcon name="results" />
        <span>Resultados</span>
      </button>
    </div>
    <button type="button" class="prg-title prg-about" title="Acerca de NovaCad" @click="emit('about')">NovaCad · Información</button>
  </section>
</template>

<script setup>
import NovaCadIcon from './NovaCadIcon.vue';
defineProps({
  slotStyle: {type: Object, required: true},
  cimentacionOpen: {type: Boolean, default: false},
  agentOpen: {type: Boolean, default: false},
  hasResults: {type: Boolean, default: false},
  foundationPending: {type: Boolean, default: false},
});
const emit = defineEmits(["open-cimentacion", "open-agent", "open-results", "about"]);
</script>

<style scoped>
/* Imita un grupo nativo de la cinta (como "Utilidades") al final del panel. */
.prg-group { position:absolute;right:4px;z-index:2;display:flex;flex-direction:column;padding:0 6px;border-left:1px solid var(--pr-line);box-sizing:border-box;background:var(--pr-panel); }
.prg-buttons { flex:1;display:flex;align-items:flex-start;gap:2px;padding-top:4px; }
.prg-button { display:flex;flex-direction:column;align-items:center;gap:4px;min-width:62px;padding:4px 6px;border:0;border-radius:5px;background:transparent;color:var(--pr-text);font-size:12px;line-height:1.15;font-family:inherit;text-align:center;cursor:pointer; }
.prg-button svg { width:24px;height:24px;fill:none;color:var(--pr-blue); }
.prg-button:hover:not(:disabled) { background:var(--pr-soft); }
.prg-button.is-active { background:var(--pr-soft);box-shadow:inset 0 -2px var(--pr-blue); }
.prg-button:disabled { opacity:.4;cursor:default; }
.prg-button { position:relative; }
.prg-button.has-pending::after { content:"";position:absolute;top:4px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--fz-warn);box-shadow:0 0 0 2px var(--pr-panel); }
.prg-button:focus-visible { outline:2px solid var(--pr-blue);outline-offset:-2px; }
.prg-title { padding:2px 0 3px;font-size:11px;color:var(--pr-muted);text-align:center; }
.prg-about { border:0;background:transparent;cursor:pointer;font-family:inherit; }
.prg-about:hover { color:var(--pr-blue);text-decoration:underline; }
</style>
