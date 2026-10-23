@extends('layouts.base')
@section('without-pdf', '1')
@push('styles')
    @vite('resources/css/workspace.css')
@endpush
@section('content')
    <x-navigation-workspace />
    <main class="workspace-main" data-layout="workspace">
        <div class="wk-shell">
            <div class="wk-location"><span>Rizabal & Asociados</span><span aria-hidden="true">/</span><span>Espacio de trabajo</span></div>
            @hasSection('main')
                @yield('main')
            @else
                {{ $slot ?? '' }}
            @endif
        </div>
    </main>
    <footer class="wk-footer"><span>Rizabal & Asociados · Ingeniería estructural</span><a href="{{ route('account.support') }}">Ayuda y soporte</a><a href="{{ route('landing.home') }}" target="_blank" rel="noopener">Abrir sitio público ↗</a></footer>
@endsection
