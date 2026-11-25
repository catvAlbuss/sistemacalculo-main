<template>
  <aside class="ag" :class="{ 'is-busy': busy }" aria-label="Agente NovaCad">
    <header class="ag-head">
      <span class="ag-orb" aria-hidden="true"><i></i></span>
      <div class="ag-who">
        <h2>Agente NovaCad</h2>
        <p :class="`is-${estadoTono}`"><span class="ag-dot"></span>{{ estadoTexto }}</p>
      </div>
      <button v-if="runs.length" type="button" class="ag-icon" title="Volver al menú de acciones" aria-label="Volver al menú" :disabled="busy" @click="irAlMenu"><svg viewBox="0 0 24 24"><path :d="ICON.menu" /></svg></button>
      <button type="button" class="ag-icon" aria-label="Datos del proyecto" title="Datos del proyecto" @click="abrirDatos('editar')"><svg viewBox="0 0 24 24"><path :d="ICON.datos" /></svg></button>
      <button type="button" class="ag-icon" aria-label="Nueva sesión" title="Nueva sesión" :disabled="busy" @click="reset"><svg viewBox="0 0 24 24"><path :d="ICON.nueva" /></svg></button>
      <button type="button" class="ag-icon" aria-label="Cerrar agente" title="Cerrar" @click="emit('close')"><svg viewBox="0 0 24 24"><path :d="ICON.cerrar" /></svg></button>
    </header>

    <nav class="ag-nav" aria-label="Vistas del agente">
      <button type="button" :aria-current="vistaAgente === 'asistente' ? 'page' : undefined" @click="vistaAgente = 'asistente'"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICON.conversar" /></svg>Asistente</button>
      <button v-if="revision.activa && !revision.sinPermiso" type="button" :aria-current="vistaAgente === 'revisiones' ? 'page' : undefined" @click="vistaAgente = 'revisiones'"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICON.revisar" /></svg>Revisiones <span v-if="revision.eventos.length" class="ag-count">{{ revision.eventos.length }}</span><span v-if="revision.error" class="ag-review-alert" aria-label="Error al cargar revisiones">!</span></button>
    </nav>

    <div v-show="vistaAgente === 'revisiones'" class="ag-feed ag-review-feed" aria-label="Revisiones técnicas">
      <section v-if="vistaAgente === 'revisiones' && revision.activa && !revision.sinPermiso" class="ag-review">
        <div class="ag-section-heading">
          <h3><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICON.revisar" /></svg>Correcciones pendientes</h3>
          <p>Cola del despacho. Revisa cada propuesta antes de incorporarla al aprendizaje.</p>
        </div>
        <p v-if="revision.cargando" class="ag-read-sum" role="status">Cargando correcciones pendientes…</p>
        <p v-if="revision.error" class="ag-read-sum ag-err" role="alert">
          {{ revision.error }}
          <button type="button" class="ag-link" :disabled="revision.cargando" @click="cargarPendientes"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICON.nueva" /></svg>Reintentar</button>
        </p>
        <p v-if="!revision.cargando && !revision.error && !revision.eventos.length" class="ag-empty" role="status">No hay correcciones pendientes.</p>
        <ul class="ag-review-list">
          <li v-for="e in revision.eventos" :key="e.evento_id">
            <div>
              <b>{{ e.clave }}</b>
              <dl class="ag-review-values">
                <div v-if="e.propuesto !== null && e.propuesto !== undefined"><dt>Anterior</dt><dd>{{ String(e.propuesto) }}</dd></div>
                <div><dt>Corrección</dt><dd>{{ String(e.valor) }}</dd></div>
              </dl>
              <small v-if="e.motivo">Motivo: {{ e.motivo }}</small>
              <details v-if="e.rasgos && Object.keys(e.rasgos).length" class="ag-more">
                <summary>Contexto técnico · {{ Object.keys(e.rasgos).length }} datos</summary>
                <dl class="ag-review-context"><div v-for="(valor, rasgo) in e.rasgos" :key="rasgo"><dt>{{ rasgo }}</dt><dd>{{ String(valor) }}</dd></div></dl>
              </details>
              <dl v-if="e.clave === 'metrado'" class="ag-review-context">
                <div><dt>Partida</dt><dd>{{ e.partida }}</dd></div>
                <div><dt>Fila</dt><dd>{{ e.fila }}</dd></div>
                <div><dt>Campo</dt><dd>{{ e.campo }}</dd></div>
              </dl>
              <small v-else-if="e.clave === 'termino'">Término: {{ e.termino }}</small>
              <span class="ag-revision-actions">
                <button type="button" class="ag-btn is-sm" :disabled="revision.revisando[e.evento_id]" @click="revisarEvento(e.evento_id, 'aprobar')"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICON.aprobar" /></svg>{{ revision.revisando[e.evento_id] ? "Revisando…" : "Aprobar" }}</button>
                <button type="button" class="ag-btn is-sm is-ghost" :disabled="revision.revisando[e.evento_id]" @click="revisarEvento(e.evento_id, 'rechazar')"><svg viewBox="0 0 24 24" aria-hidden="true"><path :d="ICON.cerrar" /></svg>{{ revision.revisando[e.evento_id] ? "Revisando…" : "Rechazar" }}</button>
              </span>
              <small v-if="revision.errores[e.evento_id]" class="ag-err" role="alert">{{ revision.errores[e.evento_id] }}</small>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <div v-show="vistaAgente === 'asistente'" ref="listRef" class="ag-feed" aria-label="Conversación con NovaCad">
      <!-- Lectura de la arquitectura importada: lo que el agente vio y lo que le falta. -->
      <section v-if="lectura.estado !== 'vacio'" class="ag-read" :class="`is-${lectura.estado}`">
        <button type="button" class="ag-read-head" :aria-expanded="verLectura" @click="verLectura = !verLectura">
          <span class="ag-read-ic"><svg viewBox="0 0 24 24"><path :d="ICON.capas" /></svg></span>
          <span class="ag-read-t"><strong>{{ lectura.nombre || "Plano abierto" }}</strong><small>{{ verLectura ? "Ocultar detalles del plano" : "Ver detalles del plano" }}<template v-if="lectura.problemas?.length"> · {{ lectura.problemas.length }} por resolver</template></small></span>
          <span class="ag-pill">{{ ESTADO_LECTURA[lectura.estado] }}</span>
          <span class="ag-chevron" :class="{'is-open': verLectura}" aria-hidden="true">⌄</span>
        </button>
        <p v-if="lectura.estado === 'leyendo'" class="ag-read-sum"><span class="ag-shimmer">Leyendo ejes, columnas, muros y textos del plano…</span></p>
        <template v-else-if="verLectura">
          <p class="ag-read-sum">{{ lectura.resumen }}</p>
          <dl class="ag-stats">
            <div><dt>Vistas</dt><dd>{{ lectura.vistas.length }}</dd></div>
            <div><dt>Columnas</dt><dd>{{ principal?.columnas ?? 0 }}</dd></div>
            <div><dt>Columnetas</dt><dd>{{ principal?.columnetas ?? 0 }}</dd></div>
            <div><dt>Textos</dt><dd>{{ lectura.textos }}</dd></div>
          </dl>
          <ul v-if="lectura.vistas.length" class="ag-views">
            <li v-for="v in lectura.vistas" :key="v.titulo" :class="{ 'is-ok': v.columnas > 0 }">
              <strong>{{ v.titulo }}</strong>
              <span>Ejes {{ v.ejes.join(" · ") || "—" }} · {{ v.columnas }} columnas · {{ v.columnetas }} columnetas</span>
            </li>
          </ul>
          <p v-if="lectura.niveles.length" class="ag-read-line">Niveles NPT leídos: {{ lectura.niveles.join(", ") }} · {{ lectura.entidades.leidas.toLocaleString() }} de {{ lectura.entidades.total.toLocaleString() }} objetos usados ({{ lectura.unidades }})</p>
          <ul v-if="lectura.problemas.length" class="ag-problems">
            <li v-for="p in lectura.problemas" :key="p.codigo"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg><div><b>{{ p.texto }}</b><small>{{ p.arreglo }}</small></div></li>
          </ul>
          <details v-if="lectura.avisos.length" class="ag-more">
            <summary>{{ lectura.avisos.length }} {{ lectura.avisos.length === 1 ? "detalle" : "detalles" }} de la lectura</summary>
            <ul><li v-for="(a, j) in lectura.avisos" :key="j">{{ a }}</li></ul>
          </details>
          <button type="button" class="ag-link" :disabled="busy" @click="diagnosticar">Volver a leer el plano</button>
        </template>
      </section>

      <section v-if="!runs.length || verMenu" ref="menuRef" class="ag-start">
        <h3>¿Qué necesitas hacer?</h3>
        <p>Trabajemos sobre tu plano.</p>
        <div class="ag-caps">
          <button v-for="c in CAPACIDADES" :key="c.titulo" type="button" class="ag-cap" :class="{ 'is-principal': c.principal }" :disabled="busy" @click="ejecutar(c.herramienta, c.args, c.pedido)">
            <span class="ag-cap-ic"><svg viewBox="0 0 24 24"><path :d="ICON[c.icono]" /></svg></span>
            <strong>{{ c.titulo }}</strong>
            <small>{{ c.detalle }}</small>
          </button>
        </div>
      </section>

      <article v-for="(run, i) in runs" :key="i" class="ag-run">
        <div class="ag-ask">
          <p>{{ run.pedido }}</p>
          <div v-if="run.fotos.length" class="ag-thumbs"><img v-for="(f, j) in run.fotos" :key="j" :src="f" alt="Foto adjunta" /></div>
        </div>
        <div class="ag-work">
          <details v-if="run.pasos.length && !run.vivo" class="ag-activity">
          <summary>Ver actividad</summary>
          <ol class="ag-steps">
            <li v-for="(p, j) in run.pasos" :key="j" :class="`is-${p.estado}`">
              <span class="ag-step-ic"><svg viewBox="0 0 24 24"><path :d="ICON[p.icono] || ICON.chispa" /></svg></span>
              <span class="ag-step-txt">{{ p.titulo }}</span>
              <span class="ag-step-t">{{ p.estado === "ok" ? "✓" : p.estado === "error" ? "✕" : "–" }} {{ p.seg }}</span>
            </li>
          </ol>
          </details>
          <div v-if="run.vivo" class="ag-thinking" role="status" aria-live="polite"><span class="ag-shimmer">{{ run.vivo }}</span></div>
          <p v-if="run.respuesta" class="ag-answer">{{ run.respuesta }}</p>
          <ul v-if="run.avisos.length" class="ag-notes">
            <li v-for="(a, j) in run.avisos" :key="j"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg>{{ a }}</li>
          </ul>
          <div v-if="run.metrado" class="ag-ready">
            <span class="ag-ready-ic"><svg viewBox="0 0 24 24"><path :d="ICON.metrado" /></svg></span>
            <div><strong>{{ run.metrado === "listo" ? "Metrado de estructuras listo" : "Metrado disponible" }}</strong><small>{{ run.metrado === "listo" ? "Partidas calculadas con la estructura dibujada." : "Puedes calcular las partidas de la estructura dibujada." }}</small></div>
            <button type="button" class="ag-btn is-sm" :disabled="busy" @click="verMetrado(run)">{{ run.metrado === "listo" ? "Ver metrado" : "Sacar metrado" }}</button>
          </div>
          <div v-if="run.opciones.length && !busy" class="ag-options" role="group" aria-label="Respuestas sugeridas">
            <button v-for="o in run.opciones" :key="o.texto" type="button" :class="{'is-rec': o.recomendada}" @click="o.herramienta ? ejecutar(o.herramienta, o.args ?? {}, o.texto) : send(o.texto)">{{ o.texto }}<small v-if="o.recomendada"> · recomendado</small></button>
          </div>
          <div v-if="run.siguientes.length && !busy" class="ag-next">
            <button v-for="s in run.siguientes" :key="s.texto" type="button" @click="ejecutar(s.herramienta, s.args, s.texto)">{{ s.texto }} →</button>
          </div>
          <small v-if="run.meta" class="ag-meta">{{ run.meta }}</small>
        </div>
      </article>
    </div>

    <form v-show="vistaAgente === 'asistente'" class="ag-compose" @submit.prevent="send()">
      <div v-if="adjuntos.length" class="ag-attach">
        <span v-for="(a, j) in adjuntos" :key="j" class="ag-chip-img"><img :src="a.url" alt="" /><button type="button" aria-label="Quitar foto" @click="adjuntos.splice(j, 1)">✕</button></span>
      </div>
      <div class="ag-box">
        <button type="button" class="ag-icon" aria-label="Adjuntar fotos de observaciones" title="Adjuntar fotos de observaciones" :disabled="busy || adjuntos.length >= 6" @click="fileRef.click()"><svg viewBox="0 0 24 24"><path :d="ICON.clip" /></svg></button>
        <input ref="fileRef" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="adjuntar" />
        <textarea v-model="draftText" rows="1" aria-label="Instrucción para el agente" :placeholder="motorListo ? 'Escribe una instrucción…' : 'Sin IA: usa las acciones de arriba'" :disabled="busy || !motorListo"
          @input="autoAlto" @paste="pegar" @keydown.enter.exact.prevent="send()"></textarea>
        <button v-if="!busy" type="submit" class="ag-send" :disabled="!motorListo || (!draftText.trim() && !adjuntos.length)" aria-label="Enviar"><svg viewBox="0 0 24 24"><path :d="ICON.enviar" /></svg></button>
        <button v-else type="button" class="ag-send is-stop" aria-label="Detener" :disabled="!controller" @click="cancel"><svg viewBox="0 0 24 24"><path :d="ICON.detener" /></svg></button>
      </div>
      <p class="ag-compose-help">Puedes adjuntar fotos o pegar una captura con Ctrl+V.</p>
      <label v-if="puedeVerPlano" class="ag-compose-help ag-ver-plano">
        <input type="checkbox" :checked="verPlano" @change="cambiarVerPlano($event.target.checked)" />
        El agente puede enviar imágenes del plano abierto al motor de IA para revisarlo.
      </label>
    </form>

    <!-- Datos del proyecto: al pedir el plano llegan llenos (lo guardado y lo que propone el agente). -->
    <Teleport to="body">
      <div v-if="modal.abierto" class="ag-modal-bg" @click.self="cerrarDatos(null)">
        <form class="ag-modal" role="dialog" aria-modal="true" aria-labelledby="ag-modal-t" @submit.prevent="cerrarDatos(modal.borrador)">
          <header>
            <span class="ag-orb is-small" aria-hidden="true"><i></i></span>
            <div>
              <h3 id="ag-modal-t">{{ modal.modo === "pedido" ? "Datos para el plano de estructuras" : "Datos del proyecto" }}</h3>
              <p v-if="modal.modo === 'pedido'">Revisa y corrige lo que haga falta.<template v-if="modal.propuestos.length"> Lo marcado en azul lo propone el agente con proyectos parecidos.</template> Al confirmar dibujo las láminas{{ modal.vista ? ` de ${modal.vista}` : "" }}.</p>
              <p v-else>Se usan en las láminas de estructuras y en el rótulo.</p>
            </div>
          </header>
          <div class="ag-modal-body">
            <template v-if="modal.consultas.length || modal.informes.length">
              <h4>Decisiones del ingeniero</h4>
              <p class="ag-consulta-intro">No lo tengo seguro: elige y dibujo con eso. Lo que decidas lo aprendo para planos parecidos.</p>
              <fieldset v-for="c in modal.consultas" :key="c.clave" class="ag-consulta">
                <legend>{{ c.pregunta }}</legend>
                <label v-for="o in c.opciones" :key="String(o.valor)" class="ag-opcion">
                  <input type="radio" :name="`consulta-${c.clave}`" :value="String(o.valor)" v-model="modal.decisiones[c.clave]" />
                  <span>{{ o.texto }}<em v-if="o.valor === c.recomendado"> · recomendado</em></span>
                </label>
                <small>{{ c.porque }}</small>
              </fieldset>
              <ul v-if="modal.informes.length" class="ag-informes"><li v-for="i in modal.informes" :key="i">{{ i }}</li></ul>
            </template>
            <h4>Ubicación (ubigeo)</h4>
            <div class="ag-grid">
              <label :class="marcaCampo('region')"><span>Región</span>
                <select :value="modal.borrador.region" @change="elegirUbigeo('region', $event.target.value)">
                  <option value="">{{ ubigeo ? "Elige la región" : "Cargando ubigeos…" }}</option>
                  <option v-for="o in opcionesUbigeo('region')" :key="o" :value="o">{{ o }}</option>
                </select>
              </label>
              <label :class="marcaCampo('provincia')"><span>Provincia</span>
                <select :value="modal.borrador.provincia" :disabled="!modal.borrador.region" @change="elegirUbigeo('provincia', $event.target.value)">
                  <option value="">Elige la provincia</option>
                  <option v-for="o in opcionesUbigeo('provincia')" :key="o" :value="o">{{ o }}</option>
                </select>
              </label>
              <label :class="marcaCampo('distrito')"><span>Distrito</span>
                <select :value="modal.borrador.distrito" :disabled="!modal.borrador.provincia" @change="elegirUbigeo('distrito', $event.target.value)">
                  <option value="">Elige el distrito</option>
                  <option v-for="o in opcionesUbigeo('distrito')" :key="o" :value="o">{{ o }}</option>
                </select>
              </label>
              <label :class="marcaCampo('localidad')"><span>Localidad</span>
                <input v-model.trim="modal.borrador.localidad" placeholder="Centro poblado o caserío" />
              </label>
            </div>
            <p v-if="distritoElegido" class="ag-ubigeo"><svg viewBox="0 0 24 24"><path :d="ICON.mapa" /></svg>{{ distritoElegido.name }}: zona sísmica {{ Number(distritoElegido.zone) }} (Z = {{ distritoElegido.zFactor }}) según la E.030; la puse en el estudio de suelos.</p>
            <h4>Estudio de suelos y sismo (E.030)</h4>
            <div class="ag-grid">
              <label v-for="c in CAMPOS_TECNICOS" :key="c.campo" :class="marcaCampo(c.campo)"><span>{{ c.etiqueta }}</span>
                <select v-if="c.opciones" v-model="modal.borrador[c.campo]">
                  <option value="">Sin indicar</option>
                  <option v-for="[valor, texto] in c.opciones" :key="valor" :value="valor">{{ texto }}</option>
                </select>
                <input v-else v-model.trim="modal.borrador[c.campo]" inputmode="decimal" :placeholder="`Ej. ${c.ejemplo}`" />
              </label>
            </div>
            <h4>Rótulo de las láminas</h4>
            <div class="ag-grid">
              <label v-for="c in CAMPOS_ROTULO" :key="c.campo" :class="[marcaCampo(c.campo), { 'is-wide': c.campo === 'proyecto' || c.campo === 'entidad' }]"><span>{{ c.etiqueta }}</span>
                <input v-model.trim="modal.borrador[c.campo]" :placeholder="c.ejemplo" />
              </label>
            </div>
          </div>
          <footer>
            <button type="button" class="ag-btn is-ghost" @click="cerrarDatos(null)">Cancelar</button>
            <button type="submit" class="ag-btn">{{ modal.modo === "pedido" ? "Generar plano" : "Guardar" }}</button>
          </footer>
        </form>
      </div>
    </Teleport>

    <!-- Metrado: la planilla del despacho completa (como el Excel), editable para corregir antes de exportar. -->
    <Teleport to="body">
      <div v-if="met.abierto" class="ag-modal-bg" @click.self="met.abierto = false">
        <section class="ag-modal is-sheet" role="dialog" aria-modal="true" aria-labelledby="ag-met-t">
          <header>
            <span class="ag-orb is-small" aria-hidden="true"><i></i></span>
            <div class="ag-met-head">
              <h3 id="ag-met-t">Planilla de metrados · Estructuras</h3>
              <p>{{ met.datos.proyecto || "Proyecto" }} · {{ partidasMet.length }} partidas. Corrige cualquier medida en la tabla: se recalcula, se envía a revisión técnica antes de compartirse y el Excel sale igual a esta vista.</p>
            </div>
          </header>
          <div class="ag-tiles">
            <div><small>Excavación</small><strong>{{ fmt(met.datos.resumen.excavacion) }}</strong><span>m³</span></div>
            <div><small>Concreto</small><strong>{{ fmt(met.datos.resumen.concreto) }}</strong><span>m³</span></div>
            <div><small>Acero</small><strong>{{ fmt(met.datos.resumen.acero) }}</strong><span>kg</span></div>
            <div><small>Encofrado</small><strong>{{ fmt(met.datos.resumen.encofrado) }}</strong><span>m²</span></div>
            <div class="is-auto" :title="`${conteo.propuestas} de ${conteo.filas} filas son propuestas del agente por revisar`"><small>Del plano y datos</small><strong>{{ conteo.automatico }} %</strong><span>{{ conteo.propuestas }} filas por revisar</span></div>
          </div>
          <!-- Contraste con el despacho: relaciones que no dependen del tamaño, contra el rango real
               de sus planillas. Lo que sale fuera es lo primero que revisa el especialista. -->
          <div v-if="met.datos.contraste?.length" class="ag-contraste">
            <span class="ag-contraste-t">Contraste con el despacho</span>
            <span v-for="c in contrasteOrdenado" :key="c.clave" class="ag-rel" :class="c.dentro ? 'is-ok' : 'is-out'"
              :title="`${c.nombre}: ${fmtRel(c.valor)} ${c.unidad}. En ${c.n} módulos del despacho va de ${fmtRel(c.desde)} a ${fmtRel(c.hasta)} (mediana ${fmtRel(c.mediana)}).`">
              {{ c.dentro ? "✓" : "!" }} {{ c.nombre }} · {{ fmtRel(c.valor) }} {{ c.unidad }}
            </span>
          </div>
          <div class="ag-filter">
            <button type="button" :class="{ 'is-on': met.filtro === 'todo' }" @click="met.filtro = 'todo'">Todo</button>
            <button type="button" :class="{ 'is-on': met.filtro === 'propuestas' }" @click="met.filtro = 'propuestas'"><i class="ag-sw is-prop"></i>Propuestas por revisar · {{ conteo.propuestas }}</button>
            <button type="button" :class="{ 'is-on': met.filtro === 'corregidas' }" @click="met.filtro = 'corregidas'"><i class="ag-sw is-corr"></i>Corregidas · {{ conteo.corregidas }}</button>
          </div>
          <div class="ag-modal-body ag-sheet-wrap">
            <table class="ag-sheet">
              <thead>
                <tr>
                  <th rowspan="2" class="c-item">Ítem</th><th rowspan="2" class="c-desc">Descripción</th><th rowspan="2">Und</th><th rowspan="2">Elem. simil.</th>
                  <th colspan="3" class="grp">Dimensiones</th><th rowspan="2">N° de veces</th><th colspan="5" class="grp">Metrado</th><th rowspan="2" class="c-total">Total</th><th rowspan="2" class="c-obs">Observación</th>
                </tr>
                <tr><th>Largo</th><th>Ancho</th><th>Alto</th><th>Lon.</th><th>Área</th><th>Vol.</th><th>Kg.</th><th>Und.</th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in filasVisibles" :key="i" :class="[`is-${r.tipo}`, { 'is-prop': r.propuesto, 'is-corr': r.corregido }]" :title="r.propuesto ? `Propuesto por el agente: ${r.propuesto}` : ''">
                  <td v-for="(v, c) in r.celdas" :key="c" :class="claseCelda(r, c)">
                    <input v-if="c === 1 && r.tipo === 'fila'" class="ag-cell is-text" :value="v" :aria-label="`Nombre de ${v}`" title="Renómbrala con el nombre del despacho: el término compartido requiere aprobación técnica" @change="renombrar(r, $event)" @keydown.enter="$event.target.blur()" />
                    <input v-else-if="editable(r, c)" class="ag-cell" :value="fmtCelda(v, c, false, r.acero)" inputmode="decimal" :aria-label="`${COLUMNAS_PLANILLA[c]} de ${r.celdas[1]}`" @focus="$event.target.select()" @change="editarCelda(r, c, $event)" @keydown.enter="$event.target.blur()" />
                    <template v-else>{{ c === 1 || c === 14 ? v : fmtCelda(v, c, c >= 8, r.acero) }}</template>
                    <span v-if="c === 1 && r.propuesto" class="ag-tag is-prop">propuesto</span>
                    <span v-if="c === 1 && r.corregido" class="ag-tag is-corr">corregido</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <ul v-if="met.datos.notas?.length" class="ag-notes">
              <li v-for="(n, j) in met.datos.notas" :key="j"><svg viewBox="0 0 24 24"><path :d="ICON.aviso" /></svg>{{ n }}</li>
            </ul>
          </div>
          <footer>
            <span v-if="met.error" class="ag-err">{{ met.error }}</span>
            <span v-else-if="met.guardado" class="ag-ok" role="status">{{ met.guardado }}</span>
            <button v-if="conteo.propuestas" type="button" class="ag-btn is-ghost" @click="confirmarPropuestas">Confirmar propuestas</button>
            <button type="button" class="ag-btn is-ghost" @click="met.abierto = false">Cerrar</button>
            <button type="button" class="ag-btn" :disabled="met.exportando" @click="exportarMetrado">{{ met.exportando ? "Exportando…" : "Exportar a Excel" }}</button>
          </footer>
        </section>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import {AGENTE_SERVIDOR, analizarResultado, respuestaHonesta, runAgent} from "../../ingenieria/agente/agentRunner.js";
import {CAMPOS_PROYECTO} from "../../ingenieria/laminas/rotulo.js";
import {CAMPOS_TECNICOS} from "../../ingenieria/criterios/datosProyecto.js";
import {COLUMNAS_PLANILLA, EDITABLES, corregirFila, filasPlanilla, renombrarFila} from "../../ingenieria/metrado/metrado.js";
import {plantillaDesdeEdicion} from "../../ingenieria/metrado/terminologia.js";
import {cargarEventosPendientes, registrarEvento, resolverEventoPendiente} from "../../ingenieria/aprendizaje/registro.js";
import {crearRevisionDePlano} from "../agente/revisionesPlano.js";
import {crearSesionDeDocumento, vincularDocumento} from "../agente/sesionDocumento.js";
import {referenciaDelDocumento} from "../../ingenieria/agente/referenciasProyecto.js";

const emit = defineEmits(["close", "foundation"]);

// Íconos de trazo (24x24), en el mismo lenguaje que NovaCadIcon.
const ICON = {
  conversar: "M4 4h16v12H9l-5 4zm4 5h8m-8 3h5",
  aprobar: "m5 12 4 4L19 6",
  analizar: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm5.3-2.2L21 21",
  estructura: "M3 21h18M5 21V9m14 12V9M3 9h18M8 9V5h8v4M9 21v-6h6v6",
  metrado: "M4 3h16v18H4zM4 8h16M4 13h16M4 18h16M10 3v18",
  revisar: "M9 12l2 2 4-4M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z",
  datos: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5",
  nueva: "M4 12a8 8 0 1 1 2.3 5.7M4 20v-4h4",
  menu: "M4 6h16M4 12h16M4 18h10",
  cerrar: "M6 6l12 12M18 6L6 18",
  foto: "M4 7h3l2-3h6l2 3h3v13H4zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  clip: "M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7",
  enviar: "M4 12l16-8-6 16-2.5-6.5z",
  detener: "M7 7h10v10H7z",
  aviso: "M12 3l10 18H2zm0 7v5m0 3v.5",
  chispa: "m12 2 2 7 7 3-7 2-2 8-2-8-7-2 7-3z",
  corregir: "M4 20h4L19 9l-4-4L4 16zm9-13 4 4",
  borrar: "M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3",
  capas: "m12 2 10 5-10 5L2 7zm-10 10 10 5 10-5",
  mapa: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
};

// Acciones directas: corren la herramienta sin pasar por el modelo de IA (sin costo y sin
// esperar al motor). El texto libre del cuadro de abajo sí va al modelo.
// Acciones del menú: la principal (paso a paso) arriba y destacada; el resto, cortas.
const CAPACIDADES = [
  {titulo: "Construir paso a paso", icono: "estructura", detalle: "Te pregunta lo dudoso y luego dibuja las láminas", herramienta: "construir_estructura", pedido: "Construye la estructura paso a paso", principal: true},
  {titulo: "Analizar", icono: "analizar", detalle: "Propone la estructura", herramienta: "proponer_estructura", pedido: "Analiza este plano y propón la estructura"},
  {titulo: "Estructurar", icono: "estructura", detalle: "Láminas directo", herramienta: "plano_estructuras", pedido: "Genera el plano de estructuras"},
  {titulo: "Metrar", icono: "metrado", detalle: "Partidas y Excel", herramienta: "metrar_estructura", pedido: "Saca el metrado de estructuras"},
  {titulo: "Revisar láminas", icono: "revisar", detalle: "Encimados y rótulo", herramienta: "revisar_laminas", pedido: "Revisa las láminas"},
];
const GENERAR = {texto: "Generar el plano de estructuras", herramienta: "plano_estructuras"};
const REVISAR = {texto: "Revisar las láminas", herramienta: "revisar_laminas"};

// Herramienta → paso visible, texto mientras trabaja y siguientes pasos sugeridos.
const PASOS = {
  proponer_estructura: {titulo: "Analicé la estructura", vivo: "Analizando la arquitectura…", icono: "analizar", siguientes: [GENERAR]},
  plano_estructuras: {titulo: "Generé las láminas de estructuras", vivo: "Leyendo la arquitectura y preparando los datos…", icono: "estructura", siguientes: [REVISAR]},
  metrar_estructura: {titulo: "Saqué el metrado", vivo: "Metrando la estructura…", icono: "metrado", siguientes: [REVISAR]},
  revisar_laminas: {titulo: "Revisé las láminas", vivo: "Revisando las láminas…", icono: "revisar", siguientes: []},
  corregir_estructura: {titulo: "Anoté la corrección", icono: "corregir", siguientes: [GENERAR]},
  datos_proyecto: {titulo: "Guardé los datos del proyecto", icono: "datos", siguientes: [GENERAR]},
  leer_estructura: {titulo: "Leí ejes y columnas", icono: "analizar", siguientes: [{texto: "Proponer la estructura", herramienta: "proponer_estructura"}]},
  vistas_plano: {titulo: "Revisé las vistas del plano", icono: "capas", siguientes: []},
  quitar_laminas: {titulo: "Quité las láminas", icono: "borrar", siguientes: []},
  preguntar_ingeniero: {titulo: "Te consulto una decisión", icono: "chispa", siguientes: []},
  estado_proyecto: {titulo: "Resumí en qué vamos", icono: "analizar", siguientes: [GENERAR]},
  ver_metrado: {titulo: "Revisé las partidas del metrado", icono: "metrado", siguientes: []},
  construir_estructura: {titulo: "Avancé la construcción", vivo: "Analizando la etapa…", icono: "estructura", siguientes: []},
};

// ---- Motor (solo su estado: proveedor, clave y modelo viven en el .env del servidor) ----
const settings = ref({...AGENTE_SERVIDOR});
const motor = ref({cargando: true, listo: false, mensaje: ""});
const motorListo = computed(() => motor.value.listo);
const vistaAgente = ref('asistente');
const revision = reactive({});
const revisionPlano = crearRevisionDePlano({estado: revision, cargar: cargarEventosPendientes, resolver: resolverEventoPendiente});
async function cargarPendientes() {
  await revisionPlano.cargarPendientes();
  if (revision.sinPermiso || !revision.activa) vistaAgente.value = 'asistente';
}
async function revisarEvento(id, accion) {
  await revisionPlano.revisarEvento(id, accion);
  if (revision.sinPermiso || !revision.activa) vistaAgente.value = 'asistente';
}
async function enviarCorreccion(evento, mensaje) {
  met.error = "";
  met.guardado = "Enviando la corrección para aprobación…";
  const resultado = await registrarEvento(evento);
  if (!resultado.ok) {
    met.error = resultado.error ?? "No se pudo enviar la corrección al servidor.";
    met.guardado = "";
    return;
  }
  met.error = "";
  met.guardado = `${mensaje} Enviada y pendiente de aprobación; todavía no está compartida con el agente.`;
  await cargarPendientes();
}
async function consultarMotor() {
  try {
    const r = await fetch("/software/etabs/agente/llm/estado", {headers: {Accept: "application/json"}, credentials: "same-origin"});
    const e = r.ok ? await r.json() : {listo: false, mensaje: "No pude consultar el motor del agente."};
    motor.value = {cargando: false, listo: Boolean(e.listo), mensaje: e.mensaje ?? ""};
    settings.value = {...AGENTE_SERVIDOR, memoria: e.memoria ?? "completa", vision: Boolean(e.vision), sinRazonar: e.memoria === "corta", analizarResultados: true};
    bibliotecaActiva = Boolean(e.biblioteca);
    estandarActivo = Boolean(e.estandar);
  } catch {
    motor.value = {cargando: false, listo: false, mensaje: "No pude consultar el motor del agente."};
  }
}

// ---- Datos del proyecto (formulario) ----
// Cada plano guarda sus datos (Hz, Df, zona, rótulo…): abrir otro DWG no hereda los del anterior.
// Solo especialista y CIP, que son del despacho, pasan de un proyecto a otro.
const PROYECTO_KEY = "predim-agente.proyecto";
const DEL_DESPACHO = ["especialista", "cip"];
const leerGuardado = (clave) => { try { return JSON.parse(localStorage.getItem(clave) || "{}"); } catch { return {}; } };
const planActual = ref(null); // null: aún no se cargó ningún plano
const claveDelPlan = () => `${PROYECTO_KEY}:${planActual.value || "sin-nombre"}`;
const proyecto = ref({});
function cargarProyecto(plan) {
  planActual.value = plan ?? "";
  const despacho = leerGuardado(PROYECTO_KEY);
  proyecto.value = {...Object.fromEntries(DEL_DESPACHO.filter((k) => despacho[k]).map((k) => [k, despacho[k]])), ...leerGuardado(claveDelPlan())};
}
const guardarProyecto = (datos) => {
  proyecto.value = {...proyecto.value, ...datos};
  try {
    localStorage.setItem(claveDelPlan(), JSON.stringify(proyecto.value));
    const despacho = Object.fromEntries(DEL_DESPACHO.filter((k) => proyecto.value[k]).map((k) => [k, proyecto.value[k]]));
    localStorage.setItem(PROYECTO_KEY, JSON.stringify(despacho));
  } catch { /* sin almacenamiento: vale para esta sesión */ }
};
const modal = reactive({abierto: false, modo: "editar", faltan: [], propuestos: [], vista: "", borrador: {}, resolver: null, consultas: [], informes: [], decisiones: {}});
// Rótulo sin los campos de ubicación (esos van en su sección, con los ubigeos).
const UBICACION = ["region", "provincia", "distrito", "localidad"];
const CAMPOS_ROTULO = CAMPOS_PROYECTO.filter((c) => !UBICACION.includes(c.campo));

// Ubigeos del Perú (departamento → provincia → distrito, con su zona sísmica E.030). Se cargan
// al abrir el formulario: al elegir el distrito, la zona sísmica se llena sola.
const ubigeo = ref(null);
const cargarUbigeo = () => ubigeo.value ? Promise.resolve() : import("../../../data/ubigeo.js").then((m) => { ubigeo.value = m.default; }).catch(() => {});
const norm = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
const buscar = (lista, nombre) => lista?.find((x) => norm(x.name) === norm(nombre)) ?? null;
const departamentoElegido = computed(() => buscar(ubigeo.value, modal.borrador.region));
const provinciaElegida = computed(() => buscar(departamentoElegido.value?.provinces, modal.borrador.provincia));
const distritoElegido = computed(() => buscar(provinciaElegida.value?.districts, modal.borrador.distrito));
// Opciones de cada lista; un valor guardado que no está en los ubigeos se conserva.
function opcionesUbigeo(campo) {
  const lista = campo === "region" ? ubigeo.value : campo === "provincia" ? departamentoElegido.value?.provinces : provinciaElegida.value?.districts;
  const nombres = (lista ?? []).map((x) => x.name);
  const actual = modal.borrador[campo];
  return actual && !nombres.some((n) => norm(n) === norm(actual)) ? [actual, ...nombres] : nombres;
}
function elegirUbigeo(campo, valor) {
  modal.borrador[campo] = valor;
  if (campo === "region") Object.assign(modal.borrador, {provincia: "", distrito: ""});
  if (campo === "provincia") modal.borrador.distrito = "";
  const d = distritoElegido.value;
  if (campo === "distrito" && d) {
    modal.borrador.zona = String(Number(d.zone));
    if (!modal.propuestos.includes("zona")) modal.propuestos.push("zona");
    modal.faltan = modal.faltan.filter((c) => c !== "zona");
  }
}
const marcaCampo = (campo) => ({"is-proposed": modal.propuestos.includes(campo), "is-missing": modal.faltan.includes(campo)});
// modo "pedido": antes de dibujar el plano. Los campos vacíos se llenan con lo que propone el
// agente (marcados para que el personal los revise); lo guardado no se toca.
function abrirDatos(modo = "editar", {faltan = [], sugeridos = {}, vista = "", consultas = [], informes = []} = {}) {
  const borrador = {...Object.fromEntries([...CAMPOS_TECNICOS, ...CAMPOS_PROYECTO].map((c) => [c.campo, ""])), ...proyecto.value};
  const propuestos = [];
  for (const [campo, valor] of Object.entries(sugeridos ?? {})) {
    if (valor === undefined || valor === null || String(borrador[campo] ?? "").trim() !== "") continue;
    borrador[campo] = typeof valor === "number" && campo !== "niveles" ? valor.toFixed(2) : String(valor);
    propuestos.push(campo);
  }
  modal.resolver?.(null);
  cargarUbigeo();
  // Consultas al ingeniero: arrancan marcadas con la recomendación del agente.
  const decisiones = Object.fromEntries(consultas.map((c) => [c.clave, String(c.recomendado)]));
  Object.assign(modal, {abierto: true, modo, faltan: faltan.filter((c) => !propuestos.includes(c)), propuestos, vista, borrador, consultas, informes, decisiones});
  return new Promise((resolve) => { modal.resolver = resolve; });
}
function cerrarDatos(datos) {
  if (datos) guardarProyecto(datos);
  modal.abierto = false;
  // Las decisiones van aparte de los datos del proyecto (no se guardan en el formulario).
  modal.resolver?.(datos ? {...datos, ...(modal.consultas.length ? {decisiones: {...modal.decisiones}} : {})} : null);
  modal.resolver = null;
}

// ---- Biblioteca de pórticos del despacho (opcional) ----
// Solo si el servidor la activó para este usuario (estado del agente) y solo al generar láminas:
// se pide una vez; con 403/404 o sin red se sigue sin biblioteca (el generador dibuja los pórticos).
let bibliotecaActiva = false;
let bibliotecaPromise = null;
const cargarBibliotecaPorticos = () => {
  if (!bibliotecaActiva) return Promise.resolve(null);
  return bibliotecaPromise ??= fetch("/software/etabs/agente/biblioteca/portico", {headers: {Accept: "application/json"}, credentials: "same-origin"})
    .then(async (r) => {
      if (r.status !== 200) return null;
      const j = await r.json();
      // archivo = id anónimo ("portico-007"): es lo que el resultado reporta como pieza usada.
      return Array.isArray(j?.piezas) && j.piezas.length ? {piezas: j.piezas.map((p) => ({...p, archivo: p.id}))} : null;
    })
    .catch(() => null);
};

// Detalles estándar del despacho (estribos, empalmes, nudo viga-columna, isométrico del aligerado…):
// aparte de los pórticos; con 403/404 o sin red las láminas salen sin ellos.
let estandarActivo = false;
let estandarPromise = null;
const cargarDetallesEstandar = () => {
  if (!estandarActivo) return Promise.resolve(null);
  return estandarPromise ??= fetch("/software/etabs/agente/biblioteca/estandar", {headers: {Accept: "application/json"}, credentials: "same-origin"})
    .then(async (r) => (r.status === 200 ? (await r.json())?.piezas ?? null : null))
    .catch(() => null);
};

// ---- Contexto del documento abierto (creado una vez) ----
let contextPromise = null;
const sesionDocumento = crearSesionDeDocumento();
const cargarVisor = () => import("@mlightcad/cad-simple-viewer");
const getContext = () => {
  const version = sesionDocumento.version();
  return contextPromise ??= Promise.all([
  cargarVisor(), import("@mlightcad/data-model"), import("../../ingenieria/cad/drawingContext.js"),
]).then(([viewer, dm, {createDrawingContext}]) => {
  if (version !== sesionDocumento.version()) throw new Error('El documento cambió. Vuelve a ejecutar el pedido.');
  const manager = viewer.AcApDocManager.instance;
  const documento = manager?.curDocument;
  const databaseActual = vincularDocumento(documento, () => manager?.curDocument);
  const ctx = createDrawingContext({
    getDatabase: databaseActual,
    dm,
    edit: (...args) => { databaseActual(); return viewer.acapRunDatabaseEdit(...args); },
    // Con caja (una lámina nueva) se encuadra esa zona; si no, zoom inteligente.
    afterDraw: (box) => {
      if (box && window.__novacadPrueba) window.__novacadPrueba.ultimaZona = box;
      const view = viewer.AcApDocManager.instance?.curView;
      if (box && view?.zoomTo) {
        view.zoomTo(new dm.AcGeBox2d({x: box.x0, y: box.y0}, {x: box.x1, y: box.y1}), 0.04 * (box.x1 - box.x0));
        return;
      }
      (view?.zoomToSmartExtents ?? view?.zoomToFitDrawing)?.call(view);
    },
    onFoundation: (payload) => emit("foundation", payload),
    onErase: () => viewer.AcApDocManager.instance?.curView?.selectionSet?.clear?.(),
    getProjectData: () => { databaseActual(); return {...proyecto.value}; },
    setProjectData: (datos) => { databaseActual(); guardarProyecto(datos); },
    // Se compone desde el contenido actual; no se copia un módulo fijo.
    loadTemplate: async () => {
      databaseActual();
      const biblioteca = await cargarBibliotecaPorticos();
      if (biblioteca) ctx.bibliotecaPorticos = biblioteca;
      const estandar = await cargarDetallesEstandar();
      if (estandar?.length) ctx.detallesEstandar = estandar;
      return {db: null, config: {modo: 'adaptativa', escalaPlanos: 1}};
    },
  });
  // Antes de dibujar el plano, el agente muestra los datos del proyecto para confirmarlos.
  ctx.nombreDocumento = () => { databaseActual(); return documento?.fileName || documento?.docTitle || ''; };
  ctx.referenciaActual = () => referenciaDelDocumento(ctx.nombreDocumento(), undefined, ctx.memoria?.estructura?.titulo);
  ctx.pedirDatos = ({faltan, sugeridos, vista, consultas, informes}) => { databaseActual(); return abrirDatos("pedido", {faltan, sugeridos, vista, consultas, informes}); };
  // mirar_plano: el agente ve el dibujo como imagen (solo con motor con visión y si el ingeniero
  // no lo desactivó en este proyecto; el aviso está bajo el cuadro de texto).
  Object.defineProperty(ctx, "permitirImagenes", {get: () => Boolean(settings.value.vision && verPlano.value), configurable: true});
  ctx.rasterizar = svgAJpeg;
  ctx.ultimoEnvioAprendizaje = null;
  ctx.registrarAprendizaje = async (evento) => {
    const resultado = await registrarEvento(evento);
    ctx.ultimoEnvioAprendizaje = resultado;
    if (resultado.ok) await cargarPendientes();
    return resultado;
  };
  return ctx;
});
};
function cambiarDocumento(doc) {
  if (!sesionDocumento.cambiar(doc)) return;
  controller.value?.abort();
  if (modal.abierto) cerrarDatos(null);
  met.abierto = false;
  contextPromise = null;
  runs.value = [];
  draftText.value = '';
  adjuntos.value = [];
  verMenu.value = false;
  cargarProyecto(doc?.docTitle || doc?.fileName || '');
  lecturaId++;
  lectura.value = {estado: 'vacio'};
  verLectura.value = false;
}
const cargarSkills = () => import("../../ingenieria/agente/skills/index.js");

// Prueba en el visor real (scripts/agente/ver-en-visor.mjs): herramientas sin modelo.
if (window.__NOVACAD_PRUEBA__) {
  window.__novacadPrueba = window.__novacadPrueba ?? {};
  window.__novacadPrueba.herramienta = async (nombre, args = {}) => {
    const [{SKILLS}, ctx] = await Promise.all([cargarSkills(), getContext()]);
    const skill = SKILLS.find((s) => s.name === nombre);
    if (!skill) throw new Error(`No existe la herramienta ${nombre}`);
    const pedir = ctx.pedirDatos;
    ctx.pedirDatos = null; // la prueba no abre formularios
    try { return JSON.parse(JSON.stringify(await skill.run(args, ctx))); } finally { ctx.pedirDatos = pedir; }
  };
  window.__novacadPrueba.lectura = () => JSON.parse(JSON.stringify(lectura.value));
}

// ---- Lectura de la arquitectura al importar el plano ----
const ESTADO_LECTURA = {leyendo: "Leyendo…", lista: "Listo", parcial: "Revisar", no: "No apto"};
const lectura = ref({estado: "vacio"});
const verLectura = ref(false);
const principal = computed(() => lectura.value.vistas?.find((v) => v.columnas > 0) ?? lectura.value.vistas?.[0] ?? null);
let lecturaId = 0;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function diagnosticar() {
  const id = ++lecturaId;
  let viewer, ctx, diag;
  try { [viewer, ctx, diag] = await Promise.all([cargarVisor(), getContext(), import("../../ingenieria/lectura/diagnostico.js")]); } catch { return; }
  if (id !== lecturaId) return;
  const doc = viewer.AcApDocManager.instance?.curDocument;
  const db = doc?.database;
  // Otro plano: sus propios datos del proyecto y la memoria del agente desde cero (propuesta,
  // estructura dibujada y metrado eran del plano anterior).
  if ((doc?.docTitle ?? "") !== planActual.value) {
    cargarProyecto(doc?.docTitle ?? "");
    ctx.memoria = {};
  }
  const cuenta = () => { try { return db.tables.blockTable.modelSpace.newIterator().toArray().length; } catch { return 0; } };
  if (!db || (!doc.fileName && !doc.uri && !cuenta())) {
    lectura.value = {estado: 'vacio'};
    return;
  }
  // Un plano grande se dibuja por tandas: se espera a que deje de crecer antes de leerlo.
  let previo = cuenta(), iguales = 0;
  if (previo) lectura.value = {estado: "leyendo", nombre: doc?.docTitle ?? ""};
  for (let i = 0; i < 360 && iguales < 2; i++) {
    await esperar(500);
    if (id !== lecturaId) return;
    const n = cuenta();
    iguales = n > 0 && n === previo ? iguales + 1 : 0;
    if (n && lectura.value.estado !== "leyendo") lectura.value = {estado: "leyendo", nombre: doc?.docTitle ?? ""};
    previo = n;
  }
  if (!previo) { lectura.value = {estado: "vacio"}; return; }
  await nextTick();
  delete ctx.memoria.lectura;
  try {
    const plan = ctx.readPlan();
    lectura.value = {...diag.diagnosticarLectura({database: db, items: plan.items, vistas: plan.vistas}), nombre: doc?.docTitle ?? ""};
  } catch (error) {
    lectura.value = {estado: "no", nombre: doc?.docTitle ?? "", resumen: `No pude leer el plano: ${error?.message ?? error}`, vistas: [], niveles: [], textos: 0, unidades: "", entidades: {total: 0, leidas: 0}, problemas: [], avisos: []};
  }
  verLectura.value = lectura.value.estado !== "lista";
}
let quitarEscucha = null;
let desmontado = false;
onMounted(async () => {
  consultarMotor();
  try {
    const manager = (await cargarVisor()).AcApDocManager.instance;
    if (desmontado) return;
    const alActivar = () => {
      cambiarDocumento(manager?.curDocument);
      revisionPlano.activar(manager?.curDocument).then(() => {
        if (revision.sinPermiso || !revision.activa) vistaAgente.value = 'asistente';
      });
      vistaAgente.value = 'asistente';
      diagnosticar();
    };
    const alCerrar = ({doc}) => {
      if (doc !== manager?.curDocument) return;
      cambiarDocumento(null);
      revisionPlano.activar(null);
      vistaAgente.value = 'asistente';
      lecturaId++;
      lectura.value = {estado: 'vacio'};
    };
    manager?.events?.documentActivated?.addEventListener(alActivar);
    manager?.events?.documentToBeDestroyed?.addEventListener(alCerrar);
    quitarEscucha = () => {
      manager?.events?.documentActivated?.removeEventListener(alActivar);
      manager?.events?.documentToBeDestroyed?.removeEventListener(alCerrar);
    };
    alActivar();
  } catch { /* sin visor: no hay plano que leer */ }
});
onBeforeUnmount(() => { desmontado = true; quitarEscucha?.(); revisionPlano.activar(null); lecturaId++; });

// ---- El agente mira el plano: SVG del dibujo → JPEG para el motor con visión ----
const CLAVE_VER_PLANO = "novacad.agente.verPlano";
const verPlano = ref((() => { try { return localStorage.getItem(CLAVE_VER_PLANO) !== "0"; } catch { return true; } })());
const puedeVerPlano = computed(() => Boolean(settings.value?.vision));
function cambiarVerPlano(valor) {
  verPlano.value = Boolean(valor);
  try { localStorage.setItem(CLAVE_VER_PLANO, verPlano.value ? "1" : "0"); } catch { /* solo esta sesión */ }
}
async function svgAJpeg(svg, lado = 1600, calidad = 0.85) {
  const url = URL.createObjectURL(new Blob([svg], {type: "image/svg+xml"}));
  try {
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(new Error("No pude convertir el dibujo en imagen.")); i.src = url; });
    const k = Math.min(1, lado / Math.max(img.width || lado, img.height || lado));
    const c = Object.assign(document.createElement("canvas"), {width: Math.round((img.width || lado) * k), height: Math.round((img.height || lado) * k)});
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", calidad);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---- Fotos de observaciones: comprimidas en el navegador antes de enviarlas ----
const fileRef = ref(null);
const adjuntos = ref([]);
async function comprimir(archivo, lado = 1600, calidad = 0.82) {
  const url = URL.createObjectURL(archivo);
  try {
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = url; });
    const k = Math.min(1, lado / Math.max(img.width, img.height));
    const c = Object.assign(document.createElement("canvas"), {width: Math.round(img.width * k), height: Math.round(img.height * k)});
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((ok) => c.toBlob(ok, "image/jpeg", calidad));
    return {url: c.toDataURL("image/jpeg", calidad), blob};
  } finally {
    URL.revokeObjectURL(url);
  }
}
// Captura pegada (Ctrl+V): la lámina marcada o la planilla del Excel, para que la IA la analice.
async function pegar(event) {
  const imagenes = [...(event.clipboardData?.items ?? [])].filter((it) => it.kind === "file" && it.type.startsWith("image/")).map((it) => it.getAsFile()).filter(Boolean);
  if (!imagenes.length) return;
  event.preventDefault();
  for (const f of imagenes.slice(0, 6 - adjuntos.value.length)) {
    try { adjuntos.value.push(await comprimir(f)); } catch { /* no es una imagen legible */ }
  }
}
async function adjuntar(event) {
  for (const f of [...event.target.files].slice(0, 6 - adjuntos.value.length)) {
    try { adjuntos.value.push(await comprimir(f)); } catch { /* no es una imagen legible */ }
  }
  event.target.value = "";
}
async function guardarObservacion(texto, fotos, ctx) {
  const form = new FormData();
  form.append("texto", texto);
  fotos.forEach((f, i) => form.append("fotos[]", f.blob, `foto-${i + 1}.jpg`));
  const rasgos = ctx?.memoria?.propuesta?.rasgos;
  if (rasgos) form.append("rasgos", JSON.stringify(rasgos));
  const token = document.querySelector('meta[name="csrf-token"]')?.content ?? "";
  try {
    const r = await fetch("/software/etabs/agente/observaciones", {method: "POST", body: form, credentials: "same-origin", headers: {Accept: "application/json", "X-CSRF-TOKEN": token, "X-Requested-With": "XMLHttpRequest"}});
    return r.ok;
  } catch { return false; }
}

// ---- Ejecuciones ----
const runs = ref([]);
const draftText = ref("");
const busy = ref(false);
const listRef = ref(null);
const controller = ref(null);

const estadoTono = computed(() => (busy.value ? "busy" : motor.value.cargando ? "idle" : motor.value.listo ? "ok" : "off"));
const estadoTexto = computed(() => (busy.value ? "Trabajando en tu plano…" : motor.value.cargando ? "Conectando…" : motor.value.listo ? "Listo · IA del despacho" : "Acciones directas · sin motor de IA"));

const scrollDown = () => nextTick(() => { if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight; });
const autoAlto = (e) => { e.target.style.height = "auto"; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`; };
const reset = () => { runs.value = []; verMenu.value = false; vistaAgente.value = 'asistente'; };
// Menú de acciones sin perder la conversación (se oculta al elegir una acción o escribir).
const verMenu = ref(false);
const menuRef = ref(null);
function irAlMenu() { vistaAgente.value = 'asistente'; verMenu.value = true; nextTick(() => menuRef.value?.scrollIntoView({behavior: "smooth", block: "start"})); }
const cancel = () => controller.value?.abort();

function nuevoRun(pedido, fotos = []) {
  vistaAgente.value = 'asistente';
  verMenu.value = false;
  const run = reactive({pedido, fotos, pasos: [], vivo: "Entendiendo el pedido…", respuesta: "", avisos: [], siguientes: [], opciones: [], metrado: null, meta: ""});
  runs.value.push(run);
  verLectura.value = lectura.value.estado !== "lista";
  scrollDown();
  return run;
}
function anotarPaso(run, step, desde) {
  const def = PASOS[step.tool] ?? {titulo: step.tool, icono: "chispa"};
  const sinCambios = step.result?.sinCambios || step.result?.omitida;
  const estado = step.result?.cancelado || sinCambios ? "skip" : step.result?.ok === false ? "error" : "ok";
  run.pasos.push({titulo: step.result?.cancelado ? "Cancelaste los datos del proyecto" : sinCambios ? "Sin cambios en el plano" : def.titulo, icono: def.icono, estado, seg: `${((performance.now() - desde) / 1000).toFixed(1)} s`});
  scrollDown();
}
// Cierre común (modelo o acción directa): respuesta, avisos, siguientes pasos y metrado.
async function cerrarRun(run, steps, reply, inicio, ctx) {
  // Los avisos van en su recuadro: no se repiten dentro de la respuesta.
  let respuesta = String(reply ?? "").split("\n").filter((l) => !l.startsWith("Aviso: ")).join("\n").trim();
  const puedeEnviarAprendizaje = steps.some((s) => ["corregir_estructura", "datos_proyecto"].includes(s.tool));
  if (puedeEnviarAprendizaje && ctx?.ultimoEnvioAprendizaje) {
    respuesta = respuesta.replace(/Lo aplico en este plano y lo tendré en cuenta en los parecidos\.?/gi, "").trim();
    respuesta += ctx.ultimoEnvioAprendizaje.ok
      ? " Enviada y pendiente de aprobación; no se compartirá hasta que se apruebe."
      : " No se pudo enviar la corrección; no se compartirá hasta que se envíe y apruebe.";
  }
  run.respuesta = respuesta;
  run.avisos = [...new Set(steps.flatMap((s) => s.result?.avisos ?? []))].slice(0, 6);
  const hechos = steps.filter((s) => s.result?.ok !== false);
  const ultimo = hechos.at(-1);
  const sig = [...(PASOS[ultimo?.tool]?.siguientes ?? [])];
  if (ultimo?.tool === "revisar_laminas" && ultimo.result?.encimados) sig.unshift({texto: "Corregir los textos encimados", herramienta: "revisar_laminas", args: {corregir: true}});
  run.siguientes = sig.slice(0, 2);
  // El agente preguntó algo: sus opciones van como botones (un clic responde por el chat).
  run.opciones = hechos.findLast((s) => s.result?.opciones?.length)?.result.opciones ?? [];
  if (run.opciones.length) run.siguientes = [];
  if (hechos.some((s) => s.tool === "metrar_estructura")) {
    run.metrado = "listo";
    const ctx = await getContext();
    if (ctx.memoria.metrado) mostrarMetrado(ctx.memoria.metrado);
  } else if (hechos.some((s) => s.tool === "plano_estructuras")) {
    run.metrado = "disponible";
  }
  run.meta = `${((performance.now() - inicio) / 1000).toFixed(1)} s`;
}

// Acción directa: la herramienta corre en el navegador, sin el modelo de IA.
async function ejecutar(herramienta, args = {}, pedido = herramienta) {
  if (busy.value) return;
  // Las acciones del cliente siguen el mismo ciclo de IA que una instrucción escrita.
  if (motorListo.value) return send(pedido, {herramienta, args});
  const run = nuevoRun(pedido);
  busy.value = true;
  const inicio = performance.now();
  try {
    const [{SKILLS}, ctx] = await Promise.all([cargarSkills(), getContext()]);
    const skill = SKILLS.find((s) => s.name === herramienta);
    if (!skill) throw new Error(`No conozco la acción ${herramienta}.`);
    run.vivo = PASOS[herramienta]?.vivo ?? "Trabajando…";
    if (ctx.memoria) ctx.memoria.ultimoPedido = pedido;
    ctx.ultimoEnvioAprendizaje = null;
    let result;
    try { result = await skill.run({...args}, ctx); } catch (error) { result = {ok: false, error: error?.message ?? String(error)}; }
    const step = {tool: herramienta, args, result};
    anotarPaso(run, step, inicio);
    let reply = result?.cancelado ? "No dibujé el plano: cancelaste los datos del proyecto." : respuestaHonesta("", [step]);
    // Con motor de IA listo, el agente analiza lo que acaba de hacer (riesgos y siguiente paso).
    if (motorListo.value && !result?.cancelado && !result?.opciones?.length && result?.ok !== false) {
      run.vivo = "Analizando el resultado…";
      const analisis = await analizarResultado({text: pedido, steps: [step], settings: settings.value, context: ctx}).catch(() => null);
      if (analisis) reply += `

Análisis: ${analisis}`;
    }
    await cerrarRun(run, [step], reply, inicio, ctx);
  } catch (error) {
    run.respuesta = error?.message ?? String(error);
  } finally {
    run.vivo = "";
    busy.value = false;
    scrollDown();
  }
}

// Pedido libre: va al modelo de IA del servidor, que elige las herramientas.
async function send(text = draftText.value, accionSolicitada = null) {
  const value = text.trim() || (adjuntos.value.length ? "Revisa estas observaciones" : "");
  if (!value || busy.value || !motorListo.value) return;
  const fotos = adjuntos.value.splice(0);
  draftText.value = "";
  const history = runs.value.flatMap((r) => [{role: "user", content: r.pedido, imagenes: r.fotos}, ...(r.respuesta ? [{role: "assistant", content: r.respuesta}] : [])]);
  const run = nuevoRun(value, fotos.map((f) => f.url));
  busy.value = true;
  controller.value = new AbortController();
  const inicio = performance.now();
  let marca = inicio;
  try {
    const ctx = await getContext();
    // Lo que el modelo sabe del plano abierto: solo conteos (nunca el nombre del archivo).
    ctx.resumenPlano = () => {
      const l = lectura.value;
      if (!l || ["vacio", undefined].includes(l.estado)) return "ninguno (pide al ingeniero que abra la arquitectura)";
      if (l.estado === "leyendo") return "cargándose";
      const vs = l.vistas ?? [];
      return `${vs.length} vista(s) con ejes, ${vs.reduce((a, v) => a + (v.columnas ?? 0), 0)} columnas leídas${l.niveles?.length ? `, ${l.niveles.length} nivel(es)` : ""}`;
    };
    const guardada = fotos.length ? guardarObservacion(value, fotos, ctx) : Promise.resolve(false);
    ctx.ultimoEnvioAprendizaje = null;
    const out = await runAgent({
      text: value, imagenes: fotos.map((f) => f.url), history, accionSolicitada, settings: settings.value, context: ctx, signal: controller.value.signal,
      onProgress: ({mensaje}) => { run.vivo = mensaje; },
      onStep: (step) => { anotarPaso(run, step, marca); marca = performance.now(); },
    });
    await cerrarRun(run, out.steps, out.steps.some((s) => s.result?.cancelado) ? "No dibujé el plano: cancelaste los datos del proyecto." : out.reply, inicio, ctx);
    if (fotos.length) run.avisos.unshift((await guardada) ? `Guardé ${fotos.length} imagen(es) como referencia del proyecto.` : "No pude guardar las imágenes de referencia; inténtalo de nuevo.");
  } catch (error) {
    run.respuesta = error?.name === "AbortError" ? "Pedido detenido." : error?.message ?? String(error);
  } finally {
    run.vivo = "";
    busy.value = false;
    controller.value = null;
    scrollDown();
  }
}

// ---- Metrado ----
const met = reactive({abierto: false, datos: null, filtro: "todo", exportando: false, error: "", guardado: ""});
const fmtRel = (v) => (v >= 10 ? Math.round(v).toString() : v.toFixed(v >= 1 ? 2 : 3));
// Primero lo que está fuera del rango del despacho.
const contrasteOrdenado = computed(() => [...(met.datos?.contraste ?? [])].sort((a, b) => Number(a.dentro) - Number(b.dentro)));
const partidasMet = computed(() => (met.datos?.partidas ?? []).filter((p) => !p.titulo));
const fmt = (v) => (Number.isFinite(v) ? v.toLocaleString("es-PE", {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "—");
// Filas de la planilla (las mismas del Excel); se recalculan solas al corregir una medida.
const filasMet = computed(() => (met.datos ? filasPlanilla(met.datos) : []));
// Cuánto del metrado sale solo (plano y datos confirmados) y cuánto queda por revisar.
const conteo = computed(() => {
  const filas = filasMet.value.filter((r) => r.tipo === "fila");
  const propuestas = filas.filter((r) => r.propuesto).length;
  return {filas: filas.length, propuestas, corregidas: filas.filter((r) => r.corregido).length, automatico: filas.length ? Math.round((100 * (filas.length - propuestas)) / filas.length) : 0};
});
// Con filtro: la partida y sus filas que lo cumplen (con el título de la partida para ubicarse).
const filasVisibles = computed(() => {
  if (met.filtro === "todo") return filasMet.value;
  const cumple = (r) => (met.filtro === "propuestas" ? r.propuesto : r.corregido);
  const partidas = new Set(filasMet.value.filter((r) => r.tipo === "fila" && cumple(r)).map((r) => r.ip));
  return filasMet.value.filter((r) => (r.tipo === "partida" && partidas.has(r.ip)) || (r.tipo === "fila" && cumple(r)));
});
const DECIMALES = {3: 0, 7: 0};
// kg/m del acero (columna Vol.) con 3 decimales; el resto con 2; elementos y veces enteros.
const fmtCelda = (v, c, agrupar = c >= 8, acero = false) => (typeof v === "number" ? v.toLocaleString("es-PE", {minimumFractionDigits: DECIMALES[c] ?? 2, maximumFractionDigits: acero && c === 10 ? 3 : DECIMALES[c] ?? 2, useGrouping: agrupar}) : v ?? "");
// Campo que se corrige en la columna c de una fila (o null si la celda no se edita).
const campoDe = (r, c) => (r.tipo !== "fila" ? null : r.acero ? EDITABLES.acero[c] ?? null : r.calculado ? EDITABLES.concreto[c] ?? null : c >= 8 && c <= 12 && r.celdas[c] !== null ? "parcial" : null);
const editable = (r, c) => Boolean(campoDe(r, c)) && (r.celdas[c] !== null || campoDe(r, c) !== "parcial");
const claseCelda = (r, c) => ({"c-item": c === 0, "c-desc": c === 1, num: c >= 3 && c <= 13, "c-total": c === 13, "c-obs": c === 14, "is-sum": r.tipo === "fila" && c >= 8 && c <= 12 && r.celdas[c] !== null});
function editarCelda(r, c, ev) {
  const p = met.datos.partidas[r.ip], f = p.filas[r.jf], campo = campoDe(r, c);
  const valor = Number(String(ev.target.value).replace(/\s/g, "").replace(",", "."));
  const antes = corregirFila(met.datos, {partida: p.item, fila: f.descripcion, campo, valor});
  if (antes === undefined) { ev.target.value = fmtCelda(r.celdas[c], c, false, r.acero); met.error = "Escribe un número (usa punto o coma decimal)."; return; }
  met.error = "";
  enviarCorreccion(
    {tipo: "correccion", clave: "metrado", partida: p.item, fila: f.descripcion, campo, valor, propuesto: typeof antes === "number" ? antes : null, rasgos: met.datos.rasgos ?? {}},
    `Corregí ${COLUMNAS_PLANILLA[c].toLowerCase()} de "${f.descripcion}".`,
  );
}
// El nombre se cambia en esta planilla; los términos compartidos esperan aprobación técnica.
function renombrar(r, ev) {
  const p = met.datos.partidas[r.ip], f = p.filas[r.jf];
  const antes = f.descripcion, nuevo = ev.target.value.trim();
  const r2 = renombrarFila(met.datos, {partida: p.item, fila: antes, nuevo});
  if (!r2) { ev.target.value = antes; return; }
  met.error = "";
  if (r2.termino) {
    enviarCorreccion(
      {tipo: "correccion", clave: "termino", termino: r2.termino, valor: plantillaDesdeEdicion(nuevo, r2.vars), propuesto: antes, rasgos: met.datos.rasgos ?? {}},
      `Renombré "${antes}" como "${nuevo}".`,
    );
  } else {
    met.guardado = `Renombré "${antes}" como "${nuevo}" en esta planilla.`;
  }
}
function confirmarPropuestas() {
  for (const p of met.datos.partidas) for (const f of p.filas ?? []) if (f.propuesto) f.propuesto = null;
  met.guardado = "Confirmé las filas propuestas: el Excel sale sin marcas de revisión.";
}
function mostrarMetrado(datos) {
  Object.assign(met, {abierto: true, datos, filtro: "todo", error: "", guardado: ""});
}
// Desde el aviso del plano: se recalcula con la estructura dibujada (rápido y sin IA).
async function verMetrado(run) {
  const [{SKILLS}, ctx] = await Promise.all([cargarSkills(), getContext()]);
  if (!ctx.memoria.modeloEstructural) { await ejecutar("metrar_estructura", {}, "Sacar el metrado de estructuras"); return; }
  // Si ya se revisó en esta sesión, se reabre con sus correcciones.
  if (ctx.memoria.metrado && run.metrado === "listo") { mostrarMetrado(ctx.memoria.metrado); return; }
  try {
    const r = await SKILLS.find((s) => s.name === "metrar_estructura").run({}, ctx);
    if (r.ok === false) throw new Error(r.error);
    run.metrado = "listo";
    mostrarMetrado(ctx.memoria.metrado);
  } catch (error) {
    run.avisos.push(`No pude sacar el metrado: ${error?.message ?? error}`);
  }
}
async function exportarMetrado() {
  met.exportando = true;
  met.error = "";
  try {
    const {descargarPlanilla} = await import("../../ingenieria/metrado/planillaExcel.js");
    const nombre = `METRADOS_ESTRUCTURAS_${String(met.datos.proyecto ?? "PROYECTO").replace(/[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ]+/g, "_").slice(0, 40)}.xlsx`;
    await descargarPlanilla(met.datos, nombre, {datos: {...proyecto.value}});
  } catch (error) {
    met.error = `No pude exportar: ${error?.message ?? error}`;
  } finally {
    met.exportando = false;
  }
}
</script>

<style scoped>
.ag, .ag-modal-bg { --ag-a:#5b8cff;--ag-b:#a46bff;--ag-glow:rgba(91,140,255,.35); }
.ag {
  position:absolute;top:60px;right:64px;bottom:56px;display:flex;flex-direction:column;width:min(420px,calc(100% - 24px));min-height:0;overflow:hidden;
  border:1px solid var(--pr-line);border-radius:16px;background:var(--pr-panel);color:var(--pr-text);
  box-shadow:0 24px 60px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.02) inset; }
.ag svg, .ag-modal svg { width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round; }

.ag-head { display:flex;flex:none;align-items:center;gap:4px;padding:14px 12px; }
.ag-who { flex:1;min-width:0; }
.ag-who h2 { margin:0;font-size:15px;font-weight:700;letter-spacing:.1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ag-who p { display:flex;align-items:center;gap:6px;margin:2px 0 0;font-size:11.5px;color:var(--pr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ag-dot { width:7px;height:7px;border-radius:50%;background:var(--pr-muted);flex:none; }
.is-ok .ag-dot { background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18); }
.is-busy .ag-dot { background:var(--ag-a);animation:ag-pulse 1.2s ease-in-out infinite; }
.is-off .ag-dot { background:#f59e0b; }
.ag-orb { position:relative;width:34px;height:34px;flex:none;border-radius:11px;background:conic-gradient(from 210deg,var(--ag-a),var(--ag-b),#38bdf8,var(--ag-a));box-shadow:0 6px 18px var(--ag-glow); }
.ag-orb i { position:absolute;inset:7px;border-radius:7px;background:var(--pr-panel);mask:radial-gradient(circle,transparent 3px,#000 3.5px); }
.ag-orb i::after { content:"";position:absolute;inset:3px;border-radius:50%;background:linear-gradient(135deg,var(--ag-a),var(--ag-b)); }
.ag-orb.is-small { width:30px;height:30px;border-radius:10px; }
.ag-icon { display:inline-grid;place-items:center;width:32px;height:32px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--pr-muted);cursor:pointer; }
.ag-icon:hover:not(:disabled) { border-color:var(--pr-line);background:var(--pr-soft);color:var(--pr-text); }
.ag-icon:disabled { opacity:.45;cursor:default; }

.ag-nav { display:flex;flex:none;gap:20px;padding:0 16px;border-bottom:1px solid var(--pr-line); }
.ag-nav > button { display:flex;align-items:center;gap:7px;position:relative;padding:10px 0 12px;border:0;background:transparent;color:var(--pr-muted);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer; }
.ag-nav > button[aria-current] { color:var(--pr-text); }
.ag-nav > button svg { width:15px;height:15px; }
.ag-nav > button[aria-current]::after { content:"";position:absolute;inset:auto 0 -1px;height:2px;background:var(--ag-a); }
.ag-count { padding:1px 6px;border-radius:5px;background:var(--pr-soft);color:var(--pr-muted);font-size:11px;font-variant-numeric:tabular-nums; }
.ag-review-alert { color:#ef4444; }
.ag-feed { flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--pr-line) transparent;display:flex;flex-direction:column;gap:20px;padding:16px; }
.ag-feed > * { flex-shrink:0; }
.ag-section-heading h3 { display:flex;align-items:center;gap:8px;margin:0;font-size:15px; }
.ag-section-heading h3 svg { color:var(--ag-a); }
.ag-section-heading p { margin:5px 0 16px;color:var(--pr-muted);font-size:12px;line-height:1.5; }
.ag-empty { margin:24px 0;padding:20px 12px;text-align:center;color:var(--pr-muted);font-size:13px; }
.ag-review-list { list-style:none;margin:0;padding:0;display:grid;gap:12px; }
.ag-review-list > li { min-width:0;padding:14px;border:1px solid var(--pr-line);border-radius:10px;background:var(--pr-soft);font-size:12.5px;overflow-wrap:anywhere; }
.ag-review-list > li > div > small { display:block;margin-top:8px;color:var(--pr-muted);line-height:1.5; }
.ag-review-list > li > div > small.ag-err { color:#ef4444; }
.ag-review-values, .ag-review-context { margin:10px 0;display:grid;gap:6px; }
.ag-review-values > div, .ag-review-context > div { display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px; }
.ag-review-values dt, .ag-review-context dt { color:var(--pr-muted); }
.ag-review-values dd, .ag-review-context dd { margin:0; }
.ag-review-context { padding:10px 0;font-size:11.5px;line-height:1.5; }
.ag-revision-actions { display:flex;gap:8px;margin-top:14px; }
.ag-revision-actions .ag-btn, .ag-review .ag-link { display:inline-flex;align-items:center;justify-content:center;gap:6px; }
.ag-revision-actions svg, .ag-review .ag-link svg { width:14px;height:14px; }
.ag :is(button,summary,textarea):focus-visible, .ag-modal :is(button,summary):focus-visible { outline:2px solid var(--ag-a);outline-offset:3px; }
.ag-chevron { color:var(--pr-muted);font-size:18px; }
.ag-chevron.is-open { transform:rotate(180deg); }

/* Lectura de la arquitectura */
.ag-read { --tono:var(--ag-a);border:1px solid var(--pr-line);border-radius:10px;background:var(--pr-soft);padding:12px; }
.ag-read.is-lista { --tono:#22c55e; }
.ag-read.is-parcial { --tono:#f59e0b; }
.ag-read.is-no { --tono:#ef4444; }
.ag-read:is(.is-no,.is-parcial) { border-left:3px solid var(--tono); }
.ag-read-head { display:flex;align-items:center;gap:10px;width:100%;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer; }
.ag-read-ic { display:inline-grid;place-items:center;width:28px;height:28px;flex:none;border-radius:8px;background:var(--pr-panel);border:1px solid var(--pr-line);color:var(--tono); }
.ag-read-ic svg { width:15px;height:15px; }
.ag-read-t { flex:1;min-width:0;display:grid; }
.ag-read-t strong { font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ag-read-t small { font-size:11px;color:var(--pr-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.ag-pill { flex:none;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:600;color:var(--tono);background:color-mix(in srgb,var(--tono) 14%,transparent); }
.ag-read-sum { margin:8px 0 0;font-size:12.5px;line-height:1.45; }
.ag-stats { display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0 0; }
.ag-stats div { padding:6px 8px;border-radius:9px;background:var(--pr-panel);border:1px solid var(--pr-line); }
.ag-stats dt { font-size:10.5px;color:var(--pr-muted); }
.ag-stats dd { margin:0;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums; }
.ag-views { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-views li { display:grid;gap:1px;padding-left:10px;border-left:2px solid var(--pr-line);font-size:11.5px; }
.ag-views li.is-ok { border-left-color:#22c55e; }
.ag-views span { color:var(--pr-muted); }
.ag-read-line { margin:8px 0 0;font-size:11px;color:var(--pr-muted); }
.ag-problems { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-problems > li { display:flex;gap:8px;padding:8px 9px;border-radius:9px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.28);font-size:11.8px;line-height:1.4; }
.ag-problems svg { flex:none;width:15px;height:15px;color:#ef4444;margin-top:1px; }
.ag-problems small { display:block;margin-top:3px;color:var(--pr-muted); }
.ag-more { margin-top:8px;font-size:11.5px; }
.ag-more summary { cursor:pointer;color:var(--pr-muted); }
.ag-more ul { margin:6px 0 0;padding-left:16px;display:grid;gap:4px;color:var(--pr-muted);line-height:1.4; }
.ag-link { margin-top:8px;padding:0;border:0;background:none;color:var(--ag-a);font:inherit;font-size:11.5px;cursor:pointer; }
.ag-link:disabled { opacity:.5;cursor:default; }

.ag-start h3 { margin:2px 0 4px;font-size:16px;font-weight:700; }
.ag-start > p { margin:0 0 14px;font-size:12.5px;line-height:1.5;color:var(--pr-muted); }
.ag-caps { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 8px; }
.ag-cap.is-principal { grid-column:1 / -1;margin-bottom:6px;padding:14px 12px;border:1px solid color-mix(in srgb,var(--ag-a) 55%,var(--pr-line));background:color-mix(in srgb,var(--ag-a) 8%,var(--pr-soft)); }
.ag-cap.is-principal strong { font-size:14px; }
.ag-cap { display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:8px;row-gap:2px;align-items:center;padding:10px 6px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--pr-text);text-align:left;font-family:inherit;cursor:pointer;transition:background .15s; }
.ag-cap:hover:not(:disabled) { background:var(--pr-soft);border-color:var(--pr-line); }
.ag-cap:disabled { opacity:.55;cursor:default; }
.ag-cap-ic { grid-row:1 / 3;display:inline-grid;place-items:center;width:28px;height:28px;color:var(--ag-a); }
.ag-cap strong { font-size:13px; }
.ag-cap small { grid-column:2;font-size:11.5px;line-height:1.35;color:var(--pr-muted); }

.ag-run { display:grid;gap:8px; }
.ag-ask { justify-self:end;max-width:88%;padding:10px 12px;border:1px solid var(--pr-line);border-radius:12px 12px 4px 12px;background:var(--pr-soft);color:var(--pr-text);font-size:13px; }
.ag-ask p { margin:0;white-space:pre-wrap; }
.ag-thumbs { display:flex;gap:4px;margin-top:6px; }
.ag-thumbs img { width:46px;height:46px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.4); }
.ag-work { min-width:0;padding:4px 0 12px;border-bottom:1px solid var(--pr-line); }
.ag-steps { list-style:none;margin:0 0 8px;padding:0;display:grid;gap:2px; }
.ag-steps li { position:relative;display:grid;grid-template-columns:24px 1fr auto;align-items:center;gap:8px;padding:5px 0;font-size:12.5px; }
.ag-steps li + li::before { content:"";position:absolute;left:11px;top:-6px;height:10px;border-left:1px dashed var(--pr-line); }
.ag-step-ic { display:inline-grid;place-items:center;width:24px;height:24px;border-radius:7px;background:var(--pr-panel);border:1px solid var(--pr-line);color:var(--ag-a); }
.ag-step-ic svg { width:14px;height:14px; }
.is-error .ag-step-ic { color:#ef4444; }
.is-skip .ag-step-ic, .is-skip .ag-step-txt { color:var(--pr-muted); }
.ag-step-t { font-size:11px;color:var(--pr-muted);font-variant-numeric:tabular-nums; }
.is-ok .ag-step-t { color:#22c55e; }
.is-error .ag-step-t { color:#ef4444; }
.ag-thinking { padding:4px 0 2px;font-size:12.5px; }
.ag-activity { margin:0 0 8px; }
.ag-activity summary { cursor:pointer;color:var(--pr-muted);font-size:12px;padding:4px 0; }
.ag-shimmer { background:linear-gradient(90deg,var(--pr-muted) 0%,var(--pr-text) 50%,var(--pr-muted) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ag-shine 1.6s linear infinite; }
.ag-answer { margin:0;font-size:13px;line-height:1.55;white-space:pre-wrap; }
.ag-notes { list-style:none;margin:10px 0 0;padding:0;display:grid;gap:6px; }
.ag-notes li { display:flex;gap:7px;align-items:flex-start;padding:7px 9px;border-radius:9px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.28);font-size:11.8px;line-height:1.4; }
.ag-notes svg { flex:none;width:15px;height:15px;color:#f59e0b;margin-top:1px; }
.ag-ready { display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px;border-radius:11px;border:1px solid color-mix(in srgb,var(--ag-a) 45%,transparent);background:linear-gradient(135deg,rgba(91,140,255,.12),rgba(164,107,255,.12)); }
.ag-ready-ic { display:inline-grid;place-items:center;width:30px;height:30px;flex:none;border-radius:9px;background:linear-gradient(135deg,var(--ag-a),var(--ag-b));color:#fff; }
.ag-ready-ic svg { width:16px;height:16px; }
.ag-ready div { flex:1;min-width:0;display:grid; }
.ag-ready strong { font-size:12.5px; }
.ag-ready small { font-size:11px;color:var(--pr-muted);line-height:1.35; }
.ag-options { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
.ag-options button { padding:7px 12px;border:1px solid var(--ag-a);border-radius:8px;background:var(--pr-panel);color:var(--pr-text);font:inherit;font-size:12.5px;cursor:pointer; }
.ag-options button.is-rec { background:var(--ag-a);color:#fff; }
.ag-options button small { opacity:.85; }
.ag-next { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
.ag-next button { padding:6px 10px;border:1px solid var(--pr-line);border-radius:999px;background:var(--pr-panel);color:var(--pr-text);font:inherit;font-size:12px;cursor:pointer; }
.ag-next button:hover { border-color:var(--ag-a);color:var(--ag-a); }
.ag-meta { display:block;margin-top:8px;font-size:10.5px;color:var(--pr-muted); }

.ag-compose { flex:none;padding:12px;border-top:1px solid var(--pr-line); }
.ag-compose-help { margin:7px 4px 0;color:var(--pr-muted);font-size:10.5px;line-height:1.4; }
.ag-ver-plano { display:flex;align-items:flex-start;gap:6px;cursor:pointer; }
.ag-ver-plano input { margin:1px 0 0;flex:none; }
.ag-attach { display:flex;gap:6px;margin-bottom:8px; }
.ag-chip-img { position:relative; }
.ag-chip-img img { width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid var(--pr-line); }
.ag-chip-img button { position:absolute;top:-6px;right:-6px;width:18px;height:18px;border:0;border-radius:50%;background:#111827;color:#fff;font-size:10px;cursor:pointer; }
.ag-box { display:flex;align-items:flex-end;gap:6px;padding:6px;border:1px solid var(--pr-line);border-radius:14px;background:var(--fz-input, var(--pr-soft));transition:border-color .15s,box-shadow .15s; }
.ag-box:focus-within { border-color:var(--ag-a);box-shadow:0 0 0 3px rgba(91,140,255,.15); }
.ag-box textarea { flex:1;min-width:0;min-height:32px;max-height:140px;resize:none;padding:6px 4px;border:0;outline:0;background:transparent;color:var(--pr-text);font:inherit;font-size:13px;line-height:1.45; }
.ag-send { display:inline-grid;flex:none;place-items:center;width:34px;height:34px;border:0;border-radius:10px;background:var(--fz-accent,var(--ag-a));color:#fff;cursor:pointer; }
.ag-send:disabled { opacity:.4;cursor:default;box-shadow:none; }
.ag-send.is-stop { background:#ef4444;box-shadow:none; }

/* Modales */
.ag-modal-bg { position:fixed;inset:0;z-index:2000;display:grid;place-items:center;padding:16px;background:rgba(5,10,20,.55);backdrop-filter:blur(3px); }
.ag-modal { display:flex;flex-direction:column;width:min(640px,100%);max-height:calc(100vh - 32px);overflow:hidden;border:1px solid var(--pr-line);border-radius:16px;background:var(--pr-panel);color:var(--pr-text);box-shadow:0 30px 80px rgba(0,0,0,.5); }
.ag-modal.is-wide { width:min(920px,100%); }
.ag-modal header { display:flex;gap:12px;align-items:flex-start;padding:18px 20px 12px; }
.ag-modal h3 { margin:0;font-size:16px; }
.ag-modal header p { margin:4px 0 0;font-size:12.5px;line-height:1.45;color:var(--pr-muted); }
.ag-modal-body { overflow:auto;padding:4px 20px 16px; }
.ag-modal h4 { margin:12px 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--pr-muted); }
.ag-grid { display:grid;grid-template-columns:1fr 1fr;gap:10px 12px; }
.ag-consulta-intro { margin:0 0 8px;font-size:12px;color:var(--pr-muted); }
.ag-consulta { margin:0 0 10px;padding:10px 12px;border:1px solid var(--pr-line);border-radius:10px; }
.ag-consulta legend { padding:0 4px;font-size:12.5px;font-weight:600; }
.ag-opcion { display:flex;gap:8px;align-items:center;padding:3px 0;font-size:12.5px;cursor:pointer; }
.ag-opcion em { font-style:normal;color:var(--ag-a);font-weight:600; }
.ag-consulta small { display:block;margin-top:4px;font-size:11.5px;line-height:1.4;color:var(--pr-muted); }
.ag-informes { margin:0 0 8px;padding-left:18px;font-size:12px;color:var(--pr-muted); }
.ag-grid label { display:grid;gap:4px;font-size:12px; }
.ag-grid label.is-wide { grid-column:1 / -1; }
.ag-grid label span { color:var(--pr-muted); }
.ag-grid label.is-missing span::after { content:" · falta";color:#f59e0b; }
.ag-grid label.is-proposed span::after { content:" · propuesto";color:var(--ag-a); }
.ag-grid label.is-proposed :is(input,select) { border-color:color-mix(in srgb,var(--ag-a) 60%,transparent);background:color-mix(in srgb,var(--ag-a) 8%,var(--fz-input, var(--pr-soft))); }
.ag-grid :is(input,select) { height:36px;padding:0 10px;border:1px solid var(--pr-line);border-radius:9px;background:var(--fz-input, var(--pr-soft));color:var(--pr-text);font:inherit;font-size:13px; }
.ag-grid input::placeholder { color:var(--pr-muted);opacity:.7; }
.ag-grid :is(input,select):focus { outline:0;border-color:var(--ag-a);box-shadow:0 0 0 3px rgba(91,140,255,.15); }
.ag-modal footer { display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 20px 16px;border-top:1px solid var(--pr-line); }
.ag-btn { height:36px;padding:0 16px;border:0;border-radius:10px;background:var(--fz-accent,var(--ag-a));color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap; }
.ag-btn:disabled { opacity:.6;cursor:default; }
.ag-btn.is-sm { height:30px;padding:0 12px;font-size:12px; }
.ag-btn.is-ghost { border:1px solid var(--pr-line);background:transparent;color:var(--pr-text);font-weight:500; }
.ag-err { margin-right:auto;font-size:12px;color:#ef4444; }

.ag-tiles { display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:0 20px 10px; }
.ag-tiles div { display:grid;padding:10px 12px;border-radius:12px;border:1px solid var(--pr-line);background:var(--pr-soft); }
.ag-tiles small { font-size:11px;color:var(--pr-muted); }
.ag-tiles strong { font-size:19px;font-variant-numeric:tabular-nums;line-height:1.3; }
.ag-tiles span { font-size:11px;color:var(--pr-muted); }
.ag-ok { margin-right:auto;font-size:12px;color:#22c55e; }
.ag-ubigeo { display:flex;gap:8px;align-items:center;margin:10px 0 0;padding:8px 10px;border-radius:9px;font-size:12px;color:var(--ag-a);background:color-mix(in srgb,var(--ag-a) 9%,transparent);border:1px solid color-mix(in srgb,var(--ag-a) 30%,transparent); }
.ag-ubigeo svg { flex:none;width:16px;height:16px; }

/* Planilla de metrados (misma estructura que el Excel del despacho) */
.ag-modal.is-sheet { width:min(1360px,100%);height:calc(100vh - 32px); }
.ag-met-head p { max-width:820px; }
.ag-contraste { display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:0 20px 10px; }
.ag-contraste-t { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--pr-muted);margin-right:4px; }
.ag-rel { padding:3px 9px;border-radius:999px;font-size:11px;border:1px solid transparent;cursor:help; }
.ag-rel.is-ok { color:#16a34a;background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.25); }
.ag-rel.is-out { color:#d97706;background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.4);font-weight:600; }
.ag-filter { display:flex;flex-wrap:wrap;gap:6px;padding:0 20px 10px; }
.ag-filter button { display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border:1px solid var(--pr-line);border-radius:999px;background:transparent;color:var(--pr-muted);font:inherit;font-size:12px;cursor:pointer; }
.ag-filter button.is-on { border-color:var(--ag-a);color:var(--pr-text);background:color-mix(in srgb,var(--ag-a) 12%,transparent); }
.ag-sw { width:9px;height:9px;border-radius:3px; }
.ag-sw.is-prop { background:var(--ag-a); }
.ag-sw.is-corr { background:#22c55e; }
.ag-sheet-wrap { flex:1;min-height:0;overflow:auto;padding:0 20px 16px; }
.ag-sheet { width:100%;min-width:1480px;border-collapse:separate;border-spacing:0;font-size:11.5px;font-variant-numeric:tabular-nums; }
.ag-sheet th { position:sticky;top:0;z-index:2;padding:6px 6px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;color:var(--pr-muted);background:var(--pr-panel);border-bottom:1px solid var(--pr-line);text-align:center;white-space:nowrap; }
.ag-sheet thead tr:nth-child(2) th { top:27px; }
.ag-sheet th.grp { border-bottom:1px dashed var(--pr-line); }
.ag-sheet td { padding:5px 6px;border-bottom:1px solid color-mix(in srgb,var(--pr-line) 55%,transparent);vertical-align:middle;white-space:nowrap; }
.ag-sheet td.num { text-align:right; }
.ag-sheet .c-item { width:104px;color:var(--pr-muted); }
.ag-sheet .c-desc { min-width:300px;max-width:420px;white-space:normal; }
.ag-sheet .c-total { font-weight:700; }
.ag-sheet tr.is-titulo td { padding-top:11px;font-weight:700;color:#c026d3; }
.ag-sheet tr.is-partida td { font-weight:700;background:color-mix(in srgb,var(--pr-soft) 70%,transparent); }
.ag-sheet tr.is-partida td.c-total { color:var(--ag-a); }
.ag-sheet tr.is-sub td { padding:2px 6px;font-size:10px;font-style:italic;color:var(--pr-muted);border-bottom:0; }
.ag-sheet tr.is-fila td.c-desc { padding-left:18px; }
.ag-sheet tr.is-fila td.is-sum { color:var(--pr-text);font-weight:600; }
.ag-sheet tr.is-prop td:first-child { box-shadow:inset 3px 0 0 var(--ag-a); }
.ag-sheet tr.is-prop { background:color-mix(in srgb,var(--ag-a) 6%,transparent); }
.ag-sheet tr.is-corr td:first-child { box-shadow:inset 3px 0 0 #22c55e; }
.ag-sheet tr.is-corr { background:rgba(34,197,94,.06); }
.ag-cell { width:64px;height:24px;padding:0 6px;border:1px solid transparent;border-bottom:1px dashed color-mix(in srgb,var(--pr-muted) 45%,transparent);border-radius:6px;background:transparent;color:var(--pr-text);font:inherit;text-align:right; }
.ag-cell:hover { border-color:var(--pr-line);background:var(--fz-input, var(--pr-soft)); }
.ag-cell:focus { outline:0;border-color:var(--ag-a);background:var(--fz-input, var(--pr-soft));box-shadow:0 0 0 2px rgba(91,140,255,.18); }
.ag-sheet td.c-obs, .ag-sheet th.c-obs { min-width:280px;max-width:380px;white-space:normal;text-align:left;font-size:10.5px;line-height:1.35;color:var(--pr-muted); }
.ag-cell.is-text { width:100%;min-width:220px;text-align:left; }
.ag-tiles .is-auto { border-color:color-mix(in srgb,var(--ag-a) 45%,transparent);background:color-mix(in srgb,var(--ag-a) 8%,var(--pr-soft)); }
.ag-tag { display:inline-block;margin-left:6px;padding:1px 6px;border-radius:999px;font-size:9.5px;font-weight:600;vertical-align:1px; }
.ag-tag.is-prop { color:var(--ag-a);background:color-mix(in srgb,var(--ag-a) 15%,transparent); }
.ag-tag.is-corr { color:#16a34a;background:rgba(34,197,94,.15); }

@keyframes ag-spin { to { transform:rotate(360deg); } }
@keyframes ag-pulse { 50% { opacity:.35; } }
@keyframes ag-shine { to { background-position:-200% 0; } }
@media (prefers-reduced-motion: reduce) { .ag *, .ag { animation:none !important;transition:none !important; } }
@media (max-width:760px) {
  .ag { top:auto;left:8px;right:8px;bottom:8px;width:auto;height:calc(100% - 60px); }
  .ag-grid { grid-template-columns:1fr; }
  .ag-tiles, .ag-stats { grid-template-columns:repeat(2,1fr); }
}
</style>
