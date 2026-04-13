{{-- resources/views/components/cad/cad-3d-viewer.blade.php --}}
@props(['cadSystemId' => 'cad-system'])

<div x-data="cad3DViewer()" 
     x-init="init3DViewer('{{ $cadSystemId }}')"
     class="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
    
    {{-- Contenedor para Three.js --}}
    <div id="viewer-3d-container" class="w-full h-full"></div>
    
    {{-- Controles flotantes --}}
    <div class="absolute bottom-4 right-4 flex gap-2 z-10">
        <button @click="resetCamera()" 
                class="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition"
                title="Resetear cámara">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z M12 8v4l3 3"></path>
            </svg>
        </button>
        
        <button @click="toggleGrid()" 
                class="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition"
                title="Mostrar/Ocultar grid">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-width="2" d="M4 6h16v12H4z M8 6v12 M12 6v12 M16 6v12 M4 10h16 M4 14h16"/>
            </svg>
        </button>
        
        <button @click="toggleAxes()" 
                class="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition"
                title="Mostrar/Ocultar ejes">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-width="2" d="M3 3h18v18H3z M12 3v18 M3 12h18"/>
            </svg>
        </button>
    </div>
    
    {{-- Indicador de carga --}}
    <div x-show="isLoading" 
         class="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
        <div class="bg-gray-800 rounded-lg p-4 flex items-center gap-3">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span class="text-white">Calculando estructura 3D...</span>
        </div>
    </div>
</div>

@push('scripts')
<script>
function cad3DViewer() {
    return {
        scene: null,
        camera: null,
        renderer: null,
        controls: null,
        labelRenderer: null,
        elements3D: [],
        nodeLabels: [],
        supports3D: [],
        isLoading: false,
        showGrid: true,
        showAxes: true,
        
        init3DViewer(cadSystemId) {
            // Obtener referencia al sistema CAD
            this.cadSystem = window[cadSystemId] || window.cadSystem;
            
            // Inicializar Three.js
            this.initThree();
            
            // Sincronizar cada segundo
            setInterval(() => {
                if (this.cadSystem && this.cadSystem.nodes?.length > 0) {
                    this.syncWithCAD();
                }
            }, 500);
        },
        
        initThree() {
            const container = document.getElementById('viewer-3d-container');
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            // Escena
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x1a1a2e);
            this.scene.fog = new THREE.Fog(0x1a1a2e, 30, 60);
            
            // Cámara
            this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
            this.camera.position.set(10, 8, 12);
            this.camera.lookAt(0, 3, 0);
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(width, height);
            this.renderer.shadowMap.enabled = true;
            this.renderer.setClearColor(0x1a1a2e);
            container.appendChild(this.renderer.domElement);
            
            // Renderer para etiquetas
            this.labelRenderer = new CSS2DRenderer();
            this.labelRenderer.setSize(width, height);
            this.labelRenderer.domElement.style.position = 'absolute';
            this.labelRenderer.domElement.style.top = '0px';
            this.labelRenderer.domElement.style.left = '0px';
            this.labelRenderer.domElement.style.pointerEvents = 'none';
            container.appendChild(this.labelRenderer.domElement);
            
            // Controles
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.zoomSpeed = 1.2;
            this.controls.rotateSpeed = 1.0;
            
            // Luces
            this.setupLights();
            
            // Grid y ejes
            this.setupGrid();
            this.setupAxes();
            
            // Animación
            this.animate();
            
            // Resize handler
            window.addEventListener('resize', () => this.onResize());
        },
        
        setupLights() {
            const ambientLight = new THREE.AmbientLight(0x404060);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 10, 7);
            directionalLight.castShadow = true;
            directionalLight.receiveShadow = true;
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            this.scene.add(directionalLight);
            
            const backLight = new THREE.DirectionalLight(0x88aaff, 0.5);
            backLight.position.set(-3, 2, -4);
            this.scene.add(backLight);
            
            const fillLight = new THREE.PointLight(0x4466cc, 0.3);
            fillLight.position.set(2, 3, 4);
            this.scene.add(fillLight);
        },
        
        setupGrid() {
            this.gridHelper = new THREE.GridHelper(20, 20, 0x88aaff, 0x335588);
            this.gridHelper.position.y = -0.01;
            this.gridHelper.material.transparent = true;
            this.gridHelper.material.opacity = 0.5;
            this.scene.add(this.gridHelper);
            
            this.minorGrid = new THREE.GridHelper(20, 40, 0x4488aa, 0x224466);
            this.minorGrid.position.y = -0.005;
            this.minorGrid.material.transparent = true;
            this.minorGrid.material.opacity = 0.3;
            this.scene.add(this.minorGrid);
        },
        
        setupAxes() {
            this.axesHelper = new THREE.AxesHelper(5);
            this.axesHelper.material.transparent = true;
            this.axesHelper.material.opacity = 0.3;
            this.scene.add(this.axesHelper);
        },
        
        syncWithCAD() {
            if (!this.cadSystem) return;
            
            // Limpiar elementos anteriores
            this.clearScene();
            
            // Crear vigas 3D
            this.cadSystem.shapes?.forEach(beam => {
                const cylinder = this.createBeam3D(beam);
                if (cylinder) this.elements3D.push(cylinder);
            });
            
            // Crear nodos 3D
            this.cadSystem.nodes?.forEach(node => {
                const sphere = this.createNode3D(node);
                const label = this.createNodeLabel(node);
                if (sphere) this.elements3D.push(sphere);
                if (label) this.nodeLabels.push(label);
                
                // Crear soporte 3D
                if (node.soporte) {
                    const support = this.createSupport3D(node);
                    if (support) this.elements3D.push(support);
                }
            });
        },
        
        createBeam3D(beam) {
            if (!beam.node1 || !beam.node2) return null;
            
            const start = new THREE.Vector3(
                beam.node1.position.x, 
                beam.node1.position.y, 
                beam.node1.position.z || 0
            );
            const end = new THREE.Vector3(
                beam.node2.position.x, 
                beam.node2.position.y, 
                beam.node2.position.z || 0
            );
            
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            const radius = 0.08;
            
            const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
            const color = this.getBeamColor(beam);
            const material = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.7 });
            const cylinder = new THREE.Mesh(geometry, material);
            
            const center = start.clone().add(end).multiplyScalar(0.5);
            cylinder.position.copy(center);
            cylinder.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
            );
            
            cylinder.castShadow = true;
            cylinder.receiveShadow = true;
            this.scene.add(cylinder);
            
            return cylinder;
        },
        
        createNode3D(node) {
            const geometry = new THREE.SphereGeometry(0.12, 24, 24);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x88aaff, 
                roughness: 0.2, 
                metalness: 0.8,
                emissive: 0x112233
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(node.position.x, node.position.y, node.position.z || 0);
            sphere.castShadow = true;
            sphere.receiveShadow = true;
            this.scene.add(sphere);
            return sphere;
        },
        
        createNodeLabel(node) {
            const div = document.createElement('div');
            div.textContent = `${node.id}`;
            div.style.color = '#ffffff';
            div.style.fontSize = '11px';
            div.style.fontWeight = 'bold';
            div.style.textShadow = '1px 1px 0px rgba(0,0,0,0.5)';
            div.style.background = 'rgba(0,0,0,0.7)';
            div.style.padding = '2px 6px';
            div.style.borderRadius = '10px';
            div.style.borderLeft = '3px solid #88aaff';
            div.style.fontFamily = 'monospace';
            
            const label = new CSS2DObject(div);
            label.position.set(node.position.x, node.position.y + 0.25, node.position.z || 0);
            this.scene.add(label);
            return label;
        },
        
        createSupport3D(node) {
            const position = new THREE.Vector3(node.position.x, node.position.y, node.position.z || 0);
            let geometry, material, mesh;
            
            switch(node.soporte) {
                case 'soporteUno':  // Empotrado
                    geometry = new THREE.BoxGeometry(0.45, 0.15, 0.45);
                    material = new THREE.MeshStandardMaterial({ color: 0xff6666, emissive: 0x441111 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(position);
                    mesh.position.y -= 0.1;
                    break;
                    
                case 'soporteDos':  // Rodillo
                    geometry = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 8);
                    material = new THREE.MeshStandardMaterial({ color: 0x66ff66, emissive: 0x114411 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(position);
                    mesh.position.y -= 0.05;
                    break;
                    
                case 'soporteTres':  // Articulado
                    geometry = new THREE.SphereGeometry(0.18, 16, 16);
                    material = new THREE.MeshStandardMaterial({ color: 0xffaa66, emissive: 0x442200 });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.copy(position);
                    break;
            }
            
            if (mesh) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                this.scene.add(mesh);
            }
            return mesh;
        },
        
        getBeamColor(beam) {
            if (beam.fAxial > 0.001) return 0x3b82f6;   // Tracción - Azul
            if (beam.fAxial < -0.001) return 0xef4444;  // Compresión - Rojo
            return 0x6D7B8D;  // Neutro - Gris
        },
        
        clearScene() {
            this.elements3D.forEach(el => {
                if (el.parent) this.scene.remove(el);
                if (el.geometry) el.geometry.dispose();
                if (el.material) el.material.dispose();
            });
            this.nodeLabels.forEach(label => {
                if (label.parent) this.scene.remove(label);
            });
            this.elements3D = [];
            this.nodeLabels = [];
        },
        
        resetCamera() {
            this.camera.position.set(10, 8, 12);
            this.camera.lookAt(0, 3, 0);
            this.controls.target.set(0, 3, 0);
            this.controls.update();
        },
        
        toggleGrid() {
            this.showGrid = !this.showGrid;
            this.gridHelper.visible = this.showGrid;
            this.minorGrid.visible = this.showGrid;
        },
        
        toggleAxes() {
            this.showAxes = !this.showAxes;
            this.axesHelper.visible = this.showAxes;
        },
        
        animate() {
            requestAnimationFrame(() => this.animate());
            if (this.controls) this.controls.update();
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
            if (this.labelRenderer && this.scene && this.camera) {
                this.labelRenderer.render(this.scene, this.camera);
            }
        },
        
        onResize() {
            const container = document.getElementById('viewer-3d-container');
            if (!container) return;
            
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.labelRenderer.setSize(width, height);
        }
    }
}
</script>
@endpush