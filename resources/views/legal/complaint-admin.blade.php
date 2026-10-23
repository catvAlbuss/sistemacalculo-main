@extends('layouts.workspace')
@section('main')
<div class="wk-legacy-detail wk-stack">
    <h1 class="text-3xl font-bold">Atención del Libro de Reclamaciones</h1>
    <form method="GET" class="flex flex-wrap items-end gap-4">
        <label>Estado<select name="status" class="pr-input">@foreach(['' => 'Todos', 'pending' => 'Pendientes', 'overdue' => 'Vencidos', 'answered' => 'Con respuesta'] as $value => $label)<option value="{{ $value }}" @selected(request('status') === $value)>{{ $label }}</option>@endforeach</select></label>
        <label>Buscar por hoja o nombre<input name="search" maxlength="100" value="{{ request('search') }}" class="pr-input"></label>
        <button class="pr-button">Filtrar</button>
    </form>
    <div class="overflow-x-auto"><div class="wk-table-scroll"><table class="wk-table"><thead><tr><th>Hoja / consumidor</th><th>Tipo</th><th>Fecha límite</th><th>Estado</th><th>Atención</th></tr></thead><tbody>
        @forelse($complaints as $complaint)<tr class="border-t"><td class="py-4">{{ $complaint->code }}<br>{{ $complaint->name }}</td><td>{{ $complaint->type }}</td><td>{{ $complaint->due_on->format('d/m/Y') }}</td><td>{{ $complaint->status === 'answered' ? 'Con respuesta' : ($complaint->due_on->toDateString() < today('America/Lima')->toDateString() ? 'Vencido' : 'Pendiente') }}</td><td><a class="en-inline-link" href="{{ route('complaints.admin.show', $complaint) }}">Ver hoja y responder</a></td></tr>
        @empty<tr><td colspan="5" class="py-5">No hay hojas para estos filtros.</td></tr>@endforelse
    </tbody></table></div></div>
    {{ $complaints->links() }}
</div>
@endsection
