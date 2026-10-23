@extends('layouts.base')
@section('without-pdf', '1')

@section('content')
    <!-- Navbar -->
    <x-navigation-landing></x-navigation-landing>

    <!-- Main Content -->
    @yield('main')
    <x-legal-footer />
@endsection
