<?php

namespace Tests\Unit;

use App\Http\Controllers\OctavePlotController;
use Tests\TestCase;

class OctaveCalculationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        if (!getenv('RUN_OCTAVE_TESTS')) {
            $this->markTestSkipped('RUN_OCTAVE_TESTS=1 requiere el motor Octave local configurado.');
        }
    }

    public function test_fuerzas_cortantes_returns_mat_results_for_one_two_and_three_spans(): void
    {
        $run = new \ReflectionMethod(OctavePlotController::class, 'runOctave');
        $controller = new OctavePlotController();
        foreach ([1, 2, 3] as $spans) {
            $vector = fn ($value) => '['.implode(',', array_fill(0, $spans, $value)).']';
            $call = 'fuerzas_cortantes(210,4200,'.$vector(0.1).','.$vector(0.2).','.$vector(4).','.$vector(0.4).','.$vector(0.3).',0.4,1.4,1.7);';
            $stdout = $stderr = '';
            $arguments = [$call, &$stdout, &$stderr];
            $status = $run->invokeArgs($controller, $arguments);
            $this->assertSame(0, $status, $spans.' tramo(s): '.$stderr);
            $this->assertStringStartsWith('MATLAB 5.0 MAT-file', $stdout);
        }
    }

    public function test_zapatas2_returns_results_with_and_without_columns_inside_the_polygon(): void
    {
        $run = new \ReflectionMethod(OctavePlotController::class, 'runOctave');
        $controller = new OctavePlotController();
        foreach (['[1,5,5]', '[1,1,1]'] as $column) {
            $call = "zapatas2(struct('poligono1',[0,0;2,0;2,2;0,2;0,0]),".$column.",[1,10,0,0],[1,2,0,0],[1,0,0,0],'[pm+pv+ps,mxm+mxv+mxs,mym+myv+mys]',1,1.8);";
            $stdout = $stderr = '';
            $arguments = [$call, &$stdout, &$stderr];
            $this->assertSame(0, $run->invokeArgs($controller, $arguments), $column.': '.$stderr);
            $this->assertStringStartsWith('MATLAB 5.0 MAT-file', $stdout);
        }
    }
}
