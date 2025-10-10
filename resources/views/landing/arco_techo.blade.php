@extends('layouts.services')

@section('mid')
  <h3 class="text-center text-2xl font-bold">Techo Arco</h3>
  <p class="py-2 text-justify">Techo Arco es una herramienta diseñada para facilitar el cálculo de las
    medidas de un arco estructural destinado a un techo. Permite a los usuarios ingresar parámetros
    como el tipo de material, el ancho y la altura del arco, así como las cargas que se aplicarán
    sobre el techo. La hoja realiza los cálculos necesarios para determinar las dimensiones exactas
    del arco, asegurando que se cumplan los requisitos estructurales y de seguridad. Además, puede
    proporcionar detalles como el radio, la longitud y las fuerzas que actúan sobre el arco,
    facilitando el diseño y la planificación de estructuras de techo con arcos.</p>
  <a href="{{ route('calculadora.estudiante.arco_techo') }}">
    <p class="text-justify"><span
        class="me-2 rounded border border-yellow-300 bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-gray-700 dark:text-yellow-300">Accede
        a la Hoja de Calculo Prueba</span>
    </p>
  </a>
  <br>
  <img class="bg-transparent" src="{{ Vite::asset('resources/img/desingra/hojacalculopredim.png') }}" alt="Arco Techo">
@endsection

@section('top_left')
  <img class="bg-transparent" src="{{ Vite::asset('resources/img/desingra/hojacalculapre.png') }}" alt="Arco Techo">
@endsection
