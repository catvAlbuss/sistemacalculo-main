<footer class="engineering-footer">
    <div class="en-footer-shell">
        <section class="space-y-2" aria-label="Datos del proveedor">
            <p class="font-bold">{{ config('legal.provider.name') }}</p>
            @if(config('legal.provider.ruc'))<p>RUC: {{ config('legal.provider.ruc') }}</p>@endif
            @if(config('legal.provider.address'))<p>Dirección: {{ config('legal.provider.address') }}</p>@endif
            @if(config('legal.provider.phone'))<p>Teléfono: <a class="underline" href="tel:+{{ preg_replace('/\D/', '', config('legal.provider.phone')) }}">+{{ preg_replace('/\D/', '', config('legal.provider.phone')) }}</a></p>@endif
            @if(config('legal.provider.email'))<p>Correo: <a class="underline" href="mailto:{{ config('legal.provider.email') }}">{{ config('legal.provider.email') }}</a></p>@endif
        </section>
        <nav aria-label="Información legal">
            <a class="underline" href="{{ route('legal.terminos') }}">Términos y condiciones</a>
            <a class="underline" href="{{ route('legal.devoluciones') }}">Política de cambios y devoluciones</a>
            <a class="underline" href="{{ route('legal.privacidad') }}">Política de privacidad</a>
            <a class="rounded-lg border-2 border-blue-600 px-4 py-3 font-bold text-blue-700 dark:text-blue-300" href="{{ route('complaints.create') }}">Libro de Reclamaciones</a>
        </nav>
    </div>
</footer>
