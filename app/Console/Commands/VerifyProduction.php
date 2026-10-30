<?php

namespace App\Console\Commands;

use Composer\InstalledVersions;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;

class VerifyProduction extends Command
{
    protected $signature='produccion:verificar';
    protected $description='Comprueba bloqueos de publicación sin cobrar, enviar correos ni mostrar secretos';

    public function handle(): int
    {
        $issues=[];
        if(!app()->isProduction()){$issues[]='APP_ENV debe ser production en el servidor; conserva local para desarrollo.';}
        if(config('app.debug')){$issues[]='APP_DEBUG debe ser false en producción.';}
        if(parse_url(config('app.url'),PHP_URL_SCHEME)!=='https'){$issues[]='APP_URL debe utilizar HTTPS.';}
        if(!in_array(config('cache.stores.'.config('cache.default').'.driver'),['database','redis','memcached'],true)){$issues[]='CACHE_STORE debe ser compartido entre procesos (database o redis): los candados de pago dependen de él.';}
        if(config('mail.default')==='log'||!config('mail.mailers.smtp.password')){$issues[]='Configura el SMTP real: con MAIL_MAILER=log o sin contraseña no sale ningún comprobante.';}
        if(strcasecmp((string)config('mail.from.address'),(string)config('mail.mailers.smtp.username'))!==0){$issues[]='MAIL_FROM_ADDRESS debe coincidir con MAIL_USERNAME: Hostinger rechaza otro remitente.';}
        if(!filter_var(config('mail.admin_email'),FILTER_VALIDATE_EMAIL)){$issues[]='MAIL_ADMIN_ADDRESS debe ser un correo válido: ahí llega la copia de cada pago.';}
        if(!config('billing.issuer.ruc')||!config('billing.issuer.address')){$issues[]='Completa BILLING_ISSUER_RUC y BILLING_ISSUER_ADDRESS: aparecen en cada comprobante.';}
        if(!config('app.key')){$issues[]='Falta APP_KEY. No regenerar una clave existente: protege los respaldos cifrados.';}
        if(!config('session.secure')||!config('session.http_only')||config('session.same_site')!=='lax'){$issues[]='Revisa cookie segura, HttpOnly y SameSite=lax.';}
        if(is_file(public_path('hot'))){$issues[]='public/hot está presente. No incluir el enlace al servidor Vite en la entrega.';}
        if(is_dir(public_path('puppeteer-session'))){$issues[]='Existe un perfil de navegador en public. Está ignorado por Git y bloqueado en Apache; debe quedar fuera de la entrega.';}
        if(is_dir(public_path('captures'))&&glob(public_path('captures/*'))){$issues[]='Retira las capturas privadas antiguas del directorio público.';}
        foreach(['account_sessions','account_security_events','payment_requests','payment_events','payment_tasks','project_backups','media','showcase_videos'] as $table){
            if(!Schema::hasTable($table)){$issues[]='Falta la tabla '.$table.'. Ejecuta las migraciones del servidor.';}
        }
        $framework=InstalledVersions::getVersion('laravel/framework');
        if(version_compare($framework,'12.0.0','<')){$issues[]='Laravel 11 ya terminó su soporte de seguridad. Preparar migración compatible antes de publicar.';}
        if(!app(\App\Services\Culqi::class)->enabled()||!str_starts_with((string)config('services.culqi.public_key'),'pk_live_')||!str_starts_with((string)config('services.culqi.secret_key'),'sk_live_')){
            $issues[]='El servidor debe tener Culqi habilitado y llaves live válidas del comercio.';
        }
        try{app(\App\Services\ProcessingPrice::class)->quote(5000,'PEN');}catch(\Illuminate\Validation\ValidationException $exception){$issues[]=$exception->errors()['processing'][0]??'Revisar el precio de procesamiento.';}
        foreach(['composer','npm'] as $kind){
            $file=storage_path('logs/production-'.$kind.($kind==='composer'?'-final':'').'-audit.json');
            $report=is_file($file)?json_decode(file_get_contents($file),true):null;
            if(!$report||filemtime($file)<time()-86400){$issues[]='Falta una auditoría '.$kind.' reciente. Ejecuta la auditoría en la entrega final.';continue;}
            $high=$kind==='npm'?array_sum(array_intersect_key($report['metadata']['vulnerabilities']??[],array_flip(['high','critical']))):array_sum(array_map(fn($items)=>count(array_filter($items,fn($item)=>in_array($item['severity']??null,['high','critical'],true))),$report['advisories']??[]));
            if($high){$issues[]=$kind.': '.$high.' avisos altos/críticos requieren resolución o revisión documentada antes de publicar.';}
        }
        foreach($issues as $issue){$this->error($issue);}
        $this->line('Validar en el servidor: DocumentRoot=public, HTTPS/redirección, workers payments/media, cron, SMTP, webhook y motores Python/Octave privados.');
        $this->line('Este comando no verifica un servidor remoto ni procesa pagos. Repetir las auditorías después de instalar las dependencias finales.');
        if($issues){$this->warn('NO LISTO PARA PRODUCCIÓN.');return self::FAILURE;}
        $this->info('Comprobaciones locales superadas; completa la validación de infraestructura antes de publicar.');return self::SUCCESS;
    }
}
