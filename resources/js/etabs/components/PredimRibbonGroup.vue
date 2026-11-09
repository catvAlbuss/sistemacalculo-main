<template>
  <section class="prg-group" :style="slotStyle" aria-label="Predim">
    <div class="prg-buttons">
      <button type="button" class="prg-button" :class="{ 'is-active': cimentacionOpen, 'has-pending': foundationPending && !cimentacionOpen }"
        :title="foundationPending ? 'Cimentación 2.0: hay datos del agente listos para cargar' : 'Cimentación 2.0: zapatas y presiones'" @click="emit('open-cimentacion')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h4v9h-4z" /><path d="M4 13h16v4H4z" /><path d="M2 19h20v2H2z" opacity=".5" /></svg>
        <span>Cimentación<br />2.0</span>
      </button>
      <button type="button" class="prg-button" :class="{ 'is-active': agentOpen }" title="Agente Predim: dibuja y lee el plano" @click="emit('open-agent')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" /><path d="M18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z" /></svg>
        <span>Agente<br />Predim</span>
      </button>
      <button type="button" class="prg-button" :disabled="!hasResults" title="Resultados de cimentación" @click="emit('open-results')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18v18H3zm2 2v6h6V5zm8 0v6h6V5zm-8 8v6h6v-6zm8 0v6h6v-6z" /></svg>
        <span>Resultados</span>
      </button>
    </div>
    <div class="prg-title">Predim</div>
  </section>
</template>

<script setup>
defineProps({
  slotStyle: {type: Object, required: true},
  cimentacionOpen: {type: Boolean, default: false},
  agentOpen: {type: Boolean, default: false},
  hasResults: {type: Boolean, default: false},
  foundationPending: {type: Boolean, default: false},
});
const emit = defineEmits(["open-cimentacion", "open-agent", "open-results"]);
</script>

<style scoped>
/* Imita un grupo nativo de la cinta (como "Utilidades") al final del panel. */
.prg-group { position:absolute;right:4px;z-index:2;display:flex;flex-direction:column;padding:0 6px;border-left:1px solid rgba(255,255,255,.12);box-sizing:border-box; }
.prg-buttons { flex:1;display:flex;align-items:flex-start;gap:2px;padding-top:4px; }
.prg-button { display:flex;flex-direction:column;align-items:center;gap:4px;min-width:62px;padding:4px 6px;border:0;border-radius:4px;background:transparent;color:#e5e7eb;font-size:12px;line-height:1.15;font-family:inherit;text-align:center;cursor:pointer; }
.prg-button svg { width:24px;height:24px;fill:#5aa2ff; }
.prg-button:hover:not(:disabled) { background:rgba(255,255,255,.08); }
.prg-button.is-active { background:rgba(64,158,255,.2); }
.prg-button:disabled { opacity:.4;cursor:default; }
.prg-button { position:relative; }
.prg-button.has-pending::after { content:"";position:absolute;top:4px;right:10px;width:8px;height:8px;border-radius:50%;background:#f59e0b;box-shadow:0 0 0 2px #1f1f1f; }
.prg-button:focus-visible { outline:2px solid #5aa2ff;outline-offset:-2px; }
.prg-title { padding:2px 0 3px;font-size:11px;color:#a3a3a3;text-align:center; }
</style>
