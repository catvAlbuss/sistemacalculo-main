<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Vite;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class AnalysisSheetsDesignTest extends TestCase
{
    use RefreshPaymentsDatabase;

    public static function sheets(): array
    {
        $aligerados=['fuerzasCortantesForm','fc','Fy','frm','frv','anchoTributario','propiedades','resultados','viguetas','cargaMuerta','cargaViva','fuerzasCortantes','momentosFlectores','T1','asd','T2','vu','calcular','generarPDF'];
        return [
            ['software.suelos.distribucion-de-esfuerzos','distribucion-esfuerzos','adm_suelos',['suelosForm','q','df','B','L','grafico1','grafico2','calcular']],
            ['software.aligerados-v1','aligerados-v1','adm_fuerzas_cortantes_grafico',$aligerados],
            ['software.aligerados-v2','aligerados-v2','adm_aligerados_grafico',$aligerados],
            ['software.cimentacion-v1','cimentacion-v1','adm_zapatas_grafico',['zapatasForm','cargas','propiedades','poligonoExterior','poligonoInterior1','poligonoInterior5','usarInterior1','usarInterior2','usarInterior3','usarInterior4','usarInterior5','zapata1','zapata11','calcular','generarPDF']],
            ['software.cimentacion-v2','cimentacion-v2','adm_safecito',['zapatas2Form','dF','pesoEspecifico','excelFile','reactionExcelConfig','reactionSheet','importarExcel','coordinatePointColumn','propiedadesSection','calculoActions','plot','editor','calcularZapatas2','polygons','graficos','zapata1','calcular','generarPDF']],
        ];
    }

    #[DataProvider('sheets')]
    public function test_design_preserves_engine_targets_and_published_assets(string $route,string $sheet,string $entry,array $targets): void
    {
        Vite::useHotFile(storage_path('framework/testing/analysis-no-hot'));
        Role::findOrCreate('root','web');$user=User::factory()->create();$user->assignRole('root');
        $response=$this->actingAs($user)->get(route($route))->assertOk();
        $response->assertSee('data-sheet="'.$sheet.'"',false)->assertSee('data-analysis-sheet',false)->assertSee($entry)->assertDontSee('localhost:5173');
        foreach($targets as $target){$response->assertSee('id="'.$target.'"',false);}
        $html=$response->getContent();
        preg_match_all('/(?<![\w-])id="([^"]+)"/',$html,$matches);
        foreach($targets as $target){$this->assertSame(1,count(array_filter($matches[1],fn($id)=>$id===$target)),'Duplicate engine target: '.$target);}
    }
}
