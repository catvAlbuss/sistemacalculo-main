{{-- Colócalo dentro de un formulario multipart. Sin JavaScript, el formulario se envía de forma normal. --}}
@props(['maxMb', 'title' => 'Subiendo archivo'])
@php($limits = array_filter([$maxMb * 1024 * 1024, ini_parse_quantity(ini_get('upload_max_filesize')), ini_parse_quantity(ini_get('post_max_size'))]))
@vite('resources/js/upload-progress.js')
<dialog class="up-dialog" data-upload-dialog data-title="{{ $title }}" data-max-bytes="{{ min($limits) }}" closedby="none" aria-labelledby="upload-title">
    <h2 id="upload-title" data-upload-title aria-live="polite">{{ $title }}</h2>
    <p data-upload-detail></p>
    <div class="up-meter"><progress data-upload-bar max="100" value="0" aria-labelledby="upload-title"></progress><strong data-upload-percent>0%</strong></div>
    <p class="pr-hint" data-upload-note>No cierres esta ventana. Si cancelas, tus datos siguen en el formulario.</p>
    <div class="up-actions"><button type="button" class="pr-button pr-button-secondary" data-upload-cancel>Cancelar carga</button><button type="button" class="pr-button" data-upload-close hidden>Volver al formulario</button></div>
</dialog>
