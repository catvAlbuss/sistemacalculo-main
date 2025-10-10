<div class="notebook-table mt-4">
    <table class="w-full border-collapse">
        @if (isset($header))
            <thead>
                {{ $header }}
            </thead>
        @endif

        <tbody class="notebook-table-body">
            {{ $slot }}
        </tbody>
    </table>
</div>

@once
    <style>
        .notebook-table {
            position: relative;
            width: 100%;
            font-size: 0.9rem;
        }

        .notebook-table::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 2px;
            background-color: #ff0000;
        }

        .notebook-table table {
            background-image:
                linear-gradient(#e5e5e5 1px, transparent 1px),
                linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
            background-size: 20px 20px;
            border-spacing: 0;
        }

        .notebook-table th {
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #3498db;
        }

        .notebook-table td {
            padding: 8px;
            border: none;
        }

        .notebook-table-body tr:hover {
            background-color: rgba(52, 152, 219, 0.1);
        }

        .dark .notebook-table::before {
            background-color: #ff6b6b;
        }

        .dark .notebook-table table {
            background-image:
                linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
        }

        .dark .notebook-table th {
            border-bottom-color: #3498db;
        }

        .dark .notebook-table-body tr:hover {
            background-color: rgba(52, 152, 219, 0.2);
        }
    </style>
@endonce
