import * as THREE from 'three';

// Conserva la geometría, las partículas y las velocidades del dashboard original.
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    } catch {
        canvas.hidden = true;
    }
    if (renderer) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
        camera.position.z = 5;
        renderer.setSize(innerWidth, innerHeight);
        const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true });
        const torus = new THREE.Mesh(geometry, material);
        scene.add(torus);
        const pointGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(1000 * 3);
        for (let i = 0; i < positions.length; i++) positions[i] = (Math.random() - 0.5) * 100;
        pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointMaterial = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.1 });
        const points = new THREE.Points(pointGeometry, pointMaterial);
        scene.add(points);
        let frame;
        const animate = () => {
            frame = requestAnimationFrame(animate);
            torus.rotation.x += 0.001;
            torus.rotation.y += 0.002;
            points.rotation.y += 0.0005;
            renderer.render(scene, camera);
        };
        const resize = () => {
            camera.aspect = innerWidth / innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(innerWidth, innerHeight);
        };
        animate();
        canvas.dataset.backgroundReady = 'true';
        addEventListener('resize', resize);
        addEventListener('pagehide', () => {
            cancelAnimationFrame(frame);
            removeEventListener('resize', resize);
            geometry.dispose(); material.dispose();
            pointGeometry.dispose(); pointMaterial.dispose(); renderer.dispose();
        }, { once: true });
    }
}
