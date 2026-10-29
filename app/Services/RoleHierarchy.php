<?php

namespace App\Services;

class RoleHierarchy
{
    public const ORDER = ['root', 'gerencia', 'asistente', 'cliente'];

    public static function rank(string $role): int
    {
        $rank = array_search($role, self::ORDER, true);
        return $rank === false ? 999 : $rank;
    }

    public static function description(string $role): string
    {
        return match ($role) {
            'root' => 'Control superior de cuentas, roles y configuración.',
            'gerencia' => 'Gestión de usuarios, planes y operaciones. El rol root está protegido.',
            'asistente' => 'Herramientas y documentación técnica según la cobertura contratada.',
            'cliente' => 'Programas de ingeniería, proyectos y gestión de su propia cuenta.',
            default => 'Accesos definidos por los permisos asignados.',
        };
    }
}
