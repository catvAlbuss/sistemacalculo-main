<?php
namespace Tests\Feature;

use App\Http\Controllers\OctavePlotController;
use App\Http\Middleware\ValidateLegacyCalculation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;
use Tests\Concerns\RefreshPaymentsDatabase;
use Tests\TestCase;

class ProductionSecurityTest extends TestCase
{
    use RefreshPaymentsDatabase;
    public function test_legacy_calculation_accepts_numeric_matrices_and_load_expressions(): void
    {
        $data=['poligonos'=>"struct('poligono1',[0,0;1,0;1,1;0,0],'poligono1_hueco1',[.1,.1;.2,.1;.1,.2])",'column'=>'[1,0.5,0.5]','PD'=>'[1,10,0,0]','PL'=>'[]','SISMO'=>'[1,2e-3,0,0]','Co'=>'[1.4*pm;1.2*pm+1.6*pv;ps]','dF'=>'1.2','pesoEspecifico'=>'1.8'];
        $request=Request::create('/zapatas2','POST',$data);$request->setRouteResolver(fn()=>new Route('POST','zapatas2',[OctavePlotController::class,'graficarZapatas2']));
        $response=app(ValidateLegacyCalculation::class)->handle($request,fn()=>response()->json(['validated'=>true]));
        $this->assertSame(200,$response->status());
        foreach(['system(1)','1;system(1)','"bad"','$(echo bad)','[1,2]; !cmd'] as $value){
            $request->merge(['Co'=>$value]);
            try { app(ValidateLegacyCalculation::class)->handle($request,fn()=>response('unsafe'));$this->fail('Executable input was accepted.'); }
            catch(ValidationException $exception){$this->assertArrayHasKey('Co',$exception->errors());}
        }
    }
    public function test_password_reset_revokes_old_sessions_and_remember_tokens(): void
    {
        $user=User::factory()->create();DB::table('account_sessions')->insert(['id'=>(string)\Illuminate\Support\Str::uuid(),'user_id'=>$user->id,'version'=>0,'last_seen_at'=>now(),'created_at'=>now(),'updated_at'=>now()]);
        event(new \Illuminate\Auth\Events\PasswordReset($user));
        $this->assertDatabaseCount('account_sessions',0);$this->assertNotSame($user->remember_token,$user->fresh()->remember_token);
    }
    public function test_production_rejects_foreign_hosts_and_test_payment_credentials(): void
    {
        $this->withoutVite();$this->app['env']='production';config(['app.url'=>'https://example.com','app.debug'=>false,
            'services.culqi.public_key'=>'pk_test_example','services.culqi.secret_key'=>'sk_test_example','services.culqi.webhook_token'=>str_repeat('a',40)]);
        $this->get('https://evil.example/login')->assertStatus(400);
        $this->get('https://example.com/login')->assertOk()->assertHeader('X-Content-Type-Options','nosniff')->assertHeader('Strict-Transport-Security','max-age=31536000');
        $this->assertNotEmpty(app(\App\Services\Culqi::class)->configurationErrors());
    }
    public function test_calculation_api_is_not_exempt_from_csrf(): void
    {
        $this->app['env']='production';config(['app.url'=>'https://example.com','app.debug'=>false]);
        $this->postJson('https://example.com/api/backend/analyze',[])->assertStatus(419);
        $route=app('router')->getRoutes()->match(Request::create('/api/backend/analyze','POST'));
        $this->assertNotContains(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,$route->excludedMiddleware());
    }
}
