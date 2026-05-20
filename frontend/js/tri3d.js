/* ─── TRINETRA 3D Holographic Models (Three.js) ─── */

function initTrinetra3D() {
  // Create 3D scenes for each page
  create3DScene('hero-3d', createHolographicCore, { w: 280, h: 280 });
  create3DScene('dash-3d', createWireframeGlobe, { w: 200, h: 200 });
  create3DScene('news-3d', createShieldModel, { w: 160, h: 160 });
  create3DScene('code-3d', createCubeMatrix, { w: 160, h: 160 });
  create3DScene('xai-3d', createBrainModel, { w: 180, h: 180 });
  create3DScene('insights-3d', createDataOrb, { w: 160, h: 160 });
}

function create3DScene(containerId, buildFn, size) {
  const container = document.getElementById(containerId);
  if (!container || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, size.w / size.h, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(size.w, size.h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);
  buildFn(group);

  // Subtle ambient light
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pointLight = new THREE.PointLight(0x00e5ff, 1.5, 20);
  pointLight.position.set(2, 2, 4);
  scene.add(pointLight);
  const purpleLight = new THREE.PointLight(0xa855f7, 1, 15);
  purpleLight.position.set(-2, -1, 3);
  scene.add(purpleLight);

  function animate() {
    requestAnimationFrame(animate);
    group.rotation.y += 0.005;
    group.rotation.x += 0.002;
    renderer.render(scene, camera);
  }
  animate();
}

// ─── 1. HOLOGRAPHIC CORE (Landing / Hero) ───
function createHolographicCore(group) {
  // Central icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.6 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  group.add(ico);

  // Outer ring
  const ringGeo = new THREE.TorusGeometry(1.8, 0.02, 16, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  group.add(ring);

  // Second ring
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.1, 0.015, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 })
  );
  ring2.rotation.x = Math.PI / 1.8;
  ring2.rotation.z = 0.5;
  group.add(ring2);

  // Floating particles
  const pts = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 80; i++) {
    positions.push((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5);
  }
  pts.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const ptsMat = new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.04, transparent: true, opacity: 0.6 });
  group.add(new THREE.Points(pts, ptsMat));
}

// ─── 2. WIREFRAME GLOBE (Dashboard) ───
function createWireframeGlobe(group) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.3, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.4 })
  );
  group.add(sphere);

  // Latitude rings
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.01, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = (i * Math.PI) / 3;
    group.add(ring);
  }

  // Data dots
  const dotGeo = new THREE.BufferGeometry();
  const dotPositions = [];
  for (let i = 0; i < 40; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = 1.35;
    dotPositions.push(r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi));
  }
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
  group.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.06 })));
}

// ─── 3. SHIELD MODEL (Fake News) ───
function createShieldModel(group) {
  // Hexagonal shield shape
  const shape = new THREE.Shape();
  const sides = 6, r = 1.2;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const x = r * Math.cos(angle), y = r * Math.sin(angle);
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
  }
  shape.closePath();
  const shieldGeo = new THREE.ShapeGeometry(shape);
  const shieldMat = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(shieldGeo, shieldMat));

  // Inner eye
  const eyeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.03, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 })
  );
  eyeRing.position.z = 0.1;
  group.add(eyeRing);

  // Pupil
  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 })
  );
  pupil.position.z = 0.1;
  group.add(pupil);
}

// ─── 4. CUBE MATRIX (Code Reviewer) ───
function createCubeMatrix(group) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.4 });
  const matP = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.4 });
  const size = 0.4, gap = 0.6;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (Math.random() > 0.4) {
          const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), Math.random() > 0.5 ? mat : matP);
          cube.position.set(x * gap, y * gap, z * gap);
          group.add(cube);
        }
      }
    }
  }
}

// ─── 5. BRAIN / NEURAL NETWORK (XAI) ───
function createBrainModel(group) {
  // Core sphere
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.8, 2),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.3 })
  );
  group.add(core);

  // Neural nodes
  const nodePositions = [];
  const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 });
  for (let i = 0; i < 20; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = 1.2 + Math.random() * 0.4;
    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.cos(theta);
    const z = r * Math.sin(theta) * Math.sin(phi);
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(x, y, z);
    group.add(node);
    nodePositions.push(new THREE.Vector3(x, y, z));
  }

  // Connections between nodes
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.2 });
  for (let i = 0; i < nodePositions.length; i++) {
    for (let j = i + 1; j < nodePositions.length; j++) {
      if (nodePositions[i].distanceTo(nodePositions[j]) < 1.2) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([nodePositions[i], nodePositions[j]]);
        group.add(new THREE.Line(lineGeo, lineMat));
      }
    }
  }
}

// ─── 6. DATA ORB (Insights) ───
function createDataOrb(group) {
  // Outer wireframe
  const outer = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.3, 0),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.4 })
  );
  group.add(outer);

  // Inner octahedron
  const inner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.7, 0),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.6 })
  );
  group.add(inner);

  // Data rings
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.0 + i * 0.3, 0.01, 8, 32),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00e5ff : 0xa855f7, transparent: true, opacity: 0.3 })
    );
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    group.add(ring);
  }
}
