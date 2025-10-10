@extends('layouts.services')

@section('mid')
  <h3 class="py-5 text-center text-2xl font-bold">Diseño Estructural</h3>
  <p class="py-2 text-center">
    Transformamos ideas en estructuras sólidas y seguras. En Rizabal & Asociados, aplicamos los últimos
    estándares y normativas para diseñar soluciones estructurales que optimizan la resistencia y funcionalidad
    de cualquier tipo de construcción: edificaciones, puentes, muros de sostenimiento, entre otros. Confía en
    nuestro equipo de expertos para llevar tus proyectos al siguiente nivel.</p>
  <img class="py-10" src="{{ Vite::asset('resources/img/desingra/diseno_estructural-removebg-preview.png') }}"
    alt="{{ __('Diseño Estrctural') }}">
@endsection

@section('top_left')
  <img src="{{ Vite::asset('resources/img/desingra/desingEstructuralview-removebg-preview.png') }}"
    alt="{{ __('Diseño Estrctural') }}">
@endsection
