<?php

namespace Tests\Unit;

use App\Http\Controllers\OctavePlotController;
use Tests\TestCase;

// Selección del motor Octave (config/octave.php) y armado de la línea de comandos para WSL.
class OctaveLaunchTest extends TestCase
{
    private function invokePrivate(string $method, ...$args)
    {
        $controller = new OctavePlotController();
        $reflection = new \ReflectionMethod($controller, $method);

        return $reflection->invoke($controller, ...$args);
    }

    public function test_windows_paths_are_translated_for_wsl(): void
    {
        $this->assertSame('/mnt/c/laragon/www/octave', $this->invokePrivate('wslPath', 'C:\\laragon\\www\\octave'));
        $this->assertSame('/mnt/d/datos/matlab', $this->invokePrivate('wslPath', 'D:/datos/matlab'));
        $this->assertSame('/home/u1/octave', $this->invokePrivate('wslPath', '/home/u1/octave'));
    }

    public function test_arguments_are_quoted_only_when_needed(): void
    {
        $this->assertSame('-e', $this->invokePrivate('windowsArgument', '-e'));
        $this->assertSame('LD_LIBRARY_PATH=/mnt/c/a:/mnt/c/b', $this->invokePrivate('windowsArgument', 'LD_LIBRARY_PATH=/mnt/c/a:/mnt/c/b'));
        $this->assertSame('"zapatas(1, struct(\'a\', [1,2; 3,4]))"', $this->invokePrivate('windowsArgument', "zapatas(1, struct('a', [1,2; 3,4]))"));
        $this->assertSame('"di \\"hola\\""', $this->invokePrivate('windowsArgument', 'di "hola"'));
        $this->assertSame('""', $this->invokePrivate('windowsArgument', ''));
    }

    public function test_windows_without_octave_explains_how_to_enable_it(): void
    {
        if (PHP_OS_FAMILY !== 'Windows') {
            $this->markTestSkipped('Selección de motor de Windows.');
        }
        config(['octave.windows_cli' => null, 'octave.wsl.enabled' => false]);

        $result = $this->invokePrivate('windowsOctaveLaunch', 'disp(1)');

        if (is_array($result)) {
            $this->assertStringNotContainsString('wsl.exe', is_string($result['command']) ? $result['command'] : implode(' ', $result['command']));
        } else {
            $this->assertStringContainsString('No hay Octave disponible en Windows', $result);
        }
    }
}
