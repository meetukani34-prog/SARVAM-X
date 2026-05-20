/**
 * ═══════════════════════════════════════════════════════════════════════
 * LUMINOUS KINETIC MENTOR v2.0 — "The Sentient Mirror"
 * Final Solution: Fixed API, Streaming, Formatting, and User Vision
 * ═══════════════════════════════════════════════════════════════════════
 */

const Mentor = (() => {
  const S = {
    phase: 'IDLE',
    open: false,
    speaking: false,
    visionActive: false,
    mouthOpen: 0,
    userEmotion: 'neutral',
    userEmotionConfidence: 0,
    lastReactionTime: 0,
    chatHistory: [],
    // Three.js
    scene: null, camera: null, renderer: null, clock: null, particles: null,
    // Vision
    modelsLoaded: false,
    visionInterval: null,
    video: null,
    streaming: false,
    hasGreeted: false
  };

  // ─── THREE.JS KINETIC RIGGING ───
  function initThree() {
    const container = document.getElementById('mentor-3d-viewport');
    if (!container || S.scene) return;
    const w = container.clientWidth, h = container.clientHeight;
    S.clock = new THREE.Clock();
    S.scene = new THREE.Scene();
    S.camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
    S.camera.position.z = 5;
    S.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    S.renderer.setSize(w, h);
    container.appendChild(S.renderer.domElement);

    // Orbital Particles
    const geom = new THREE.BufferGeometry();
    const posArr = new Float32Array(300 * 3);
    for(let i=0; i<300 * 3; i++) posArr[i] = (Math.random()-0.5)*10;
    geom.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.03, transparent: true, opacity: 0.4 });
    S.particles = new THREE.Points(geom, mat);
    S.scene.add(S.particles);

    // Dodecahedron Cognitive Mirror
    const dodecGeom = new THREE.DodecahedronGeometry(1.5, 0);
    const dodecMat = new THREE.MeshPhongMaterial({ color: 0x00e5ff, wireframe: true, emissive: 0x00e5ff, emissiveIntensity: 0.4 });
    S.dodecahedron = new THREE.Mesh(dodecGeom, dodecMat);
    S.scene.add(S.dodecahedron);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    S.scene.add(light);
    S.scene.add(new THREE.AmbientLight(0x404040));

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!S.renderer) return;
    const t = S.clock.getElapsedTime();
    
    // HUMAN-LIKE KINETIC DRIFT
    const avatar = document.getElementById('mentor-avatar-img');
    if (avatar) {
      const tiltX = Math.sin(t * 0.5) * 1.5; 
      const tiltY = Math.cos(t * 0.4) * 2.5; 
      const swayY = Math.sin(t * 0.8) * 4; // Shoulder/Body sway
      const thinkMod = S.phase === 'THINKING' ? Math.sin(t*3)*3 : 0;
      
      avatar.style.transform = `
        perspective(1000px)
        rotateX(${tiltX}deg) 
        rotateY(${tiltY + thinkMod}deg) 
        translateY(${swayY}px)
        scale(${1 + S.mouthOpen * 0.03})
      `;
    }

    if (S.particles) {
      S.particles.rotation.y += 0.002;
      S.particles.material.opacity = 0.3 + Math.sin(t)*0.1;
    }

    if (S.dodecahedron) {
      S.dodecahedron.rotation.y += 0.01;
      S.dodecahedron.rotation.x = Math.sin(t * 0.5) * 0.2;
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      S.dodecahedron.scale.set(pulse, pulse, pulse);
    }

    S.renderer.render(S.scene, S.camera);
  }

  // ─── USER VISION ENGINE (Face-API) ───
  async function initVision() {
    if (S.modelsLoaded) return;
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      S.modelsLoaded = true;
    } catch(e) { console.error("Vision Load Fail", e); }
  }

  async function toggleVision() {
    const btn = document.getElementById('vision-toggle');
    const label = document.getElementById('user-emotion-label');
    
    if (S.visionActive) {
      S.visionActive = false;
      clearInterval(S.visionInterval);
      if (S.video && S.video.srcObject) {
        S.video.srcObject.getTracks().forEach(t => t.stop());
      }
      btn.classList.remove('active');
      label.textContent = "VISION STANDBY";
      return;
    }

    S.video = document.getElementById('mentor-vision-feed');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      S.video.srcObject = stream;
      S.visionActive = true;
      btn.classList.add('active');
      label.textContent = "SYNCING FACE...";
      
      await initVision();
      
      S.visionInterval = setInterval(async () => {
        if (!S.visionActive) return;
        const detections = await faceapi.detectSingleFace(S.video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        
        if (detections) {
          const expressions = detections.expressions;
          const best = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b);
          S.userEmotion = best[0];
          S.userEmotionConfidence = best[1];
          label.textContent = `USER: ${S.userEmotion.toUpperCase()}`;
          reactToUserEmotion();
        }
      }, 1000);
    } catch(e) { 
      console.warn("Camera failed", e);
      alert("Please allow camera access for Mentor Vision."); 
    }
  }

  function reactToUserEmotion() {
    const now = Date.now();
    if (now - S.lastReactionTime < 20000 || S.streaming || S.speaking) return;
    
    if (S.userEmotionConfidence > 0.8) {
      let comment = "";
      if (S.userEmotion === 'sad' || S.userEmotion === 'fearful') comment = "I am here."; 
      else if (S.userEmotion === 'happy') comment = "Excellent.";

      if (comment) {
        S.lastReactionTime = now;
        addBubble('ai', `<i style="opacity:0.6;font-size:11px">[Resonance]</i> ${comment}`);
        speak(comment);
      }
    }
  }

  // ─── CORE CHAT & VOICE ───
  function speak(text) {
    if (!text || S.speaking) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    
    const utt = new SpeechSynthesisUtterance(text);
    
    // Auto-detect Language for Voice Engine
    if (/[\u0900-\u097F]/.test(text)) utt.lang = 'hi-IN'; // Hindi
    else if (/[\u0a80-\u0aff]/.test(text)) utt.lang = 'gu-IN'; // Gujarati
    else if (/[\u0b80-\u0bff]/.test(text)) utt.lang = 'ta-IN'; // Tamil
    else if (/[\u0c00-\u0c7f]/.test(text)) utt.lang = 'te-IN'; // Telugu
    else utt.lang = 'en-US';

    // Try to find a matching voice
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utt.lang.split('-')[0]));
    if (voice) utt.voice = voice;

    utt.onstart = () => { S.speaking = true; S.phase = 'SPEAKING'; updateRig(); startLipSync(); };
    utt.onend = () => { S.speaking = false; S.phase = 'IDLE'; updateRig(); S.mouthOpen = 0; };
    synth.speak(utt);
  }

  function startLipSync() {
    let i = setInterval(() => {
      if (!S.speaking) return clearInterval(i);
      S.mouthOpen = 0.2 + Math.random() * 0.7;
    }, 100);
  }

  function updateRig() {
    const avatar = document.getElementById('mentor-avatar-img');
    const glow = document.getElementById('mentor-avatar-glow');
    if (!avatar || !glow) return;
    avatar.classList.toggle('speaking', S.phase === 'SPEAKING');
    glow.classList.toggle('speaking', S.phase === 'SPEAKING');
  }

  async function sendMessage() {
    const input = document.getElementById('mentor-input');
    const msg = input.value.trim();
    if (!msg || S.streaming) return;
    
    input.value = '';
    addBubble('user', msg);
    S.phase = 'THINKING';
    S.streaming = true;
    updateRig();
    
    const emotionContext = S.visionActive ? `\n(User current facial expression: ${S.userEmotion})` : "";
    
    try {
      const resp = await fetch(API + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: UID, 
          message: msg + emotionContext, 
          history: S.chatHistory.slice(-10) 
        })
      });

      if (!resp.ok) throw new Error("Link Failed");

      const aiBubble = addBubble('ai', '');
      let fullText = '';
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const data = JSON.parse(payload);
              if (data.token) {
                fullText += data.token;
                aiBubble.innerHTML = fmtResp(fullText);
                document.getElementById('mentor-messages').scrollTop = document.getElementById('mentor-messages').scrollHeight;
              }
            } catch(e) {}
          }
        }
      }
      S.chatHistory.push({ role: 'user', content: msg }, { role: 'assistant', content: fullText });
      speak(fullText.replace(/\*\*|`|#/g, '').slice(0, 300));
    } catch(e) { 
      console.error(e);
      addBubble('ai', "Neural link timed out. Please check if the backend is running."); 
    }
    
    S.streaming = false;
    S.phase = 'IDLE';
    updateRig();
  }

  function addBubble(type, text) {
    const msgs = document.getElementById('mentor-messages');
    const div = document.createElement('div');
    div.className = `mentor-bubble ${type}`;
    div.innerHTML = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function fmtResp(t) {
    t = t.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--cyan)">$1</strong>');
    t = t.replace(/`([^`]+)`/g, '<code style="background:rgba(0,229,255,0.08);padding:1px 5px;border-radius:4px;font-family:var(--mono)">$1</code>');
    t = t.replace(/\n/g, '<br>');
    return t;
  }

  async function toggle() {
    S.open = !S.open;
    const panel = document.getElementById('mentor-panel');
    const fab = document.getElementById('mentor-fab');
    panel.classList.toggle('hidden', !S.open);
    fab.classList.toggle('open', S.open);
    
    if (S.open) { 
      initThree(); 
      if (!S.hasGreeted) {
        S.hasGreeted = true;
        addBubble('system', 'Neural Sync Active');
        const greeting = "I am ready. How can I help you today?";
        addBubble('ai', greeting);
        speak(greeting);
      }
    }
  }

  function init() {
    const input = document.getElementById('mentor-input');
    if (input) {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
      });
    }
  }

  return { toggle, toggleVision, sendMessage, init };
})();

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Mentor.init());
} else {
  Mentor.init();
}
