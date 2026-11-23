<x-mail.layout title="Su cuenta fue dada de baja" preheader="Su plan venció y no se renovó.">
    <x-mail.text>Estimado(a) {{ $user->name }}:</x-mail.text>
    <x-mail.text>Su plan venció hace {{ $dias }} días y no se renovó, por lo que su cuenta fue dada de baja y se cerraron sus sesiones.</x-mail.text>
    <x-mail.text>Sus proyectos se conservan. Si desea volver a usar la plataforma, responda a este correo o escríbanos y reactivamos su cuenta.</x-mail.text>
    <x-mail.note>Este es un aviso automático.</x-mail.note>
</x-mail.layout>
