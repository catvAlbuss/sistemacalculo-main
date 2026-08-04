<?php

namespace App\Livewire;

use Livewire\Component;

class EspectroSismico extends Component
{
    public $normaVersion = '2026';
    public $zonaVal = 1;
    public $sueloVal = 'S1';
    public $U = 1.0;
    public $R_base = 8;
    public $Ip = 1.0;
    public $Ia = 1.0;
    public $Tmax = 8.0;
    public $paso = 0.08;
    public $Ts = 0.0;

    // Datos del espectro calculado
    public $datosEspectro = [];
    public $parametrosCalculados = [];
    public $mostrarResultados = false;

    /**
     * Render del componente
     */
    public function render()
    {
        return view('hcalculo.espectro-sismico');
    }

    /**
     * Validar que los parámetros sean correctos
     */
    protected function rules()
    {
        return [
            'normaVersion' => 'required|in:1977,1997,2003,2016,2018,2026',
            'zonaVal' => 'required|integer|min:1',
            'sueloVal' => 'required|string',
            'U' => 'required|numeric|min:0.8|max:1.8',
            'R_base' => 'required|numeric|min:1',
            'Ip' => 'required|numeric|min:0.5|max:1.0',
            'Ia' => 'required|numeric|min:0.5|max:1.0',
            'Tmax' => 'required|numeric|min:1|max:10',
            'paso' => 'required|numeric|min:0.01|max:0.5',
            'Ts' => 'nullable|numeric|min:0|max:5',
        ];
    }

    /**
     * Cambiar versión de norma
     */
    public function setVersion($version)
    {
        $this->normaVersion = $version;
        $this->resetCalculations();
        $this->dispatch('versionChanged', version: $version);
    }

    /**
     * Calcular el espectro sísmico
     * Este método expone datos para que JS en la vista maneje el cálculo
     */
    public function calcular()
    {
        $this->validate();

        // Pasar datos al frontend via evento o propiedad pública
        $this->dispatch('calcularEspectro', [
            'normaVersion' => $this->normaVersion,
            'zonaVal' => $this->zonaVal,
            'sueloVal' => $this->sueloVal,
            'U' => $this->U,
            'R_base' => $this->R_base,
            'Ip' => $this->Ip,
            'Ia' => $this->Ia,
            'Tmax' => $this->Tmax,
            'paso' => $this->paso,
            'Ts' => $this->Ts,
        ]);

        $this->mostrarResultados = true;
    }

    /**
     * Resetear cálculos
     */
    public function resetCalculations()
    {
        $this->datosEspectro = [];
        $this->parametrosCalculados = [];
        $this->mostrarResultados = false;
    }

    /**
     * Guardar datos del cálculo (llamado desde JavaScript)
     */
    public function guardarResultados($datos)
    {
        $this->datosEspectro = $datos;
        $this->mostrarResultados = true;
    }
}
