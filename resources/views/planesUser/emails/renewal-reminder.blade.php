<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Renovación de tu plan</title></head><body style="font-family:Arial,sans-serif;color:#1f2937">
<h1>Tu plan está por vencer</h1>
<p>Hola, {{ $subscription->user->name }}.</p>
<p>Tu plan {{ $subscription->plan->name }} termina el {{ $subscription->ends_at->format('d/m/Y') }}.</p>
<p>Puedes renovar desde tu cuenta y conservar los días que ya pagaste. No realizaremos un cargo automático.</p>
<p><a href="{{ route('plans.mine') }}">Revisar mi plan y renovar</a></p>
<p>Los pagos se realizan únicamente desde la plataforma con Culqi. No envíes datos de tu tarjeta ni contraseñas por correo.</p>
</body></html>
