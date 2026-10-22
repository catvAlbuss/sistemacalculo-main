<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>{{ ucfirst($receipt->receipt_type) }} interna {{ $receipt->number }}</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 24px 12px; background: #eef2f6; color: #111; font-family: Arial, sans-serif; }
        .toolbar { max-width: 80mm; margin: 0 auto 16px; display: flex; gap: 12px; align-items: center; }
        button { border: 0; border-radius: 6px; background: #2563eb; color: white; padding: 10px 16px; cursor: pointer; }
        .toolbar a { color: #2563eb; font-size: 13px; }
        .ticket { width: 80mm; max-width: 100%; margin: auto; padding: 5mm; background: white; font: 12px/1.45 'Courier New', monospace; overflow-wrap: anywhere; }
        h1 { margin: 0 0 4px; font-size: 17px; }
        h2 { margin: 8px 0 4px; font-size: 14px; }
        p { margin: 4px 0; }
        .center { text-align: center; }
        .muted { font-size: 10px; }
        .rule { margin: 12px 0; border-top: 1px dashed #555; }
        .row { display: flex; justify-content: space-between; gap: 8px; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { padding: 5px 0; text-align: left; vertical-align: top; }
        th:first-child { width: 10%; }
        th:last-child, td:last-child { width: 28%; text-align: right; }
        .total { font-size: 17px; font-weight: bold; }
        @page { margin: 0; }
        @media print {
            body { width: 80mm; margin: 0; padding: 0; background: white; }
            .toolbar { display: none; }
            .ticket { width: 80mm; max-width: none; margin: 0; box-shadow: none; }
            .ticket section { break-inside: avoid; }
        }
    </style>
    <style id="thermal-page-size" media="print"></style>
</head>
<body>
    <div class="toolbar"><button type="button" onclick="window.print()">Imprimir / guardar PDF</button><a href="{{ route('landing.plans') }}">Ver planes</a></div>
    <article class="ticket">
        <header class="center">
            <h1>{{ $receipt->issuer['legal_name'] ?? 'Emisor pendiente' }}</h1>
            <p>RUC: {{ ($receipt->issuer['ruc'] ?? null) ?: 'Pendiente de configurar' }}</p>
            <p>{{ ($receipt->issuer['address'] ?? null) ?: 'Dirección del emisor pendiente' }}</p>
            @if (!empty($receipt->issuer['email']))<p>{{ $receipt->issuer['email'] }}</p>@endif
            <div class="rule"></div>
            <h2>{{ strtoupper($receipt->receipt_type) }} · TICKET INTERNO</h2>
            <p>{{ $receipt->number }}</p>
            <p>{{ $receipt->issued_at->timezone('America/Lima')->format('d/m/Y H:i') }}</p>
        </header>
        <div class="rule"></div>
        <section>
            <p><strong>Receptor:</strong> {{ $receipt->customer_name }}</p>
            <p><strong>{{ $receipt->document_type }}:</strong> {{ $receipt->document_number }}</p>
            @if ($receipt->customer_address)<p><strong>Dirección:</strong> {{ $receipt->customer_address }}</p>@endif
            @if ($receipt->customer_location)<p>{{ $receipt->customer_location['distrito'] }} · {{ $receipt->customer_location['provincia'] }} · {{ $receipt->customer_location['departamento'] }}</p><p>Ubigeo: {{ $receipt->customer_location['codigo'] }}</p>@endif
            <p><strong>Correo:</strong> {{ $receipt->customer_email }}</p>
        </section>
        <div class="rule"></div>
        <section>
            <table><thead><tr><th>Cant.</th><th>Descripción</th><th>Importe</th></tr></thead><tbody><tr><td>1</td><td>{{ $receipt->description }}</td><td>{{ number_format($receipt->total, 2) }}</td></tr></tbody></table>
            <div class="rule"></div>
            @if ($receipt->subtotal !== null && $receipt->tax_amount !== null)
                <p class="row"><span>Subtotal</span><span>S/ {{ number_format($receipt->subtotal, 2) }}</span></p>
                <p class="row"><span>IGV ({{ number_format($receipt->tax_rate, 0) }} %)</span><span>S/ {{ number_format($receipt->tax_amount, 2) }}</span></p>
            @endif
            <p class="row total"><span>TOTAL PAGADO</span><span>S/ {{ number_format($receipt->total, 2) }}</span></p>
            <p>Moneda: {{ $receipt->currency }} · Pago al contado</p>
            <p>Pasarela: Culqi</p>
            <p class="muted">Operación: {{ $receipt->charge_id }}</p>
        </section>
        <div class="rule"></div>
        <footer class="center">
            <p><strong>Pago confirmado</strong></p>
            <p class="muted">Documento interno sin validez tributaria.<br>Pendiente de emisión electrónica mediante SUNAT.</p>
            <p class="muted">Referencia interna. La serie y el número fiscal se definirán al integrar la emisión electrónica.</p>
            <p>Gracias por tu compra.</p>
        </footer>
    </article>
    <script>
        window.addEventListener('beforeprint', () => {
            const ticket = document.querySelector('.ticket');
            const previousMaxWidth = ticket.style.maxWidth;
            ticket.style.maxWidth = 'none';
            const heightMm = Math.ceil(ticket.getBoundingClientRect().height * 25.4 / 96) + 2;
            ticket.style.maxWidth = previousMaxWidth;
            document.getElementById('thermal-page-size').textContent = `@page { size: 80mm ${heightMm}mm; margin: 0; }`;
        });
    </script>
</body>
</html>
