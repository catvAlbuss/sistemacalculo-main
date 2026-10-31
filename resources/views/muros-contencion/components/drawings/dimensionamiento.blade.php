{{-- Esquema de cotas. Sus líneas coinciden con los campos posicionados de la sección de dimensionamiento. --}}
<svg class="wall-diagram-image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 958 908" role="img" aria-label="Esquema de cotas del muro de contención">
    <defs>
        <pattern id="dim-concrete" width="28" height="28" patternUnits="userSpaceOnUse">
            <rect width="28" height="28" fill="#eef0f2"/>
            <path d="M5 7l4 1-3 3zM19 4l3 3-4 1zM12 18l4-1-1 4zM23 20l2 4-4-1z" fill="none" stroke="#7b8794" stroke-width=".8"/>
            <circle cx="13" cy="9" r=".8" fill="#7b8794"/><circle cx="4" cy="19" r=".8" fill="#7b8794"/>
        </pattern>
        <pattern id="dim-soil" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="16" height="16" fill="#f7efe0"/><path d="M0 4h16" stroke="#b08d57" stroke-width=".8"/><circle cx="8" cy="11" r=".9" fill="#b08d57"/>
        </pattern>
    </defs>
    <rect width="958" height="908" fill="#fff"/>
    <g transform="translate(-170 -41)" stroke="#1f2933" fill="none">
        <polygon points="745,213 940,145 945,655 745,655" fill="url(#dim-soil)" stroke="none"/>
        <path d="M745 213L940 145L1085 97" stroke-width="2"/>
        <polygon points="316,658 482,658 604,210 740,210 745,658 955,658 955,765 316,765" fill="url(#dim-concrete)" stroke-width="2.4"/>
        <line x1="604" y1="210" x2="604" y2="658" stroke-width="1" stroke-dasharray="10 6"/>
        <polygon points="218,207 362,207 362,312 247,312" fill="url(#dim-concrete)" stroke-width="2.4"/>
        <g stroke="#52606d" stroke-width="1.2">
            <path d="M592 168H748M604 158V178M740 158V178"/>
            <path d="M972 145V210M962 145H982M962 210H982"/>
            <path d="M972 222V645M962 222H982M962 645H982"/>
            <path d="M975 655V762M965 655H985M965 762H985"/>
            <path d="M316 775H480M484 775H740M746 775H955M316 767V785M482 767V785M743 767V785M955 767V785"/>
            <path d="M316 862H955M316 852V872M955 852V872"/>
            <path d="M214 186H366M218 176V196M362 176V196"/>
            <path d="M244 332H362M247 322V342M362 322V342"/>
            <path d="M372 207H390V312H372M390 258H406"/>
            <path d="M468 570V605H527V645"/>
        </g>
    </g>
    <g font-family="Figtree, Arial, Helvetica, sans-serif" fill="#1f2933" font-size="17" font-weight="700" paint-order="stroke" stroke="#fff" stroke-width="5">
        <text x="44" y="60">DENTELLÓN</text>
        <text x="675" y="400" text-anchor="middle">RELLENO</text>
        <text x="470" y="680" text-anchor="middle">ZAPATA</text>
    </g>
    <g font-family="Figtree, Arial, Helvetica, sans-serif" fill="#52606d" font-size="14">
        <text x="20" y="895" font-size="16">Cotas en metros. Esquema sin escala; campos amarillos editables.</text>
    </g>
</svg>
