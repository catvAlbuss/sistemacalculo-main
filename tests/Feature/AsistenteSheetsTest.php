<?php

namespace Tests\Feature;

use App\Models\User;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

// Hojas del menú Asistente migradas al workbench (docs/uniformizacion-hojas-asistente.md).
class AsistenteSheetsTest extends TestCase
{
    use RefreshPaymentsDatabase;

    public static function migratedSheets(): array
    {
        return [
            'madera tracción' => ['calculadora.asistente.diseno-en-madera.traccion', 'madera-traccion', 'diseño_madera', 'calcs.traccionAxial'],
            'madera compresión' => ['calculadora.asistente.diseno-en-madera.compresion', 'madera-compresion', 'diseño_madera', 'calcs.compresionNadm'],
            'madera flexocompresión' => ['calculadora.asistente.diseno-en-madera.flexo-compresion', 'madera-flexocompresion', 'diseño_madera', 'calcs.flexocompresionKm'],
            'madera flexotracción' => ['calculadora.asistente.diseno-en-madera.flexo-traccion', 'madera-flexotraccion', 'diseño_madera', 'calcs.flexotraccionUsar'],
            'acero compresión' => ['calculadora.asistente.diseno-en-acero.compresion', 'acero-compresion', 'diseño_acero', 'calcs.compresionFcrx'],
            'acero tracción' => ['calculadora.asistente.diseno-en-acero.traccion', 'acero-traccion', 'diseño_acero', 'calcs.radioDeGiroMinimo'],
        ];
    }

    #[DataProvider('migratedSheets')]
    public function test_sheet_uses_the_workbench_and_keeps_engine_bindings(string $route, string $sheet, string $component, string $binding): void
    {
        $this->withoutVite();
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');

        $html = $this->actingAs($user)->get(route($route))->assertOk()->getContent();

        $this->assertStringContainsString('data-sheet="'.$sheet.'"', $html);
        $this->assertStringContainsString('x-data="'.$component.'"', $html);
        $this->assertStringContainsString('class="pr-panel arco-input-panel"', $html);
        $this->assertStringContainsString('Resultados del diseño', $html);
        $this->assertStringContainsString($binding, $html);
        // Sin el marcado anterior (tablas Tailwind de colores fijos).
        $this->assertStringNotContainsString('bg-gray-500', $html);
        $this->assertStringNotContainsString('bg-blue-500', $html);
    }

    public static function engineSheets(): array
    {
        return [
            'losas macizas' => ['calculadora.asistente.losas-macizas', 'losas-macizas',
                ['id="datosForm"', 'id="mu"', 'id="losas_macizas"', 'id="desingcorte"', 'id="resultadoflexion"', 'id="resuladocorte"', 'id="btn_pdf_predim"', 'id="btn_captura_resultado"']],
            'losas aligeradas' => ['calculadora.asistente.losas-aligeradas', 'losas-aligeradas',
                ['id="FlexionViga"', 'id="num_tramos"', 'id="LuzLibreTramo"', 'id="tablaTramos"', 'sheet-span-input', 'sheet-point-input', 'sheet-span-scroll', 'id="ObtenerResultados"']],
            'correas' => ['calculadora.asistente.diseno-en-madera.correas', 'madera-correas',
                ['id="desingButton"', 'id="selectabc"', 'id="vucortante"', 'id="predimenension"', 'id="modulo41"', 'id="modulo45"']],
            'cimiento corrido' => ['calculadora.asistente.cimiento-corrido', 'cimiento-corrido',
                ['id="cimientosControler"', 'id="yalba"', 'id="esmuro"', 'id="main"', 'id="cm_pdf"', 'id="ObtenerResultadosCimiento"', 'id="btn_captura_resultado"']],
            'zapata general' => ['calculadora.asistente.zapata-general', 'zapata-general',
                ['id="DataZapatageneral"', 'id="CargaConServ"', 'id="dataFromHandsontable"', 'id="VarillaY"', 'id="By"', 'id="zapataGeneral_pdf"', 'id="ObtenerResultados"', 'id="btn_captura_zapata"']],
            'zapata conectada' => ['calculadora.asistente.zapata-conectada', 'zapata-conectada',
                ['id="DataZapataconectada"', 'id="tipoDiseño"', 'id="MSY2"', 'id="fact_ampli_cv_c2"', 'id="myCanvas"', 'id="zapataConectada_pdf"', 'id="ObtenerResultadosZConectada"']],
            'zapata combinada' => ['calculadora.asistente.zapata-combinada', 'zapata-combinada',
                ['id="DataZapataCombinada"', 'id="CargaConServcol2"', 'id="dataCargacol2"', 'name="fi_general"', 'id="selectVFColumna2"', 'value="fila9_col2"', 'id="corte_punzonamiento"', 'id="zapatacomb_pdf"', 'id="ObtenerResultadosZComb"']],
            'columna' => ['calculadora.asistente.columna', 'columna',
                ['id="ColumnaF"', 'id="longitudArriostradaX"', 'id="guardarTablaY"', 'id="Scrga"', 'id="diagramaexy"', 'id="AmaxLong"', 'id="dataFromHandsontableLAY"', 'id="columna_pdf"', 'id="ObtenerResultadosCol"', 'id="DIejey"']],
            'columna acero' => ['calculadora.asistente.columna-de-acero', 'columna-acero',
                ['id="I8"', 'name="psc"', 'data-selected="A-572 Gr. 50"', 'id="M31"', 'id="I24"', 'id="columnaAcero_pdf"', 'id="resultados"', 'id="M146"', 'data-sheet-ready']],
            'est combinación de cargas' => ['calculadora.estudiante.cav2.combinacion-de-cargas', 'est-combinacion-cargas',
                ['id="calcular"', 'id="d"', 'id="ct"', 'id="resultados"', 'id="_2combinacion4"', 'id="_3combinacionResultado"', 'id="maximaCombinacion"', 'data-sheet-ready']],
            'escaleras' => ['calculadora.asistente.escaleras', 'escaleras',
                ['id="desingButton"', 'id="ancho_tributario"', 'id="diameter_flexion"', 'id="phi_corte"', 'bg-gespro-input', 'id="medidas-escalera"', 'id="diseno-corte"', 'id="res_corte_phicosbetavu"', 'id="diagrama_container"', 'id="reinf_container"']],
            'muros albañilería' => ['calculadora.asistente.muros-de-albanieria', 'muros-albanileria',
                ['id="datamurosAlb"', 'id="desc"', 'id="vdm"', 'id="pci"', 'name="pcin"', 'id="dmtr"', 'id="murosalba_pdf"', 'id="resultadoMalba"']],
        ];
    }

    // Hojas que conservan su marcado propio dentro de .sheet-legacy (paso previo a migrarlas a componentes).
    public static function legacySheets(): array
    {
        return [
            'muros contención' => ['calculadora.asistente.muros-de-contencion', 'muros-contencion', 'adm_murosContencion.js'],
            'muros contención v2' => ['calculadora.asistente.muros-de-contencionv2', 'muros-contencion-v2', 'muros-contencion/init.js'],
            'columna II' => ['calculadora.asistente.columna-ii', 'columna-ii', 'adm_columnav2.js'],
            'placas L' => ['calculadora.asistente.placas-L', 'placas-l', 'Datos Generales'],
            'cerco perimétrico' => ['calculadora.asistente.cerco-perimetrico', 'cerco-perimetrico', 'cerco-perimetrico'],
            'irregularidades' => ['calculadora.asistente.irregularidades', 'irregularidades', 'irregularidades.js'],
            'espectro sísmico' => ['calculadora.asistente.espectro-sismico', 'espectro-sismico', 'espectro-sismico/index.js'],
            // Menú Estudiante.
            'est metrados' => ['calculadora.estudiante.cav2.metrados', 'est-metrados', 'cav2/adm_metrados.js'],
            'est escaleras' => ['calculadora.estudiante.cav2.escaleras', 'est-escaleras', 'cav2/adm_escaleras.js'],
            'est zapatas' => ['calculadora.estudiante.cav2.zapatas', 'est-zapatas', 'cav2/adm_zapatas.js'],
            'est viguetas' => ['calculadora.estudiante.cav2.viguetas', 'est-viguetas', 'cav2/adm_viguetas.js'],
            'est voladitos' => ['calculadora.estudiante.cav2.voladitos', 'est-voladitos', 'cav2/adm_voladitos.js'],
            'est deflexiones' => ['calculadora.estudiante.cav2.verificacion-de-deflexiones', 'est-deflexiones', 'cav2/adm_verificacion_deflexiones.js'],
            'est aligerados' => ['calculadora.estudiante.cav2.aligerados', 'est-aligerados', 'cav2/adm_aligerados.js'],
            'est distribución del acero' => ['calculadora.estudiante.cav2.distribucion-del-acero', 'est-distribucion-acero', 'cav2/adm_distribucion_del_acero.js'],
            'est vigas continuas' => ['calculadora.estudiante.cav2.vigas-continuas', 'est-vigas-continuas', 'cav2/adm_vigas_continuas.js'],
            'est viga T' => ['calculadora.estudiante.cav2.viga-t', 'est-viga-t', 'Datos de Entrada'],
        ];
    }

    #[DataProvider('legacySheets')]
    public function test_legacy_sheet_uses_the_workbench_and_keeps_its_engine(string $route, string $sheet, string $marker): void
    {
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');

        $html = $this->actingAs($user)->get(route($route))->assertOk()->getContent();

        $this->assertStringContainsString('data-sheet="'.$sheet.'"', $html);
        $this->assertStringContainsString('class="sheet-legacy"', $html);
        $this->assertStringContainsString('class="pr-header en-page-header"', $html);
        $this->assertStringContainsString($marker, $html);
    }

    #[DataProvider('engineSheets')]
    public function test_engine_sheet_uses_the_workbench_and_keeps_engine_targets(string $route, string $sheet, array $targets): void
    {
        $this->withoutVite();
        Role::findOrCreate('root', 'web');
        $user = User::factory()->create();
        $user->assignRole('root');

        $html = $this->actingAs($user)->get(route($route))->assertOk()->getContent();

        $this->assertStringContainsString('data-sheet="'.$sheet.'"', $html);
        $this->assertStringContainsString('data-sheet-auto', $html);
        $this->assertStringContainsString('data-sheet-results', $html);
        foreach ($targets as $target) {
            $this->assertStringContainsString($target, $html, $target);
        }
        $this->assertStringNotContainsString('bg-blue-500', $html);
    }
}
