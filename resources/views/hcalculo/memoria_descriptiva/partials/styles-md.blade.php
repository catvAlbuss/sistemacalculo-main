{{-- partials/styles-md.blade.php - Estilos compartidos para Memoria Descriptiva --}}
<style>
    html {
        scroll-behavior: smooth;
    }

    /* Estilo para sección activa en sidebar (verde) */
    .section-active {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .section-active .icon-container {
        background: rgba(255, 255, 255, 0.2);
        color: white;
    }

    /* Animaciones para el modal */
    .modal-enter-active,
    .modal-leave-active {
        transition: opacity 0.3s ease;
    }

    .modal-enter-from,
    .modal-leave-to {
        opacity: 0;
    }

    /* Estilos para tabs y acordeones */
    .accordion-content {
        transition: max-height 0.3s ease-out;
        overflow: hidden;
    }

    /* Scroll suave */
    .scroll-mt-6 {
        scroll-margin-top: 1.5rem;
    }

    /* Estilos para tablas en preview */
    .table-preview {
        font-size: 0.75rem;
        line-height: 1.2;
    }

    .table-preview th,
    .table-preview td {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
    }

    /* Dark mode styles */
    .dark .table-preview th,
    .dark .table-preview td {
        border-color: #374151;
    }
</style>