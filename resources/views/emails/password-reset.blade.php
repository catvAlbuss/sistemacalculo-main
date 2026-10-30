<x-mail.layout title="Restablecer contraseña" preheader="Solicitud para restablecer la contraseña de su cuenta">
    <x-mail.text>Estimado(a) {{ $name }}:</x-mail.text>
    <x-mail.text>Recibimos una solicitud para restablecer la contraseña de su cuenta. El enlace es personal y vence en {{ $minutes }} minutos.</x-mail.text>
    <x-mail.actions><x-mail.button :href="$url">Restablecer contraseña</x-mail.button></x-mail.actions>
    <x-mail.note>Si usted no realizó esta solicitud, ignore este mensaje: su contraseña no cambiará.</x-mail.note>
</x-mail.layout>
