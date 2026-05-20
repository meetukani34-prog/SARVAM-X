/**
 * Three.js 3D Background Engine
 * Shared across SARVAM-X & TRINETRA AI platforms
 */

function initThreeJS() {
  const container = document.getElementById('three-bg-container');
  if(!container) return;

  console.log('[ThreeJS] Initializing Background Engine...');
  container.style.opacity = '1'; // Force full opacity for visibility during debug
  container.innerHTML = '';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  container.appendChild(renderer.domElement);

  // ─── BACKGROUND MODELS ───
  
  // 1. Neural Particles (Stars/Data)
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 6000; i++) {
    vertices.push(THREE.MathUtils.randFloatSpread(2500), THREE.MathUtils.randFloatSpread(2500), THREE.MathUtils.randFloatSpread(2500));
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00f2ff, size: 1.5, transparent: true, opacity: 0.5 }));
  scene.add(particles);

  // 2. Hybrid System Core (SARVAM-X + TRINETRA)
  const hybridCore = new THREE.Group();
  
  // SARVAM-X Side (Cyan, Torus Knot 1)
  const sarvamGeom = new THREE.TorusKnotGeometry(120, 30, 200, 32, 2, 3);
  const sarvamMat = new THREE.MeshPhongMaterial({ 
    color: 0x00e5ff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.4,
    emissive: 0x00e5ff,
    emissiveIntensity: 1.5
  });
  const sarvamMesh = new THREE.Mesh(sarvamGeom, sarvamMat);
  hybridCore.add(sarvamMesh);

  // TRINETRA Side (Purple, Torus Knot 2 - Interlocking)
  const trinetraGeom = new THREE.TorusKnotGeometry(120, 30, 200, 32, 3, 4);
  const trinetraMat = new THREE.MeshPhongMaterial({ 
    color: 0xa855f7, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.4,
    emissive: 0xa855f7,
    emissiveIntensity: 1.5
  });
  const trinetraMesh = new THREE.Mesh(trinetraGeom, trinetraMat);
  trinetraMesh.rotation.y = Math.PI / 2;
  hybridCore.add(trinetraMesh);

  // Central Fusion Sphere
  const fusionGeom = new THREE.IcosahedronGeometry(60, 2);
  const fusionMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    metalness: 1, 
    roughness: 0,
    emissive: 0xffffff,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.1
  });
  const fusionSphere = new THREE.Mesh(fusionGeom, fusionMat);
  hybridCore.add(fusionSphere);

  scene.add(hybridCore);

  // Lights for the new materials
  const light1 = new THREE.PointLight(0x00e5ff, 2, 1000);
  light1.position.set(200, 100, 100);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xa855f7, 2, 1000);
  light2.position.set(-200, -100, 100);
  scene.add(light2);

  // 3. Roaming Data Orbs (Autonomous movement)
  const roamingGroup = new THREE.Group();
  const orbs = [];
  const orbCount = 5;

  for (let i = 0; i < orbCount; i++) {
    const orbGeom = new THREE.SphereGeometry(15, 16, 16);
    const orbMat = new THREE.MeshPhongMaterial({ 
      color: Math.random() > 0.5 ? 0x00e5ff : 0xa855f7,
      emissive: Math.random() > 0.5 ? 0x00e5ff : 0xa855f7,
      emissiveIntensity: 1,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    
    // Random starting positions
    orb.position.set(THREE.MathUtils.randFloatSpread(1000), THREE.MathUtils.randFloatSpread(1000), THREE.MathUtils.randFloatSpread(500));
    
    // Random velocity
    orb.userData = {
      velocity: new THREE.Vector3(THREE.MathUtils.randFloatSpread(2), THREE.MathUtils.randFloatSpread(2), THREE.MathUtils.randFloatSpread(1)),
      phase: Math.random() * Math.PI * 2
    };
    
    orbs.push(orb);
    roamingGroup.add(orb);
  }
  scene.add(roamingGroup);

  // ─── HACKING ELEMENTS (TRINETRA SPECIFIC) ───
  const isTrinetra = window.location.pathname.includes('trinetra.html');
  const threatGroup = new THREE.Group();
  const threatOrbs = [];

  if (isTrinetra) {
    for (let i = 0; i < 8; i++) {
      const tGeom = new THREE.OctahedronGeometry(15, 0);
      const tMat = new THREE.MeshPhongMaterial({ 
        color: 0xff0000, 
        emissive: 0xff0000, 
        emissiveIntensity: 3, 
        transparent: true, 
        opacity: 0.8,
        wireframe: true 
      });
      const tOrb = new THREE.Mesh(tGeom, tMat);
      tOrb.position.set(THREE.MathUtils.randFloatSpread(1500), THREE.MathUtils.randFloatSpread(1200), THREE.MathUtils.randFloatSpread(800));
      tOrb.userData = { 
        velocity: new THREE.Vector3(THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(4), THREE.MathUtils.randFloatSpread(2)),
        pulse: Math.random() * Math.PI * 2
      };
      threatOrbs.push(tOrb);
      threatGroup.add(tOrb);
    }
    scene.add(threatGroup);
  }

  scene.add(new THREE.AmbientLight(0x404040));

  camera.position.z = 500;

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
  });

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;
    
    // Auto rotation
    particles.rotation.x += 0.0003;
    particles.rotation.y += 0.0003;
    
    // Animate Hybrid Components
    sarvamMesh.rotation.y += 0.008;
    trinetraMesh.rotation.z += 0.01;
    fusionSphere.rotation.x -= 0.005;
    
    // Dynamic Opacity Pulse
    sarvamMat.opacity = 0.15 + Math.sin(t) * 0.05;
    trinetraMat.opacity = 0.15 + Math.cos(t) * 0.05;
    
    // Core floating effect
    hybridCore.position.y = Math.sin(t * 0.5) * 30;
    hybridCore.rotation.x = Math.sin(t * 0.3) * 0.1;

    // Animate Roaming Orbs
    orbs.forEach(orb => {
      orb.position.add(orb.userData.velocity);
      orb.rotation.x += 0.02;
      orb.rotation.y += 0.02;
      
      // Floating wave effect
      orb.position.y += Math.sin(t + orb.userData.phase) * 0.5;

      // Boundary Check (Bounce)
      if (Math.abs(orb.position.x) > 1200) orb.userData.velocity.x *= -1;
      if (Math.abs(orb.position.y) > 1000) orb.userData.velocity.y *= -1;
      if (Math.abs(orb.position.z) > 600) orb.userData.velocity.z *= -1;
    });

    // Animate Threat Orbs (Hacking)
    threatOrbs.forEach(tOrb => {
      tOrb.position.add(tOrb.userData.velocity);
      tOrb.rotation.x += 0.05;
      tOrb.rotation.y += 0.05;
      
      // Pulsing scale
      const s = 1 + Math.sin(t * 10 + tOrb.userData.pulse) * 0.3;
      tOrb.scale.set(s, s, s);
      
      // Rapid bounce
      if (Math.abs(tOrb.position.x) > 1500) tOrb.userData.velocity.x *= -1;
      if (Math.abs(tOrb.position.y) > 1200) tOrb.userData.velocity.y *= -1;
      if (Math.abs(tOrb.position.z) > 800) tOrb.userData.velocity.z *= -1;
    });
    
    // Mouse sway
    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Auto-init logic
if (typeof THREE !== 'undefined') {
  initThreeJS();
} else {
  window.addEventListener('load', () => {
    if (typeof THREE !== 'undefined') initThreeJS();
  });
}
