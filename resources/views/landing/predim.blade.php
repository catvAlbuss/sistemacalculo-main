@extends('layouts.trial')
@section('trial-title', 'Predim v1.0')
@section('trial-description', 'Explora el predimensionamiento gráfico de columnas, vigas, zapatas y losas desde tu navegador.')
@section('trial-image', Vite::asset('resources/img/desingra/predim.png'))
@section('trial-image-alt', 'Herramienta de predimensionamiento Predim')
@section('trial-url', route('predim_v2'))
@section('trial-action', 'Probar Predim')
@section('trial-content')
    <p class="pr-eyebrow">01 / Predimensionamiento gráfico</p>
    <h2 style="margin-top:12px">Dibuja y organiza tus elementos estructurales.</h2>
    <p>Predim permite dibujar y definir elementos con sus dimensiones para apoyar el análisis preliminar de un proyecto. Explora sus opciones de dibujo, escala y generación de reportes.</p>
    <ul class="en-service-list"><li>Columnas, vigas, zapatas y losas.</li><li>Edición gráfica de dimensiones y disposición de elementos.</li><li>Acceso público a la herramienta de prueba.</li></ul>
@endsection
