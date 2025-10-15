<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            // Usuarios
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Calculadora
            'calculator.student.access',
            'calculator.assistant.access',

            // Software
            'software.access',
            'software.advanced',

            // Reportes
            'reports.view',
            'reports.export',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission],
                ['guard_name' => 'web'] // Especificar guard explícitamente
            );
        }

        // Crear roles y asignar permisos

        // ROOT - Acceso total
        $root = Role::firstOrCreate(
            ['name' => 'root'],
            ['guard_name' => 'web']
        );
        $root->syncPermissions(Permission::all());

        // GERENCIA - Acceso casi total
        $gerencia = Role::firstOrCreate(
            ['name' => 'gerencia'],
            ['guard_name' => 'web']
        );
        $gerencia->syncPermissions([
            'users.view',
            'users.create',
            'users.edit',
            'calculator.student.access',
            'calculator.assistant.access',
            'software.access',
            'software.advanced',
            'reports.view',
            'reports.export',
        ]);

        // ASISTENTE - Acceso a herramientas de asistente
        $asistente = Role::firstOrCreate(
            ['name' => 'asistente'],
            ['guard_name' => 'web']
        );
        $asistente->syncPermissions([
            'calculator.student.access',
            'calculator.assistant.access',
            'software.access',
            'reports.view',
        ]);

        // CLIENTE - Acceso limitado a software
        $cliente = Role::firstOrCreate(
            ['name' => 'cliente'],
            ['guard_name' => 'web']
        );
        $cliente->syncPermissions([
            'calculator.student.access',
            'software.access',
        ]);

        $this->command->info('Roles y permisos creados exitosamente.');
        $this->command->info('Roles creados: root, gerencia, asistente, cliente');
    }
}
