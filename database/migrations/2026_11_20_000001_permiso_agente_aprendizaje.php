<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

// Permiso para aprobar o rechazar las correcciones que el agente aprende (cola de revisión).
// Estaba en el seeder pero no en las bases ya sembradas: ni root lo tenía y el panel decía
// "No tienes permiso". Se crea aquí y se asigna a root (gerencia lo recibe si se decide).
return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $permiso = Permission::firstOrCreate(['name' => 'agente.aprendizaje.aprobar', 'guard_name' => 'web']);
        Role::where('name', 'root')->where('guard_name', 'web')->first()?->givePermissionTo($permiso);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Permission::where('name', 'agente.aprendizaje.aprobar')->where('guard_name', 'web')->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
