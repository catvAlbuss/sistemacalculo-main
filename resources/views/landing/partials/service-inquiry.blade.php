<form method="POST" action="{{ route('cotizarplano') }}" enctype="multipart/form-data" class="en-inquiry-form">
    @csrf
    @if(session('success'))<p class="en-notice" role="status">{{ session('success') }}</p>@endif
    @if(session('error'))<p class="pr-error" role="alert">{{ session('error') }}</p>@endif
    <div><label for="nombre" class="pr-label">Nombre</label><input class="pr-input" id="nombre" name="nombre" type="text" value="{{ old('nombre') }}" required maxlength="255" autocomplete="name" placeholder="Nombres y apellidos" aria-invalid="{{ $errors->has('nombre') ? 'true' : 'false' }}">@error('nombre')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
    <div><label for="celular" class="pr-label">Celular / WhatsApp</label><input class="pr-input" id="celular" name="celular" type="tel" value="{{ old('celular') }}" required maxlength="20" autocomplete="tel-national" placeholder="999999999" aria-invalid="{{ $errors->has('celular') ? 'true' : 'false' }}">@error('celular')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
    <div><label for="email" class="pr-label">Correo electrónico</label><input class="pr-input" id="email" name="email" type="email" value="{{ old('email') }}" required maxlength="255" autocomplete="email" placeholder="tu@correo.com" aria-invalid="{{ $errors->has('email') ? 'true' : 'false' }}">@error('email')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
    <div><label for="archivo" class="pr-label">Plano de referencia</label><input class="pr-input" id="archivo" name="archivo" type="file" accept="application/pdf,image/jpeg,image/png" required aria-describedby="file-help" aria-invalid="{{ $errors->has('archivo') ? 'true' : 'false' }}"><p id="file-help" class="pr-hint">PDF, JPG o PNG · Máximo 10 MB. Todos los campos son obligatorios.</p>@error('archivo')<p class="pr-field-error">{{ $message }}</p>@enderror</div>
    <button type="submit" class="pr-button">Enviar consulta <span aria-hidden="true">↗︎</span></button>
    <p class="pr-hint">Usaremos estos datos para atender tu solicitud. Consulta nuestra <a href="{{ route('legal.privacidad') }}" class="en-inline-link">Política de privacidad</a>.</p>
</form>
