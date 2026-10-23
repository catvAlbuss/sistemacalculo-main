@extends('layouts.services')
@section('service-code', 'S.02')
@section('service-title', 'Desarrollo de software estructural')
@section('service-description', 'Herramientas digitales para apoyar el análisis, el diseño y la verificación estructural. Conversemos sobre las necesidades de tu equipo.')
@section('service-image', Vite::asset('resources/img/desingra/servcios-it-desarrollo-software.webp'))
@section('service-image-alt', 'Desarrollo de herramientas de software estructural')
@section('service-content')
  <p class="pr-eyebrow">01 / Enfoque del servicio</p>
  <h2 style="margin-top:12px">Tecnología para tu proceso de ingeniería.</h2>
  <p>Desarrollamos software especializado para facilitar el trabajo de los ingenieros. Buscamos organizar los cálculos y hacer más accesibles las herramientas de análisis y diseño.</p>
  <ul class="en-service-list"><li>Herramientas para análisis y diseño estructural.</li><li>Revisión de necesidades y flujos de trabajo del equipo.</li><li>Definición del alcance de la solución antes de su desarrollo.</li></ul>
  <div class="en-actions"><a href="{{ route('landing.plans') }}" class="en-inline-link">Ver nuestros planes de software ↗︎</a></div>
@endsection
