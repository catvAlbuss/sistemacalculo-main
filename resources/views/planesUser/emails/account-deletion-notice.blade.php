<x-mail.layout title="Mañana se dará de baja su cuenta" :preheader="'Su plan venció el '.\Illuminate\Support\Carbon::parse($vencio)->format('d/m/Y').' y no se renovó.'">
    <x-mail.text>Estimado(a) {{ $user->name }}:</x-mail.text>
    <x-mail.text>Su plan venció el {{ \Illuminate\Support\Carbon::parse($vencio)->format('d/m/Y') }} y no se ha renovado. Si no lo renueva, <strong>mañana {{ \Illuminate\Support\Carbon::parse($baja)->format('d/m/Y') }} su cuenta será dada de baja</strong> y ya no podrá ingresar.</x-mail.text>
    <x-mail.text>Sus proyectos no se borran: si después desea volver, escríbanos y reactivamos su cuenta.</x-mail.text>
    <x-mail.actions><x-mail.button :href="route('plans.mine')">Renovar mi plan</x-mail.button></x-mail.actions>
    <x-mail.note>Los pagos se realizan únicamente desde la plataforma, mediante Culqi. No realizamos cargos automáticos.</x-mail.note>
</x-mail.layout>
