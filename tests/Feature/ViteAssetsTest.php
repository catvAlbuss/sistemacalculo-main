<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Tests\TestCase;

// Vite::asset() lanza un error 500 si la imagen no está en public/build/manifest.json, que se publica con Git.
class ViteAssetsTest extends TestCase
{
    private function manifest(): array
    {
        return json_decode(File::get(public_path('build/manifest.json')), true);
    }

    public function test_every_literal_image_in_views_is_published_or_guarded(): void
    {
        $manifest = $this->manifest();
        $broken = [];
        foreach (File::allFiles(resource_path('views')) as $file) {
            // hcalculo/hcalculo es una copia antigua sin rutas.
            if (str_contains($file->getPathname(), 'hcalculo'.DIRECTORY_SEPARATOR.'hcalculo')) {
                continue;
            }
            foreach (preg_split('/\R/', $file->getContents()) as $number => $line) {
                if (! preg_match_all('/Vite::(?:asset|image)\(\s*[\'"]([^\'"]+)[\'"]/', $line, $matches)) {
                    continue;
                }
                $previous = preg_split('/\R/', $file->getContents())[$number - 1] ?? '';
                foreach ($matches[1] as $path) {
                    $guarded = str_contains($previous, "is_file(resource_path('".substr($path, strlen('resources/'))."'))");
                    if (! isset($manifest[$path]) && ! $guarded) {
                        $broken[] = $file->getRelativePathname().':'.($number + 1).' '.$path;
                    }
                }
            }
        }

        $this->assertSame([], $broken);
    }

    public function test_plan_images_are_published(): void
    {
        $manifest = $this->manifest();
        foreach ([...array_values(config('plans.images')), config('plans.default_image')] as $image) {
            $this->assertArrayHasKey($image['image'], $manifest);
        }
    }

    public function test_cerco_perimetrico_renders_with_the_real_manifest_without_its_missing_diagrams(): void
    {
        $this->assertFalse(is_file(resource_path('img/calc/ra1.png')));

        $html = view('hcalculo.adm_CercoPerimetrico')->render();

        $this->assertStringContainsString('Imagen del diagrama de momentos no disponible', $html);
    }
}
