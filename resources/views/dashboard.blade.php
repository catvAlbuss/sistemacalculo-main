<x-app-layout>
    <x-slot name="header">
         @if ($alert)
                @php
                    $styles = [
                        'info' =>
                            'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200',
                        'warning' =>
                            'bg-yellow-100 border-yellow-400 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-200',
                        'danger' =>
                            'bg-red-100 border-red-400 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200',
                        'success' =>
                            'bg-green-100 border-green-400 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-200',
                    ];
                    $icon = [
                        'info' => 'fas fa-info-circle',
                        'warning' => 'fas fa-exclamation-triangle',
                        'danger' => 'fas fa-times-circle',
                        'success' => 'fas fa-check-circle',
                    ];
                    $alertClass = $styles[$alert['type']] ?? $styles['info'];
                    $alertIcon = $icon[$alert['type']] ?? $icon['info'];
                @endphp

                <div class="p-4 rounded-lg border-l-4 font-medium {{ $alertClass }}" role="alert">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div class="flex items-start gap-3">
                            <i class="{{ $alertIcon }} text-xl mt-1"></i>
                            <p class="text-sm leading-relaxed">{!! $alert['message'] !!}</p>
                        </div>

                        @if (!empty($alert['show_button']))
                            <a href="{{ route('contacto.index') }}"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 transition">
                                <i class="fas fa-shopping-cart"></i>
                                Adquirir un Plan
                            </a>
                        @endif
                    </div>
                </div>
            @endif
    </x-slot>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <style>
                #bg-canvas {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    opacity: 0.3;
                }
        
                .container {
                    position: relative;
                    z-index: 1;
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 2rem;
                }
        
                .hero {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
                    border-radius: 24px;
                    margin-bottom: 3rem;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    backdrop-filter: blur(10px);
                    animation: fadeInUp 0.8s ease-out;
                }
        
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
        
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
        
                .hero-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    display: inline-block;
                    animation: float 3s ease-in-out infinite;
                }
        
                @keyframes float {
        
                    0%,
                    100% {
                        transform: translateY(0px);
                    }
        
                    50% {
                        transform: translateY(-20px);
                    }
                }
        
                .hero h1 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                    letter-spacing: -1px;
                }
        
                .hero p {
                    font-size: 1.25rem;
                    color: #cbd5e1;
                    max-width: 700px;
                    margin: 0 auto;
                }
        
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                    animation: fadeInUp 0.8s ease-out 0.2s both;
                }
        
                .stat-card {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
                    padding: 2rem;
                    border-radius: 16px;
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
        
                .stat-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
                }
        
                .stat-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    display: block;
                }
        
                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #3b82f6;
                    margin-bottom: 0.5rem;
                }
        
                .stat-label {
                    color: #94a3b8;
                    font-size: 0.95rem;
                }
        
                .section {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
                    padding: 2.5rem;
                    border-radius: 20px;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(59, 130, 246, 0.15);
                    backdrop-filter: blur(10px);
                    animation: fadeInUp 0.8s ease-out 0.4s both;
                }
        
                .section-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #e2e8f0;
                }
        
                .section-title span {
                    font-size: 2rem;
                }
        
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
        
                .feature-card {
                    background: linear-gradient(135deg, rgba(51, 65, 85, 0.5) 0%, rgba(71, 85, 105, 0.3) 100%);
                    padding: 1.75rem;
                    border-radius: 12px;
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
        
                .feature-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
        
                .feature-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(59, 130, 246, 0.5);
                }
        
                .feature-card:hover::before {
                    opacity: 1;
                }
        
                .feature-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    display: block;
                    position: relative;
                    z-index: 1;
                }
        
                .feature-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #f1f5f9;
                    margin-bottom: 0.5rem;
                    position: relative;
                    z-index: 1;
                }
        
                .feature-desc {
                    color: #94a3b8;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    position: relative;
                    z-index: 1;
                }
        
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }
        
                .tag {
                    padding: 0.6rem 1.2rem;
                    border-radius: 50px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border: 1px solid;
                    cursor: pointer;
                }
        
                .tag:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                }
        
                .tag-blue {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%);
                    border-color: rgba(59, 130, 246, 0.4);
                    color: #60a5fa;
                }
        
                .tag-green {
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
                    border-color: rgba(34, 197, 94, 0.4);
                    color: #4ade80;
                }
        
                .tag-purple {
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
                    border-color: rgba(168, 85, 247, 0.4);
                    color: #c084fc;
                }
        
                .tag-amber {
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
                    border-color: rgba(245, 158, 11, 0.4);
                    color: #fbbf24;
                }
        
                .cta {
                    background: linear-gradient(135deg, #000000 0%, #ffffff 100%);
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    margin-bottom: 2rem;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: fadeInUp 0.8s ease-out 0.6s both;
                    position: relative;
                    overflow: hidden;
                }
                
                .cta::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    animation: shine 3s infinite;
                }
                
                @keyframes shine {
                    0% {
                        transform: translateX(-100%) translateY(-100%) rotate(45deg);
                    }
                    100% {
                        transform: translateX(100%) translateY(100%) rotate(45deg);
                    }
                }
                
                .cta h2 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #ffffff; /* Blanco para contrastar con el fondo oscuro */
                    margin-bottom: 1rem;
                    position: relative;
                    z-index: 1;
                }
                
                .cta p {
                    font-size: 1.1rem;
                    color: rgba(255, 255, 255, 0.9); /* Texto claro sobre fondo oscuro */
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 1;
                }
                
                .cta-button {
                    display: inline-block;
                    padding: 1rem 2.5rem;
                    background: #ffffff; /* Botón blanco */
                    color: #000000; /* Texto negro */
                    font-weight: 700;
                    border-radius: 50px;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    font-size: 1.1rem;
                    position: relative;
                    z-index: 1;
                    border: none;
                    cursor: pointer;
                }
                
                .cta-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    background: #f1f1f1;
                }
        
                .benefits-list {
                    display: grid;
                    gap: 1rem;
                }
        
                .benefit-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem;
                    background: linear-gradient(135deg, rgba(51, 65, 85, 0.3) 0%, rgba(71, 85, 105, 0.2) 100%);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
        
                .benefit-item:hover {
                    transform: translateX(10px);
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
                }
        
                .benefit-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }
        
                .benefit-text {
                    color: #cbd5e1;
                    line-height: 1.6;
                }
        
                @media (max-width: 768px) {
                    .hero h1 {
                        font-size: 2.5rem;
                    }
        
                    .hero p {
                        font-size: 1rem;
                    }
        
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
        
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
            <canvas id="bg-canvas"></canvas>
        
            <div class="container">
                <div class="hero">
                    <div class="hero-icon">🏗️</div>
                    <h1>R&AIE</h1>
                    <p>Plataforma avanzada de ingeniería estructural con herramientas profesionales para optimizar tus diseños</p>
                </div>
        
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-icon">⚡</span>
                        <div class="stat-value">10x</div>
                        <div class="stat-label">Más rápido que cálculos manuales</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">🎯</span>
                        <div class="stat-value">99.9%</div>
                        <div class="stat-label">Precisión en resultados</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">📋</span>
                        <div class="stat-value">15+</div>
                        <div class="stat-label">Normas internacionales</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">🌍</span>
                        <div class="stat-value">24/7</div>
                        <div class="stat-label">Acceso desde cualquier lugar</div>
                    </div>
                </div>
        
                <div class="section">
                    <h3 class="section-title">
                        <span>✨</span>
                        Beneficios Clave
                    </h3>
                    <div class="benefits-list">
                        <div class="benefit-item">
                            <span class="benefit-icon">🚀</span>
                            <div class="benefit-text">
                                <strong>Acelera tu flujo de trabajo:</strong> Reduce el tiempo de diseño estructural hasta en un
                                80% con cálculos automatizados y plantillas predefinidas
                            </div>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">🔬</span>
                            <div class="benefit-text">
                                <strong>Máxima precisión:</strong> Algoritmos verificados que garantizan cálculos exactos según
                                normas ACI, EHE, NTC y más estándares internacionales
                            </div>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">📊</span>
                            <div class="benefit-text">
                                <strong>Reportes profesionales:</strong> Genera documentación técnica completa en PDF y Excel
                                lista para presentar a clientes o supervisores
                            </div>
                        </div>
                        <div class="benefit-item">
                            <span class="benefit-icon">💼</span>
                            <div class="benefit-text">
                                <strong>Cumplimiento normativo:</strong> Verifica automáticamente que tus diseños cumplan con
                                todas las regulaciones vigentes
                            </div>
                        </div>
                    </div>
                </div>
        
                <div class="section">
                    <h3 class="section-title">
                        <span>🔧</span>
                        Herramientas Especializadas
                    </h3>
                    <div class="features-grid">
                        <div class="feature-card">
                            <span class="feature-icon">🏛️</span>
                            <div class="feature-title">Diseño de Concreto Armado</div>
                            <div class="feature-desc">Vigas, columnas, losas y muros con verificación de resistencia, deflexión
                                y agrietamiento según ACI 318</div>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">🔩</span>
                            <div class="feature-title">Estructuras Metálicas</div>
                            <div class="feature-desc">Perfiles de acero, conexiones atornilladas y soldadas con verificación
                                AISC y Eurocódigo 3</div>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">🌲</span>
                            <div class="feature-title">Diseño en Madera</div>
                            <div class="feature-desc">Elementos de madera laminada y maciza con verificación según NDS y normas
                                europeas</div>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">🧱</span>
                            <div class="feature-title">Mampostería Estructural</div>
                            <div class="feature-desc">Muros de carga, análisis sísmico y diseño de refuerzos para estructuras de
                                mampostería</div>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">🏗️</span>
                            <div class="feature-title">Cimentaciones</div>
                            <div class="feature-desc">Zapatas, vigas de cimentación y losas con análisis de capacidad portante
                                del suelo</div>
                        </div>
                        <div class="feature-card">
                            <span class="feature-icon">📐</span>
                            <div class="feature-title">Análisis Estructural</div>
                            <div class="feature-desc">Modelos de elementos finitos, análisis modal y respuesta sísmica con
                                visualización 3D</div>
                        </div>
                    </div>
                </div>
        
                <div class="section">
                    <h3 class="section-title">
                        <span>🎯</span>
                        Diseñado Para Profesionales
                    </h3>
                    <div class="tags">
                        <div class="tag tag-blue">Ingenieros Estructurales</div>
                        <div class="tag tag-green">Estudiantes de Ingeniería Civil</div>
                        <div class="tag tag-purple">Profesionales de la Construcción</div>
                        <div class="tag tag-amber">Docentes y Capacitadores</div>
                    </div>
                </div>
        
                <div class="cta">
                    <h2>🚀 Transforma Tu Forma de Diseñar</h2>
                    <p>Únete a miles de ingenieros que confían en R&AIE para sus proyectos estructurales</p>
                    <button class="cta-button">Explorar Herramientas</button>
                </div>
        
                <div style="text-align: center; color: #64748b; font-size: 0.9rem; padding: 2rem 0;">
                    ¿Tienes preguntas o sugerencias? <a href="#"
                        style="color: #3b82f6; text-decoration: none; font-weight: 600;">Contáctanos</a>
                </div>
            </div>
        
            <script>
                // Three.js background animation
                const canvas = document.getElementById('bg-canvas');
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({
                    canvas,
                    alpha: true
                });
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.position.z = 5;
        
                const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x3b82f6,
                    wireframe: true
                });
                const torus = new THREE.Mesh(geometry, material);
                scene.add(torus);
        
                const pointGeometry = new THREE.BufferGeometry();
                const pointCount = 1000;
                const positions = new Float32Array(pointCount * 3);
        
                for (let i = 0; i < pointCount * 3; i++) {
                    positions[i] = (Math.random() - 0.5) * 100;
                }
        
                pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const pointMaterial = new THREE.PointsMaterial({
                    color: 0x3b82f6,
                    size: 0.1
                });
                const points = new THREE.Points(pointGeometry, pointMaterial);
                scene.add(points);
        
                function animate() {
                    requestAnimationFrame(animate);
                    torus.rotation.x += 0.001;
                    torus.rotation.y += 0.002;
                    points.rotation.y += 0.0005;
                    renderer.render(scene, camera);
                }
        
                animate();
        
                window.addEventListener('resize', () => {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                });
            </script>
</x-app-layout>
