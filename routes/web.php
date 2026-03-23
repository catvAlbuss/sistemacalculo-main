<?php

use App\Http\Controllers\VigaCaptureController;

use App\Http\Controllers\BlogController;
use App\Http\Controllers\CimientoCorridoController;
use App\Http\Controllers\ColumnaController;
use App\Http\Controllers\ContactPaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DesingLosaController;
use App\Http\Controllers\enviarCotizacionController;
use App\Http\Controllers\GestionUserRolSuscripcion;
use App\Http\Controllers\OctavePlotController;
use App\Http\Controllers\MuroAlbanieriaController;
use App\Http\Controllers\SubscriptionPlanController;
use App\Http\Controllers\ZapatacombinadaController;
use App\Http\Controllers\ZapataconectadaController;
use App\Http\Controllers\ZapatageneralController;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name("landing.home");

//=======================Landing=========================================//
Route::view('/servicios/diseño_estructural', 'landing.structural_design')->name('landing.services.structural_design');
Route::view('/servicios/software_estructural', 'landing.structural_software')->name('landing.services.structural_software');
Route::view('/servicios/planos_estructurales', 'landing.structural_blueprint')->name('landing.services.structural_blueprint');
Route::view('/servicios/metrados', 'landing.metrados')->name('landing.services.metrados');
//Route::view('/contacto', 'landing.contact')->name('landing.contact');
Route::post('/cotizarplano', [enviarCotizacionController::class, 'enviarCotizacion'])->name('cotizarplano');

// Route::post('/capturar-viga-descarga', [VigaCaptureController::class, 'descargar']);

Route::post('/capturar-viga-fragmento', [VigaCaptureController::class, 'capturarFragmento']);  

//==========================RUTA PARA LAS PRUEBAS PREDIM==================//
Route::view('/info/arco_techo', 'landing.arco_techo')->name('landing.info.arco_techo');
Route::view('/info/predim', 'landing.predim')->name('landing.info.predim');
Route::view('/predim_v2', 'predim.predim-new')->name("predim_v2");
//==========================RUTAS PÚBLICAS================================//
Route::view('/arco_techo', 'hcalculo.arco_techo')->name("calculadora.estudiante.arco_techo");

//==========================RUTAS AUTENTICADAS============================//
// Route::view('dashboard', 'dashboard')
//     ->middleware(['auth', 'verified'])
//     ->name('dashboard');
Route::get('dashboard', [DashboardController::class, 'index']) // Cambiamos a un controlador
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::view('profile', 'profile')
    ->middleware(['auth'])
    ->name('profile');

Route::resource('contacto', ContactPaymentController::class);
Route::view('/landing/success', 'landing.success')->name('landing.success');
Route::get('/download-proof/{paymentRequest}', [ContactPaymentController::class, 'downloadProof'])->name('download.proof')->middleware('signed');
//==========================GESTIÓN DE USUARIOS (Root y Gerencia)=========//
Route::middleware(['auth', 'verified', 'role:root,gerencia'])->group(function () {
    Route::view('/usuarios', 'livewire.user-management')->name('users.index');
});
// Gestión de Planes (Solo Root y Gerencia)
Route::middleware(['auth', 'verified', 'role:root|gerencia'])->group(function () {

    Route::resource('suscripciones', SubscriptionPlanController::class);
    Route::patch('suscripciones/{suscripcion}/toggle-status', [SubscriptionPlanController::class, 'toggleStatus'])->name('suscripciones.toggle-status');

    // Rutas de Gestión de Usuarios (Ej: /planUser/{planUser})
    Route::resource('planUser', GestionUserRolSuscripcion::class); // Mantener CRUD del usuario si lo necesitas
    Route::post('planUser/{planUser}/subscription', [GestionUserRolSuscripcion::class, 'assignSubscription'])->name('planUser.assignSubscription');

    Route::prefix('subscription')->name('subscription.')->group(function () {
        Route::delete('{subscription}', [GestionUserRolSuscripcion::class, 'cancelSubscription'])->name('cancel');
        Route::patch('{subscription}/suspend', [GestionUserRolSuscripcion::class, 'suspendSubscription'])->name('suspend');
        Route::patch('{subscription}/reactivate', [GestionUserRolSuscripcion::class, 'reactivateSubscription'])->name('reactivate');
        Route::patch('{subscription}/extend', [GestionUserRolSuscripcion::class, 'extendSubscription'])->name('extend');
    });
});

//==========================RUTAS CON SUSCRIPCIÓN ACTIVA==================//
Route::middleware(["auth", "verified"])->group(function () {
    Route::prefix("calculadora")->name("calculadora.")->group(function () {
        Route::prefix("estudiante")->name("estudiante.")->group(function () {
            Route::prefix("cav2")->name("cav2.")->group(function () {
                // CA V2.0
                Route::view('/metrados', 'hcalculo.CAV2.admMetrados')->name("metrados");
                Route::view('/escaleras', 'hcalculo.CAV2.admEscaleras')->name("escaleras");
                Route::view('/zapatas', 'hcalculo.CAV2.admZapatas')->name("zapatas");
                Route::view('/combinacion-de-cargas', 'hcalculo.CAV2.admCombCargas')->name("combinacion-de-cargas");
                Route::view('/viguetas', 'hcalculo.CAV2.admViguetas')->name("viguetas");
                Route::view('/voladitos', 'hcalculo.CAV2.admVoladitos')->name("voladitos");
                Route::view('/verificacion-de-deflexiones', 'hcalculo.CAV2.admVerificacionDeflexiones')->name("verificacion-de-deflexiones");
                Route::view('/aligerados', 'hcalculo.CAV2.admAligerados')->name("aligerados");
                Route::view('/distribucion-del-acero', 'hcalculo.CAV2.admDistribucionDelAcero')->name("distribucion-del-acero");
                Route::view('/vigas-continuas', 'hcalculo.CAV2.admVigasContinuas')->name("vigas-continuas");
                Route::view('/hoja2', 'hcalculo.CAV2.admHoja2')->name("hoja2");
            });
        });

        //==================CALCULADORA ASISTENTE (Root, Gerencia, Asistente)//
        Route::middleware(['role:root|gerencia|asistente'])->group(function () {
            Route::prefix('asistente')->name('asistente.')->group(function () {
                Route::view('/memoria-calculo', 'hcalculo.admMemoriaCalculo')->name('memoria-calculo');
                // Vigas
                Route::view('/vigas', 'hcalculo.admdesingvigas')->name('vigas');
                Route::view('/vigas-general', 'hcalculo.admvigageneral')->name('vigas-general');

                // Losas
                Route::view('/losas-macizas', 'hcalculo.admlosasmacizas')->name('losas-macizas');
                Route::view('/losas-aligeradas', 'hcalculo.admlosasaligeradas')->name('losas-aligeradas');

                // Diseño en madera
                Route::view('/diseño-en-madera', 'hcalculo.diseño_en_madera_flexocompresion')->name('diseño-en-madera');

                // Muros
                Route::view('/muros-de-contencionv2', 'muros-contencion.index')->name('muros-de-contencionv2');
                Route::view('/muros-de-contencion', 'hcalculo.admMurosContencion')->name('muros-de-contencion');
                Route::view('/muros-de-albañieria', 'hcalculo.admMurosAlbanieria')->name('muros-de-albañieria');

                // Cimiento
                Route::view('/cimiento-corrido', 'hcalculo.admCimientoCorrido')->name('cimiento-corrido');

                // Columnas
                Route::view('/columna-de-acero', 'hcalculo.admdesingcolumnaAcero')->name('columna-de-acero');
                Route::view('/columna', 'hcalculo.admdesingcolumna')->name('columna');

                // Zapata
                Route::view('/zapata-combinada', 'hcalculo.admZapataCombinada')->name('zapata-combinada');
                Route::view('/zapata-conectada', 'hcalculo.admZapataConectada')->name('zapata-conectada');
                Route::view('/zapata-general', 'hcalculo.admdesingZapataGeneral')->name('zapata-general');

                // Placas
                Route::view('/placas-L', 'hcalculo.admdesingPlacasL')->name('placas-L');

                // Cerco
                Route::view('/cerco-perimetrico', 'hcalculo.adm_CercoPerimetrico')->name('cerco-perimetrico');

                // Irregularidades
                Route::view('/irregularidades', 'hcalculo.admIrregularidades')->name('irregularidades');

                // Diseño en madera
                Route::prefix('diseño-en-madera')->name('diseño-en-madera.')->group(function () {
                    Route::view('/correas', 'hcalculo.admdesingcorreas')->name('correas');
                    Route::view('/flexo-compresion', 'hcalculo.diseño_en_madera.flexo_compresion')->name('flexo-compresion');
                    Route::view('/compresion', 'hcalculo.diseño_en_madera.compresion')->name('compresion');
                    Route::view('/traccion', 'hcalculo.diseño_en_madera.traccion')->name('traccion');
                    Route::view('/flexo-traccion', 'hcalculo.diseño_en_madera.flexo_traccion')->name('flexo-traccion');
                });

                // Diseño en acero
                Route::prefix('diseño-en-acero')->name('diseño-en-acero.')->group(function () {
                    Route::view('/compresion', 'hcalculo.diseño_en_acero.compresion')->name('compresion');
                    Route::view('/traccion', 'hcalculo.diseño_en_acero.traccion')->name('traccion');
                });
            });
        });
    });
    Route::prefix("software")->name("software.")->group(function () {
        Route::view('/analisis-estructural-de-armaduras', 'matlab.admAnalisisEstructuralDeArmaduras')->name("analisis-estructural-de-armaduras");
        Route::view('/aligerados-v2', 'matlab.admAligeradosGrafico')->name("aligerados-v2");
        Route::view('/aligerados-v1', 'matlab.admFuerzasCortantesGrafico')->name("aligerados-v1");
        Route::view('/cimentacion-v2', 'matlab.admSafecito')->name("cimentacion-v2");
        Route::view('/cimentacion-v1', 'matlab.admZapatasGrafico')->name("cimentacion-v1");
        Route::prefix("suelos")->name("suelos.")->group(function () {
            Route::view('/distribucion-de-esfuerzos', 'matlab.distribucion_de_esfuerzos')->name("distribucion-de-esfuerzos");
        });
        //=============
        Route::view('/anclaje-v1', 'hcalculo.verificaciones.admAnclaje')->name("anclaje-v1");
        Route::view('/base-dinamica-v1', 'hcalculo.verificaciones.admBasesdinamicas')->name("base-dinamica-v1");
        Route::view('/estribo-columna-placa-v1', 'hcalculo.verificaciones.admEstribocolumnaplaca')->name("estribo-columna-placa-v1");
        Route::view('/estribo-placa-v1', 'hcalculo.verificaciones.admEstriboplacas')->name("estribo-placa-v1");
        Route::view('/predim-viga-v1', 'hcalculo.verificaciones.admPredimviga')->name("predim-viga-v1");
        Route::view('/verificacion-viga-v1', 'hcalculo.verificaciones.admVigaverifica')->name("verificacion-viga-v1");
        Route::view('/predim', 'predim.predim')->name("predim");
    });

    //===================RUTA DE LOSAS========================================//
    Route::post('/desingLosa', [DesingLosaController::class, 'losasAligeradas'])->name('desingLosa');
    //===================RUTA DE CIMIENTO CORRIDO=============================//
    Route::post('/cimientocorrido', [CimientoCorridoController::class, 'cimientocorrido'])->name('cimientocorrido');
    //===================RUTA DE COLUMNA======================================//
    Route::post('/columacon', [ColumnaController::class, 'columna'])->name('columacon');
    //===================RUTA DE zapata=======================================//
    Route::post('/zapatacombCon', [ZapatacombinadaController::class, 'zapataCombinada'])->name('zapatacombCon');
    Route::post('/zapataconectadaCon', [ZapataconectadaController::class, 'zapataConectada'])->name('zapataconectadaCon');
    //===================Z general============================================//
    Route::post('/zapataGenCon', [ZapatageneralController::class, 'zapataGeneral'])->name('zapataGenCon');
    //===================RUTAS PARA MUROS DE ALBAÑIERIA=======================//
    Route::post('/malbaCont', [MuroAlbanieriaController::class, 'muroAlbanieria'])->name('malbaCont');
    //===================RUTAS PARA SAFECITO==================================//
    Route::post('/zapatas2', [OctavePlotController::class, 'graficarZapatas2'])->name('zapatas2');
    //===================RUTAS PARA SUELOS==================================//
    Route::post('/suelos', [OctavePlotController::class, 'calcularSuelos'])->name('suelos');
    //===================OCTAVE===============================================//
    Route::post('/calcularFuerzasArmaduras', [OctavePlotController::class, 'calcularFuerzasArmaduras'])->name('calcularFuerzasArmaduras');
    Route::post('/fuerzasCortantes', [OctavePlotController::class, 'graficarFC'])->name('fuerzasCortantes');
    Route::post('/aligerados', [OctavePlotController::class, 'graficarAligerados'])->name('aligerados');
    Route::post('/zapatas', [OctavePlotController::class, 'graficarZapatas'])->name('zapatas');
});

require __DIR__ . '/auth.php';
Route::prefix('storage')->group(function () {
    // Imágenes de perfil
    Route::get('/profile/{filename}', function ($filename) {
        $path = public_path('storage/profile/' . $filename);
        if (!File::exists($path)) {
            return response()->json(['message' => 'Imagen no encontrada.'], 404);
        }
        return Response::make(File::get($path), 200)
            ->header("Content-Type", File::mimeType($path));
    });

    // Firmas
    Route::get('/firmas/{filename}', function ($filename) {
        $path = storage_path('app/public/firmas/' . $filename);
        if (!file_exists($path)) {
            abort(404);
        }
        return response()->file($path, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=3600'
        ]);
    })->name('get.firma');
});
