<?php

namespace App\View\Components;

use Illuminate\View\Component;

class DatosTabla extends Component
{
    public $namedato;
    public $label;
    public $value;
    public $units;
    public $id;

    public function __construct($namedato, $label, $value, $units = '', $id = '')
    {
        $this->namedato = $namedato;
        $this->label = $label;
        $this->value = $value;
        $this->units = $units;
        $this->id = $id ?: strtolower(str_replace(' ', '-', $label)) . '-value';
    }

    public function render()
    {
        return view('components.datos-tabla');
    }
}
