@extends('layouts.workspace')
@section('main')
<header class="wk-heading"><div><p class="pr-eyebrow">Administración / Panel de gestión</p><h1>Administración</h1><p>Gestiona cuentas, planes, cobros y atención de reclamaciones desde tu espacio interno.</p></div></header>
<div class="wk-grid-two">
    @foreach([
        ['01','Usuarios y suscripciones','Administra las cuentas, los roles y las coberturas asignadas.','planUser.index','Gestionar usuarios'],
        ['02','Catálogo de planes','Revisa precios, períodos, características y capacidades de los planes.','suscripciones.index','Gestionar planes'],
        ['03','Gestión de pagos','Consulta solicitudes, cargos, eventos y tareas de notificación.','payments.admin.index','Revisar pagos'],
        ['04','Gestión de reclamaciones','Revisa hojas recibidas, fechas límite y respuestas al consumidor.','complaints.admin.index','Atender reclamaciones'],
        ['05','Videos y tráileres','Carga videos, revisa el procesamiento y publica la portada o los tráileres de cada programa.','showcase.admin','Gestionar videos']
    ] as [$number,$title,$description,$destination,$label])
        <article class="pr-panel wk-card"><span class="en-card-number">{{ $number }} / GESTIÓN</span><h2>{{ $title }}</h2><p>{{ $description }}</p><div class="en-actions"><a class="pr-button pr-button-secondary" href="{{ route($destination) }}">{{ $label }} <span aria-hidden="true">↗︎</span></a></div></article>
    @endforeach
</div>
@endsection
