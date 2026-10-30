<x-mail.layout title="Aviso de vencimiento de su plan" :preheader="$subscription->plan->name.' vence el '.$subscription->ends_at->format('d/m/Y')">
    <x-mail.text>Estimado(a) {{ $subscription->user->name }}:</x-mail.text>
    <x-mail.text>Le informamos que su plan está próximo a vencer. Puede renovarlo desde su cuenta y conservar los días ya pagados. No realizamos cargos automáticos.</x-mail.text>
    <x-mail.section title="Su plan">
        <x-mail.row label="Plan">{{ $subscription->plan->name }}</x-mail.row>
        <x-mail.row label="Fecha de término" strong>{{ $subscription->ends_at->format('d/m/Y') }}</x-mail.row>
    </x-mail.section>
    <x-mail.actions><x-mail.button :href="route('plans.mine')">Revisar y renovar mi plan</x-mail.button></x-mail.actions>
    <x-mail.note>Los pagos se realizan únicamente desde la plataforma, mediante Culqi.</x-mail.note>
</x-mail.layout>
