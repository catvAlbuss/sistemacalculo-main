<?php

namespace App\Services;

class ProgramInformation
{
    public function for(string $slug, array $product): array
    {
        return config('program-details.'.$slug) ?? [
            'purpose' => $product['description'], 'inputs' => ['Geometría del elemento', 'Materiales del proyecto', 'Solicitaciones de diseño'],
            'outputs' => $product['features'], 'scope' => null,
        ];
    }
}
