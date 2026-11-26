{{-- resources/views/components/cad/modals/agente-cad-chat.blade.php
     Chat del agente en Análisis Estructural: panel flotante (no bloquea el modelo) que trabaja por su
     cuenta sobre el modelo abierto. Lógica: mixins/analysis/agenteCad.js (cadSystem.agenteCadResponder)
     y engine/agenteCad.js. Se abre con el evento open-agente-cad-chat (menú 🤖 Agente). --}}
<div x-data="agenteCadChat()" x-show="open" x-cloak
     class="fixed z-[9998] flex flex-col rounded-lg border border-emerald-700 bg-gray-900 text-gray-100 shadow-2xl"
     style="right:16px; bottom:16px; width:min(420px, calc(100vw - 32px)); height:min(560px, calc(100vh - 120px))"
     role="dialog" aria-label="Chat del agente de Análisis Estructural">
    <div class="flex items-center justify-between rounded-t-lg bg-emerald-800 px-3 py-2">
        <span class="text-sm font-semibold">🤖 Agente — Análisis Estructural</span>
        <div class="flex items-center gap-2">
            <button @click="limpiar()" class="text-xs text-emerald-100 hover:text-white" title="Nueva conversación">Limpiar</button>
            <button @click="open = false" class="text-lg leading-none text-emerald-100 hover:text-white" aria-label="Cerrar">&times;</button>
        </div>
    </div>

    <div x-ref="lista" class="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
        <template x-for="(m, i) in mensajes" :key="i">
            <div :class="m.role === 'user' ? 'ml-8 rounded bg-sky-800 px-2 py-1.5' : 'mr-4 rounded bg-gray-800 px-2 py-1.5'">
                <div class="whitespace-pre-line" x-text="m.content"></div>
            </div>
        </template>
        <div x-show="pensando" class="mr-4 rounded bg-gray-800 px-2 py-1.5 text-gray-400">Trabajando…</div>
    </div>

    <div class="flex flex-wrap gap-1 border-t border-gray-700 px-3 pt-2">
        <template x-for="s in sugerencias" :key="s">
            <button @click="enviar(s)" :disabled="pensando" class="rounded border border-gray-600 px-2 py-0.5 text-[11px] text-gray-300 hover:bg-gray-700 disabled:opacity-50" x-text="s"></button>
        </template>
    </div>
    <form @submit.prevent="enviar()" class="flex gap-2 p-3">
        <input x-model="texto" x-ref="entrada" type="text" placeholder="Escribe un pedido o una pregunta…" :disabled="pensando"
               class="flex-1 rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none">
        <button type="submit" :disabled="pensando || !texto.trim()" class="rounded bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500 disabled:opacity-50">Enviar</button>
    </form>
</div>

<script>
    function agenteCadChat() {
        return {
            open: false,
            texto: '',
            pensando: false,
            mensajes: [{role: 'assistant', content: 'Hola. Trabajo sobre el modelo abierto: puedo analizar el sismo, revisar con la E.030, diseñar columnas, ajustar el acero y enviar el diseño a NovaCad. Escribe «ayuda» para ver los pedidos.'}],
            sugerencias: ['crea un edificio de 3 pisos de 3x2 vanos de 5 m', 'analiza el sismo', 'revisa con la E.030', 'diseña las columnas', 'ajusta el acero', 'envía el diseño a NovaCad'],
            init() {
                window.addEventListener('open-agente-cad-chat', () => { this.open = true; this.$nextTick(() => this.$refs.entrada?.focus()); });
            },
            limpiar() { this.mensajes = this.mensajes.slice(0, 1); },
            async enviar(pedido = null) {
                const t = String(pedido ?? this.texto).trim();
                if (!t || this.pensando) return;
                this.texto = '';
                const historial = this.mensajes.slice(1).map((m) => ({role: m.role, content: m.content}));
                this.mensajes.push({role: 'user', content: t});
                this.pensando = true;
                this.bajar();
                try {
                    const r = await window.cadSystem.agenteCadResponder(t, historial);
                    this.mensajes.push({role: 'assistant', content: r.texto});
                } catch (e) {
                    this.mensajes.push({role: 'assistant', content: 'No pude completar el pedido: ' + (e?.message || e)});
                } finally {
                    this.pensando = false;
                    this.bajar();
                }
            },
            bajar() { this.$nextTick(() => { const l = this.$refs.lista; if (l) l.scrollTop = l.scrollHeight; }); },
        };
    }
</script>
