@push('styles')
    @vite('resources/css/espectroStyle.css')
@endpush

@push('scripts')
    @vite('resources/js/espectro-sismico/index.js')
@endpush

<div class="espectro-page">
    <header class="espectro-header">
        <div class="logo-box">E-030</div>
        <h1>Espectro Sismico</h1>
        <span>Norma Tecnica E.030 - RNE Peru - Versiones 1977 a 2026</span>
    </header>

    <div class="container" data-espectro-app>
        <div class="panel">
            <div class="section-title">Version de la Norma</div>
            <div class="version-selector" role="group" aria-label="Version de la norma">
                <button type="button" class="ver-btn" data-v="1977" id="btn1977">RNC<br>1977</button>
                <button type="button" class="ver-btn" data-v="1997" id="btn1997">E.030<br>1997</button>
                <button type="button" class="ver-btn" data-v="2003" id="btn2003">E.030<br>2003</button>
                <button type="button" class="ver-btn" data-v="2016" id="btn2016">E.030<br>2016</button>
                <button type="button" class="ver-btn" data-v="2018" id="btn2018">E.030<br>2018</button>
                <button type="button" class="ver-btn" data-v="2026" id="btn2026">E.030<br>2026*</button>
            </div>

            <div class="section-title">Ubicacion y Zona Sismica</div>
            <div class="field-group">
                <label for="zonaDepartamento"><span class="badge">Departamento</span></label>
                <select id="zonaDepartamento"></select>
            </div>
            <div class="field-group">
                <label for="zonaProvincia"><span class="badge">Provincia</span></label>
                <select id="zonaProvincia" disabled></select>
            </div>
            <div class="field-group">
                <label for="zonaDistrito"><span class="badge">Distrito</span></label>
                <select id="zonaDistrito" disabled></select>
                <div class="ubigeo-tag" id="ubigeo-tag" style="display:none"></div>
                <div class="hint">Detecta automaticamente la Zona Sismica (E.030 Anexo 1).</div>
            </div>

            <div class="field-group">
                <label for="zona">Zona Sismica <span class="badge">Z</span></label>
                <select id="zona"></select>
            </div>

            <div class="field-group">
                <label for="suelo">Perfil de Suelo <span class="badge">S</span></label>
                <select id="suelo"></select>
            </div>

            <div class="field-group">
                <label for="uso">Categoria de la Edificacion <span class="badge">U</span></label>
                <select id="uso">
                    <option value="1.5">A1 - Hospitales esenciales (U=1.5)</option>
                    <option value="1.5">A2 - Hospitales, cuarteles (U=1.5)</option>
                    <option value="1.3">B - Importantes (U=1.3)</option>
                    <option value="1.0" selected>C - Comunes (U=1.0)</option>
                    <option value="0.8">D - Temporales (U=0.8)</option>
                </select>
            </div>

            <div class="field-group">
                <label for="sistema">Sistema Estructural <span class="badge">R</span></label>
                <select id="sistema">
                    <optgroup label="Concreto Armado">
                        <option value="8">Porticos (R=8)</option>
                        <option value="7">Dual (R=7)</option>
                        <option value="6">Muros estructurales (R=6)</option>
                        <option value="3.5">Muros de ductilidad limitada (R=3.5)</option>
                    </optgroup>
                    <optgroup label="Estructuras de Acero">
                        <option value="8">Porticos especiales SMF (R=8)</option>
                        <option value="7">Porticos ordinarios OMF (R=7)</option>
                        <option value="6">Arriostradas (R=6)</option>
                    </optgroup>
                    <optgroup label="Albanileria">
                        <option value="3">Confinada o armada (R=3)</option>
                    </optgroup>
                    <optgroup label="Madera">
                        <option value="7">Madera (R=7)</option>
                    </optgroup>
                </select>
            </div>

            <div class="field-group" id="ts-group" style="display:none;">
                <label for="ts_value">Ts - Periodo Predominante del Terreno <span class="badge">2026</span></label>
                <input type="number" id="ts_value" value="0.0" step="0.1" min="0" max="5.0">
                <div class="hint">Obligatorio para categoria A o B en Zona 4.</div>
            </div>

            <hr class="divider">
            <div class="section-title">Irregularidades</div>

            <div class="field-group">
                <label for="irreg_planta">Irreg. en Planta <span class="badge">Ip</span></label>
                <select id="irreg_planta">
                    <option value="1.0" selected>Sin irregularidad (Ip=1.0)</option>
                    <option value="0.9">Torsional (Ip=0.9)</option>
                    <option value="0.81">Esquinas entrantes (Ip=0.81)</option>
                    <option value="0.9">Discontinuidad del diafragma (Ip=0.9)</option>
                </select>
            </div>

            <div class="field-group">
                <label for="irreg_altura">Irreg. en Altura <span class="badge">Ia</span></label>
                <select id="irreg_altura">
                    <option value="1.0" selected>Sin irregularidad (Ia=1.0)</option>
                    <option value="0.9">Irregularidad de rigidez (Ia=0.9)</option>
                    <option value="0.9">Irregularidad de masa (Ia=0.9)</option>
                    <option value="0.8">Discontinuidad del sistema resistente (Ia=0.8)</option>
                    <option value="0.75">Extrema rigidez (Ia=0.75)</option>
                    <option value="0.6">Extrema discontinuidad (Ia=0.6)</option>
                </select>
            </div>

            <hr class="divider">
            <div class="section-title">Configuracion del espectro</div>

            <div class="field-group">
                <label for="tmax">T maximo <span class="badge">s</span></label>
                <input type="number" id="tmax" value="8.0" step="0.5" min="1" max="10">
            </div>

            <div class="field-group">
                <label for="paso">Paso DT <span class="badge">s</span></label>
                <input type="number" id="paso" value="0.08" step="0.01" min="0.01" max="0.5">
            </div>

            <div id="error-msg" class="error-msg">Verifique los parametros ingresados.</div>
            <button type="button" id="bot_accion" class="btn-calc">Generar espectro</button>

            <div id="params-out" class="params-grid" style="display:none"></div>
        </div>

        <div class="chart-panel">
            <div class="chart-header">
                <div>
                    <div class="chart-title" id="tit_diagrama">Espectro de Pseudo-aceleraciones</div>
                    <div class="chart-subtitle" id="formula-label">Sa = Z.U.C.S/R . g</div>
                </div>
                <div class="legend-dot">Sismo de diseno</div>
            </div>

            <div class="chart-wrapper">
                <div class="empty-state" id="empty-state">
                    <div class="icon">S</div>
                    <p>Configure los parametros y genere el espectro</p>
                </div>
                <canvas id="myChart" style="display:none"></canvas>
            </div>

            <div class="table-panel" id="tabla-panel" style="display:none">
                <div class="chart-header">
                    <div class="section-title" style="margin:0">Tabla de valores</div>
                    <div style="display:flex;gap:0.5rem;">
                        <button type="button" id="btn-exportTXT" class="btn-export">Exportar TXT</button>
                        <button type="button" id="btn-exportXLSX" class="btn-export">Exportar Excel</button>
                    </div>
                </div>
                <br>
                <div class="table-wrapper">
                    <table id="tabla-valores">
                        <thead>
                            <tr>
                                <th>T (s)</th>
                                <th>Sa (g)</th>
                                <th>C</th>
                                <th>Sa (m/s2)</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
