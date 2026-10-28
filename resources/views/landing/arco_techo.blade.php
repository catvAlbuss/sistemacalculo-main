@extends('layouts.trial')
@section('trial-title', 'Techo Arco')
@section('trial-description', 'Abre la hoja de cálculo de prueba y explora los parámetros geométricos de un arco para techo.')
@section('trial-image', Vite::asset('resources/img/desingra/hojacalculopredim.png'))
@section('trial-image-alt', 'Hoja de cálculo Techo Arco')
@section('trial-url', route('calculadora.estudiante.arco_techo'))
@section('trial-action', 'Abrir hoja de cálculo')
@section('trial-content')
    <p class="pr-eyebrow">02 / Hoja de cálculo de prueba</p>
    <h2 style="margin-top:12px">Explora la geometría de tu arco.</h2>
    <p>Techo Arco permite ingresar los parámetros de un arco estructural y consultar los resultados de la hoja de cálculo. Accede a la herramienta para revisar sus entradas, gráficos y cálculos.</p>
    <ul class="en-service-list"><li>Parámetros geométricos del arco.</li><li>Hoja de cálculo disponible desde el navegador.</li><li>Disponible con una prueba de 5 días o un plan activo.</li></ul>
@endsection
