<x-mail.layout title="Solicitud de cotización" reference="Web">
    <x-mail.section title="Solicitante">
        <x-mail.row label="Nombre">{{ $datos['nombre'] }}</x-mail.row>
        <x-mail.row label="Celular">{{ $datos['celular'] }}</x-mail.row>
        <x-mail.row label="Correo">{{ $datos['email'] }}</x-mail.row>
    </x-mail.section>
    <x-mail.note>El plano de referencia va adjunto. Al responder este correo, el mensaje llega al solicitante.</x-mail.note>
</x-mail.layout>
