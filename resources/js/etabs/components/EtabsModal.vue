<template>
  <Teleport to="body">
    <div class="em-backdrop etabs-theme" @mousedown.self="emit('close')">
      <section ref="dialogRef" class="em-dialog" :class="`em-${size}`" role="dialog" aria-modal="true"
        :aria-labelledby="titleId" tabindex="-1" data-analysis-sheet>
        <header class="em-header">
          <div>
            <h2 :id="titleId">{{ title }}</h2>
            <p v-if="subtitle">{{ subtitle }}</p>
          </div>
          <button type="button" class="em-close" aria-label="Cerrar" title="Cerrar (Esc)" @click="emit('close')">✕</button>
        </header>
        <div class="em-body"><slot /></div>
        <footer v-if="$slots.footer" class="em-footer"><slot name="footer" /></footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import {nextTick, onBeforeUnmount, onMounted, ref} from "vue";

defineProps({
  title: {type: String, required: true},
  subtitle: {type: String, default: ""},
  size: {type: String, default: "md"}, // md | lg | xl
});
const emit = defineEmits(["close"]);

const dialogRef = ref(null);
const titleId = `em-title-${Math.random().toString(36).slice(2, 8)}`;
let previousFocus = null;

const onKeyDown = (event) => {
  if (event.key !== "Escape") return;
  event.stopPropagation();
  emit("close");
};

onMounted(() => {
  previousFocus = document.activeElement;
  window.addEventListener("keydown", onKeyDown, true);
  nextTick(() => dialogRef.value?.focus());
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown, true);
  previousFocus?.focus?.();
});
</script>

<style scoped>
.em-backdrop { position:fixed;inset:0;z-index:3000;display:grid;place-items:center;padding:24px;background:rgba(3,8,18,.62);backdrop-filter:blur(2px); }
.em-dialog { display:flex;flex-direction:column;width:100%;max-height:100%;min-height:0;overflow:hidden;border:1px solid var(--pr-line);border-radius:12px;background:var(--pr-panel);color:var(--pr-text);box-shadow:0 24px 60px rgba(0,0,0,.45);outline:none; }
.em-md { max-width:560px; }
.em-lg { max-width:920px; }
.em-xl { max-width:1240px; }
.em-header { display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px 20px;border-bottom:1px solid var(--pr-line); }
.em-header h2 { margin:0;font-size:17px;font-weight:700; }
.em-header p { margin:4px 0 0;font-size:12.5px;color:var(--pr-muted); }
.em-close { flex-shrink:0;width:32px;height:32px;border:1px solid var(--pr-line);border-radius:8px;background:var(--pr-soft);color:var(--pr-text);cursor:pointer; }
.em-close:hover { border-color:var(--pr-blue);color:var(--pr-blue); }
.em-body { flex:1;min-height:0;overflow:auto;padding:18px 20px; }
.em-footer { display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid var(--pr-line);background:var(--pr-soft); }
@media(max-width:760px) {
  .em-backdrop { padding:0;place-items:end stretch; }
  .em-dialog { max-width:none;max-height:92dvh;border-radius:14px 14px 0 0; }
  .em-header,.em-body,.em-footer { padding-inline:16px; }
}
</style>
