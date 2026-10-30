<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

// Cuenta de prueba para la revisión del comercio por Culqi. La contraseña se muestra una sola vez
// y no se guarda en el repositorio; se entrega a Culqi por su canal privado.
class CreateCulqiReviewer extends Command
{
    protected $signature = 'culqi:revisor {email : Correo de la cuenta de revisión}';

    protected $description = 'Crea o restablece la cuenta de prueba para que Culqi revise el flujo de compra';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Correo no válido.');

            return self::FAILURE;
        }
        $password = Str::password(16, symbols: false);
        $user = User::firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => $user->name ?: 'Revisor Culqi',
            'password' => Hash::make($password),
            'is_active' => true,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();
        $user->syncRoles([Role::findOrCreate('cliente', 'web')]);

        $this->info('Cuenta de revisión lista. Guarda la contraseña: no se vuelve a mostrar.');
        $this->line('Correo: '.$email);
        $this->line('Contraseña: '.$password);
        if (!in_array($email, config('services.culqi.reviewer_emails'), true)) {
            $this->warn('Agrega este correo a CULQI_REVIEWER_EMAILS para que pueda pagar en modo revisión.');
        }

        return self::SUCCESS;
    }
}
