<?php

namespace App\Services;

class LegalDocuments
{
    public const PAGES = [
        'terminos' => 'Términos y condiciones',
        'devoluciones' => 'Política de cambios y devoluciones',
        'privacidad' => 'Política de privacidad',
    ];

    public function acceptance(): array
    {
        $hashes = [];
        foreach (array_keys(self::PAGES) as $page) {
            $hashes[$page] = hash_file('sha256', resource_path('views/legal/'.$page.'.blade.php'));
        }

        return ['version' => config('legal.version'), 'accepted_at' => now()->toIso8601String(),
            'documents_sha256' => $hashes, 'provider' => config('legal.provider')];
    }
}
