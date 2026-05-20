/**
 * Hero 3D Solid Model Engine
 * Creates a high-fidelity solid 3D geometry for the hero section
 */

function initSolidHero() {
    const container = document.getElementById('hero-3d-nexus');
    if (!container || typeof THREE === 'undefined') return;

    // Cleanup existing
    container.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    // ─── SOLID GEOMETRY (The Core Nexus) ───
    const group = new THREE.Group();

    // 1. Inner Solid Octahedron
    const coreGeom = new THREE.OctahedronGeometry(1.2, 0);
    const coreMat = new THREE.MeshPhongMaterial({ 
        color: 0x00e5ff, 
        flatShading: true,
        shininess: 100,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.2
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    group.add(core);

    // 2. Floating Solid Shards (Orbiting)
    const shardGeom = new THREE.BoxGeometry(0.2, 0.6, 0.1);
    const shardMat = new THREE.MeshPhongMaterial({ color: 0xa855f7, flatShading: true });
    
    for (let i = 0; i < 8; i++) {
        const shard = new THREE.Mesh(shardGeom, shardMat);
        const angle = (i / 8) * Math.PI * 2;
        shard.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
        shard.rotation.z = angle;
        group.add(shard);
    }

    // 3. Transparent Outer Shell
    const shellGeom = new THREE.IcosahedronGeometry(2.2, 1);
    const shellMat = new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.15,
        roughness: 0,
        metalness: 0.5,
        transmission: 0.5,
        thickness: 1
    });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    group.add(shell);

    scene.add(group);

    // ─── LIGHTING ───
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 1, 100);
    cyanLight.position.set(-5, -2, 2);
    scene.add(cyanLight);

    const ambLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambLight);

    camera.position.z = 5;

    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        group.rotation.y += 0.01;
        group.rotation.x = Math.sin(t * 0.5) * 0.2;
        
        core.rotation.y -= 0.02;
        core.scale.setScalar(1 + Math.sin(t * 2) * 0.05);

        renderer.render(scene, camera);
    }
    animate();
}

// Initialize on load
if (typeof THREE !== 'undefined') initSolidHero();
else window.addEventListener('load', initSolidHero);
