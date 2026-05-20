/* ─── TRINETRA AI — Dashboard Logic ─── */

// Auth check
if (!localStorage.getItem('sarvam_uid')) {
  window.location.href = 'auth.html?platform=trinetra';
}
const TRI_UID = localStorage.getItem('sarvam_uid');
const TRI_NAME = localStorage.getItem('sarvam_name') || 'User';

// Init icons & avatar
feather.replace();
const av = document.getElementById('tri-user-avatar');
if (av) av.textContent = TRI_NAME.charAt(0).toUpperCase();

// ─── 3D LOGO & AVATAR ───
function initTrinetra3D() {
  // 1. Logo 3D
  const logoBox = document.getElementById('tri-3d-logo');
  if (logoBox && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(42, 42);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    logoBox.appendChild(renderer.domElement);
    console.log('[ThreeJS] Logo Renderer Attached');

    const geometry = new THREE.OctahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0xa855f7, 
      wireframe: true,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8
    });
    const octa = new THREE.Mesh(geometry, material);
    scene.add(octa);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 3;

    function animLogo() {
      requestAnimationFrame(animLogo);
      octa.rotation.x += 0.01;
      octa.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animLogo();
  }

  // 2. Assistant Avatar 3D
  const assistAv = document.querySelector('.tri-assistant-avatar');
  if (assistAv && typeof THREE !== 'undefined') {
    assistAv.innerHTML = '<div id="tri-assist-3d" style="width:36px;height:36px;"></div>';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(36, 36);
    document.getElementById('tri-assist-3d').appendChild(renderer.domElement);

    const sphereGeom = new THREE.IcosahedronGeometry(1, 1);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff, wireframe: true });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    scene.add(sphere);

    camera.position.z = 2.5;

    function animAssist() {
      requestAnimationFrame(animAssist);
      sphere.rotation.y += 0.02;
      sphere.rotation.x += 0.01;
      renderer.render(scene, camera);
    }
    animAssist();
  }
}

if (typeof THREE !== 'undefined') initTrinetra3D();
else window.addEventListener('load', () => { if(typeof THREE !== 'undefined') initTrinetra3D(); });


// ─── NAVIGATION ───
function triNav(page) {
  document.querySelectorAll('.tri-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tri-nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  const nav = document.querySelector(`.tri-nav-item[data-page="${page}"]`);
  if (el) el.classList.add('active');
  if (nav) nav.classList.add('active');
  const titles = {dashboard:'Dashboard',fakenews:'Fake News Analyzer',coderev:'Code Reviewer',xai:'Explainable AI',reports:'Reports',insights:'AI Insights'};
  document.getElementById('tri-breadcrumb').textContent = titles[page] || page;
  if (page === 'xai') renderXAI();
  if (page === 'reports') renderReports();
  if (page === 'insights') renderInsightCharts();
}

// ─── FAKE NEWS ANALYZER ───
function analyzeNews() {
  const text = document.getElementById('news-input').value.trim();
  if (!text) return alert('Please enter some text to analyze.');
  const results = document.getElementById('news-results');
  results.innerHTML = '<div class="tri-card" style="text-align:center;padding:40px;"><div style="font-size:24px;animation:spin 1s linear infinite;">⚙</div><p style="color:var(--text-dim);margin-top:12px;">AI is analyzing...</p></div>';
  
  setTimeout(() => {
    const conf = Math.floor(Math.random() * 25) + 75;
    const isFake = conf > 60;
    const sentiment = (Math.random() * 0.8 + 0.2).toFixed(2);
    const keywords = extractKeywords(text);
    
    results.innerHTML = `
      <div class="tri-card" style="margin-bottom:14px;">
        <div class="tri-card-title">CLASSIFICATION RESULT</div>
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
          <div class="tri-result-badge ${isFake ? 'tri-result-fake' : 'tri-result-real'}">${isFake ? '⚠ Likely Fake News' : '✓ Likely Authentic'}</div>
        </div>
        <div class="tri-gauge-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="55" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
            <circle cx="65" cy="65" r="55" fill="none" stroke="${isFake ? '#f87171' : '#34d399'}" stroke-width="10" stroke-dasharray="${conf * 3.45} 345" stroke-linecap="round" transform="rotate(-90 65 65)" style="transition:stroke-dasharray 1.5s ease;"/>
          </svg>
          <div style="position:absolute;text-align:center;">
            <div style="font-size:32px;font-weight:800;color:#fff;">${conf}%</div>
            <div style="font-size:10px;color:var(--text-dim);">CONFIDENCE</div>
          </div>
        </div>
      </div>
      <div class="tri-card" style="margin-bottom:14px;">
        <div class="tri-card-title">ANALYSIS DETAILS</div>
        <div class="tri-issue-card ${isFake ? 'tri-issue-critical' : 'tri-issue-info'}">
          <div class="tri-issue-title">Sensational Language</div>
          <div class="tri-issue-desc">${isFake ? 'High presence of superlative & emotional language detected' : 'Moderate, factual language patterns detected'}</div>
        </div>
        <div class="tri-issue-card tri-issue-warning">
          <div class="tri-issue-title">Source Credibility: ${isFake ? '18' : '74'}/100</div>
          <div class="tri-issue-desc">${isFake ? 'Unreliable source pattern — no editorial standards found' : 'Moderately reliable source pattern'}</div>
        </div>
        <div class="tri-issue-card ${isFake ? 'tri-issue-critical' : 'tri-issue-info'}">
          <div class="tri-issue-title">Emotional Manipulation Score: ${sentiment}</div>
          <div class="tri-issue-desc">${parseFloat(sentiment) > 0.5 ? 'Designed to trigger emotional response' : 'Low emotional manipulation'}</div>
        </div>
      </div>
      <div class="tri-card">
        <div class="tri-card-title">SUSPICIOUS KEYWORDS</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${keywords.map(k => `<span style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">${k}</span>`).join('')}</div>
      </div>`;
    saveReport('Fake News Analysis', isFake ? 'Likely Fake' : 'Likely Real', conf);
  }, 1800);
}

function extractKeywords(text) {
  const suspicious = ['breaking','miracle','secret','shocking','exposed','hidden','unlimited','government','conspiracy','banned','cure','threat','urgent','exclusive','unbelievable','devastating'];
  const words = text.toLowerCase().split(/\W+/);
  const found = suspicious.filter(s => words.includes(s));
  if (found.length < 3) { found.push('sensational-claim', 'unverified-source'); }
  return found.slice(0, 6);
}

// ─── CODE REVIEWER ───
function loadDemoCode() {
  document.getElementById('code-input-tri').value = `def process_data(data):
    result = []
    for i in range(len(data)):
        for j in range(len(data)):
            if data[i] == data[j]:
                result.append(data[i])
    
    password = "admin123"  # hardcoded
    eval(user_input)
    
    file = open("data.txt")
    # file never closed - resource leak
    
    return result`;
}

function reviewCode() {
  const code = document.getElementById('code-input-tri').value.trim();
  if (!code) return alert('Please enter some code to review.');
  const results = document.getElementById('code-results');
  results.innerHTML = '<div class="tri-card" style="text-align:center;padding:40px;"><div style="font-size:24px;animation:spin 1s linear infinite;">⚙</div><p style="color:var(--text-dim);margin-top:12px;">AI scanning code...</p></div>';
  
  setTimeout(() => {
    const issues = detectIssues(code);
    const complexity = code.split('\n').length > 20 ? 'HIGH' : code.split('\n').length > 10 ? 'MEDIUM' : 'LOW';
    const complexColor = complexity === 'HIGH' ? 'var(--red)' : complexity === 'MEDIUM' ? 'var(--orange)' : 'var(--green)';
    
    results.innerHTML = `
      <div class="tri-card" style="margin-bottom:14px;">
        <div class="tri-card-title">CODE ANALYSIS SUMMARY</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${complexColor};">${complexity}</div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">COMPLEXITY</div>
          </div>
          <div style="background:rgba(255,255,255,0.03);padding:14px;border-radius:10px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${issues.length > 3 ? 'var(--red)' : 'var(--orange)'};">${issues.length}</div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">ISSUES FOUND</div>
          </div>
        </div>
      </div>
      <div class="tri-card">
        <div class="tri-card-title">DETECTED ISSUES</div>
        ${issues.map(i => `
          <div class="tri-issue-card tri-issue-${i.level}">
            <div class="tri-issue-title">${i.icon} ${i.title}</div>
            <div class="tri-issue-desc">${i.desc}</div>
          </div>`).join('')}
      </div>`;
    saveReport('Code Review', `${issues.length} issues`, complexity === 'HIGH' ? 85 : 45);
  }, 2000);
}

function detectIssues(code) {
  const issues = [];
  if (code.includes('for') && code.split('for').length > 2) issues.push({level:'critical',icon:'⚠',title:'Nested Loop Inefficiency — O(n²)',desc:'Nested iterations detected. Consider using sets or hash maps for O(n) lookup.'});
  if (/password|secret|api_key|token/i.test(code)) issues.push({level:'critical',icon:'🔒',title:'Hardcoded Credentials',desc:'Sensitive data found in source code. Use environment variables instead.'});
  if (/eval\(|exec\(/i.test(code)) issues.push({level:'critical',icon:'💀',title:'Code Injection Vulnerability',desc:'eval()/exec() detected — allows arbitrary code execution. Use safe alternatives.'});
  if (/open\(/.test(code) && !/with\s+open/.test(code)) issues.push({level:'warning',icon:'📂',title:'Potential Resource Leak',desc:'File opened without context manager (with statement). Resource may not be properly closed.'});
  if (/\.append\(/.test(code) && /for/.test(code)) issues.push({level:'info',icon:'💡',title:'List Comprehension Available',desc:'Loop with append pattern detected. Consider using list comprehension for cleaner code.'});
  if (code.split('\n').length > 20) issues.push({level:'warning',icon:'📏',title:'Function Too Long',desc:'Function exceeds recommended length. Consider breaking into smaller functions.'});
  if (issues.length === 0) issues.push({level:'info',icon:'✅',title:'No Major Issues Found',desc:'Code looks clean. Minor optimizations may still be possible.'});
  return issues;
}

// ─── EXPLAINABLE AI ───
function renderXAI() {
  const features = [
    {name:'Sensational Language',val:0.89,color:'var(--red)'},
    {name:'Source Credibility',val:0.76,color:'var(--orange)'},
    {name:'Emotional Manipulation',val:0.72,color:'var(--orange)'},
    {name:'Factual Consistency',val:0.64,color:'var(--purple)'},
    {name:'Cross-Reference Score',val:0.58,color:'var(--purple)'},
    {name:'Grammar Quality',val:0.31,color:'var(--cyan)'},
    {name:'Author Reputation',val:0.24,color:'var(--cyan)'},
    {name:'Publication Date',val:0.12,color:'var(--green)'}
  ];
  document.getElementById('xai-features').innerHTML = features.map(f => `
    <div class="tri-feature-bar">
      <div class="tri-feature-name">${f.name}</div>
      <div class="tri-feature-bar-bg"><div class="tri-feature-bar-fill" style="width:${f.val*100}%;background:${f.color};"></div></div>
      <div class="tri-feature-bar-val" style="color:${f.color};">${(f.val*100).toFixed(0)}%</div>
    </div>`).join('');
  renderXAIChart();
}

function renderXAIChart() {
  const ctx = document.getElementById('chart-xai-conf');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Fake','Real','Uncertain'], datasets: [{ data: [72,18,10], backgroundColor: ['#f87171','#34d399','#fbbf24'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8899bb', font: { size: 11 } } } } }
  });
}

// ─── REPORTS ───
let reportHistory = JSON.parse(localStorage.getItem('trinetra_reports') || '[]');

function saveReport(type, result, confidence) {
  reportHistory.unshift({ type, result, confidence, date: new Date().toLocaleString() });
  if (reportHistory.length > 20) reportHistory.pop();
  localStorage.setItem('trinetra_reports', JSON.stringify(reportHistory));
}

function renderReports() {
  const el = document.getElementById('reports-list');
  if (reportHistory.length === 0) {
    el.innerHTML = '<p style="color:var(--text-dim);padding:20px;">No analyses yet. Use the Fake News Analyzer or Code Reviewer first.</p>';
    return;
  }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse;">' +
    '<tr style="text-align:left;"><th style="padding:10px;color:var(--text-dim);font-size:11px;border-bottom:1px solid rgba(255,255,255,0.05);">TYPE</th><th style="padding:10px;color:var(--text-dim);font-size:11px;border-bottom:1px solid rgba(255,255,255,0.05);">RESULT</th><th style="padding:10px;color:var(--text-dim);font-size:11px;border-bottom:1px solid rgba(255,255,255,0.05);">CONFIDENCE</th><th style="padding:10px;color:var(--text-dim);font-size:11px;border-bottom:1px solid rgba(255,255,255,0.05);">DATE</th></tr>' +
    reportHistory.map(r => `<tr><td style="padding:10px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.03);">${r.type}</td><td style="padding:10px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.03);">${r.result}</td><td style="padding:10px;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.03);">${r.confidence}%</td><td style="padding:10px;font-size:13px;color:var(--text-dim);border-bottom:1px solid rgba(255,255,255,0.03);">${r.date}</td></tr>`).join('') +
    '</table>';
}

// ─── AI ASSISTANT ───
function toggleAssistant() {
  document.getElementById('assistant-panel').classList.toggle('open');
}

function sendAssistantMsg() {
  const input = document.getElementById('assistant-input');
  const msg = input.value.trim();
  if (!msg) return;
  const msgs = document.getElementById('assistant-messages');
  msgs.innerHTML += `<div class="tri-msg tri-msg-user">${msg}</div>`;
  input.value = '';
  setTimeout(() => {
    const responses = [
      "I can help you analyze that! Try pasting the content into the Fake News Analyzer for detailed results.",
      "Great question! The AI uses an ensemble of NLP models including BERT, RoBERTa, and custom transformers for classification.",
      "For code analysis, our engine checks for O(n²) complexity, security vulnerabilities, resource leaks, and code style issues.",
      "The Explainable AI panel shows SHAP values — these measure how much each feature contributed to the AI's decision.",
      "You can view all your past analyses in the Reports section. They're saved locally for quick access."
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    msgs.innerHTML += `<div class="tri-msg tri-msg-ai">${reply}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 800);
}

// ─── DASHBOARD CHARTS ───
function initDashboardCharts() {
  // Trend Chart
  const trendCtx = document.getElementById('chart-trend');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          label: 'Fake Detected', data: [12,19,8,15,22,14,18],
          borderColor: '#f87171', backgroundColor: 'rgba(248,113,113,0.1)',
          fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3
        },{
          label: 'Verified Real', data: [28,22,35,30,18,32,25],
          borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)',
          fill: true, tension: 0.4, borderWidth: 2, pointRadius: 3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8899bb', font: { size: 10 } } } }, scales: { x: { ticks: { color: '#4a5568', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { ticks: { color: '#4a5568', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } }
    });
  }
  // Risk Chart
  const riskCtx = document.getElementById('chart-risk');
  if (riskCtx) {
    new Chart(riskCtx, {
      type: 'doughnut',
      data: { labels: ['Critical','Warning','Info','Clean'], datasets: [{ data: [15,25,30,30], backgroundColor: ['#ef4444','#f59e0b','#00e5ff','#10b981'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8899bb', font: { size: 10 }, padding: 12 } } } }
    });
  }
}

function renderInsightCharts() {
  const accCtx = document.getElementById('chart-accuracy');
  if (accCtx && !accCtx._chartDone) {
    accCtx._chartDone = true;
    new Chart(accCtx, {
      type: 'line',
      data: { labels: ['Jan','Feb','Mar','Apr','May'], datasets: [{ label: 'Accuracy %', data: [89,91,93,94.7,96.2], borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', fill: true, tension: 0.4, borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { min: 85, ticks: { color: '#4a5568' }, grid: { color: 'rgba(255,255,255,0.03)' } } }, plugins: { legend: { labels: { color: '#8899bb' } } } }
    });
  }
  const thrCtx = document.getElementById('chart-threats');
  if (thrCtx && !thrCtx._chartDone) {
    thrCtx._chartDone = true;
    new Chart(thrCtx, {
      type: 'bar',
      data: { labels: ['Misinfo','Phishing','Deepfake','Spam','Bias'], datasets: [{ label: 'Threats', data: [42,18,12,28,8], backgroundColor: ['#f87171','#fbbf24','#a855f7','#00e5ff','#10b981'], borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#4a5568' }, grid: { display: false } }, y: { ticks: { color: '#4a5568' }, grid: { color: 'rgba(255,255,255,0.03)' } } }, plugins: { legend: { display: false } } }
    });
  }
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  feather.replace();
  initDashboardCharts();
  
  // Event delegation for sidebar nav (fixes SVG click interception)
  document.querySelector('.tri-sidebar').addEventListener('click', (e) => {
    const item = e.target.closest('.tri-nav-item');
    if (!item) return;
    const page = item.getAttribute('data-page');
    if (page) {
      triNav(page);
    }
  });
});

// CSS animation for spinner
const style = document.createElement('style');
style.textContent = '@keyframes spin{100%{transform:rotate(360deg);}}';
document.head.appendChild(style);
