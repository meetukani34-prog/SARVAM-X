const API = '/api';

// Enforce Authentication
if (!localStorage.getItem('sarvam_uid')) {
  window.location.href = 'auth.html';
}

let UID = localStorage.getItem('sarvam_uid');
// Re-check UID from session if it was missing
if (!UID || UID === 'null' || UID === 'undefined') {
  UID = localStorage.getItem('sarvam_uid');
}
const USER_NAME = localStorage.getItem('sarvam_name') || 'User';
const USER_EMAIL = localStorage.getItem('sarvam_email') || 'SARVAM-X Registered User';

let state = {};

document.addEventListener('DOMContentLoaded', async () => {
  // Try to load basic info immediately from session
  let currentName = USER_NAME;
  let currentEmail = USER_EMAIL;

  const updateProfileUI = (name, email) => {
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl && name) {
      const initial = name.charAt(0).toUpperCase();
      avatarEl.textContent = initial;
      avatarEl.title = name;
      
      const profileNameEl = document.getElementById('profile-name');
      const profileEmailEl = document.getElementById('profile-email');
      const profileLargeAvatarEl = document.getElementById('profile-large-avatar');
      
      if (profileNameEl) profileNameEl.textContent = name;
      if (profileEmailEl) profileEmailEl.textContent = email;
      if (profileLargeAvatarEl) profileLargeAvatarEl.textContent = initial;
    }
  };

  updateProfileUI(currentName, currentEmail);

  // Fetch latest data from server
  if (UID) {
    try {
      const res = await fetch(`/api/user/${UID}`);
      const data = await res.json();
      if (res.ok && data.success) {
        currentName = data.name;
        currentEmail = data.email;
        localStorage.setItem('sarvam_name', currentName);
        localStorage.setItem('sarvam_email', currentEmail);
        updateProfileUI(currentName, currentEmail);
      }
    } catch (err) {
      console.log('Failed to fetch latest user data', err);
    }
  }

  // Click outside to close dropdown
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown');
    const avatar = document.getElementById('user-avatar');
    if (dropdown && dropdown.style.display === 'block') {
      if (e.target !== avatar && !avatar.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    }
  });
});

window.toggleEditProfile = function() {
  const actions = document.getElementById('profile-actions');
  const form = document.getElementById('edit-profile-form');
  const input = document.getElementById('edit-name-input');
  
  if (form.style.display === 'none') {
    form.style.display = 'block';
    actions.style.display = 'none';
    input.value = USER_NAME;
  } else {
    form.style.display = 'none';
    actions.style.display = 'flex';
  }
}

window.submitEditProfile = async function() {
  const newName = document.getElementById('edit-name-input').value.trim();
  if (!newName) return;
  
  const btn = document.querySelector('#edit-profile-form .btn-primary');
  const oldText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  
  try {
    const res = await fetch('/api/auth/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: UID, name: newName })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('sarvam_name', data.name);
      window.location.reload();
    } else {
      alert(data.error || 'Update failed');
      btn.innerHTML = oldText;
    }
  } catch (err) {
    alert('Server error.');
    btn.innerHTML = oldText;
  }
}

window.logout = function() {
  localStorage.removeItem('sarvam_uid');
  localStorage.removeItem('sarvam_name');
  localStorage.removeItem('sarvam_email');
  localStorage.removeItem('sarvam_active_page');
  window.location.href = 'auth.html';
}

// ─── 3D LOGO ───
function initSarvam3D() {
  const logoBox = document.getElementById('sarvam-3d-logo');
  if (logoBox && typeof THREE !== 'undefined') {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(36, 36);
    logoBox.appendChild(renderer.domElement);

    // Different shape for Sarvam: TorusKnot (Complexity)
    const geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 64, 8);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00e5ff, 
      wireframe: true,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6
    });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 2.8;

    function animate() {
      requestAnimationFrame(animate);
      knot.rotation.x += 0.015;
      knot.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();
  }
}

if (typeof THREE !== 'undefined') initSarvam3D();
else window.addEventListener('load', () => { if(typeof THREE !== 'undefined') initSarvam3D(); });

// 3D AI Core now handled by three-core.js


// Router
let currentVisiblePage = '';
function navigate(page) {
  if(!page || page === currentVisiblePage) return;
  currentVisiblePage = page;
  localStorage.setItem('sarvam_active_page', page);
  console.log('[Nav] Switching to:', page);

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const el = document.getElementById('page-' + page);
  const nav = document.getElementById('nav-' + page);
  if (el) el.classList.add('active');
  if (nav) nav.classList.add('active');
  
  const b = document.getElementById('page-breadcrumb');
  if(b) b.textContent = {dashboard:'Dashboard Home',twin:'Digital Twin',debugger:'Code Debugger',explainer:'Explainable AI',heatmap:'Skill Heatmap',history:'Assessment History'}[page] || page;
  
  if (page === 'dashboard') loadDashboard();
  else if (page === 'twin') loadTwin();
  else if (page === 'debugger') {
    if (!document.getElementById('page-debugger').innerHTML.trim()) initDebugger();
  }
  else if (page === 'explainer') loadExplainer();
  else if (page === 'heatmap') loadHeatmap();
  else if (page === 'history') loadHistory();
}

document.querySelectorAll('.nav-item').forEach(n => {
  n.addEventListener('click', e => { 
    e.preventDefault(); 
    e.stopPropagation();
    navigate(n.dataset.page); 
  });
});

// Initial Load — restore last page or default to dashboard
navigate(localStorage.getItem('sarvam_active_page') || 'dashboard');

// Helpers
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(60px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

async function api(path, opts) {
  if (path.includes('undefined') || path.includes('null')) {
    console.warn('Blocking API call with invalid path:', path);
    return null;
  }
  try {
    const r = await fetch(API + path, opts);
    if (!r.ok) {
      console.error('API Error Status:', r.status, 'for', path);
      return null;
    }
    return await r.json();
  } catch(e) { 
    console.error('API Network Fail:', e); 
    return null; 
  }
}

function post(path, body) {
  if (body && (body.user_id === 'null' || body.user_id === 'undefined')) {
    console.warn('Blocking POST with invalid user_id');
    return Promise.resolve(null);
  }
  return api(path, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
}

function toast(msg) {
  const t = document.createElement('div');
  t.style.cssText = "position:fixed; bottom:20px; right:20px; background:#333; color:#fff; padding:10px 20px; border-radius:5px; z-index:9999; font-size:13px; box-shadow:0 4px 12px rgba(0,0,0,0.5); border-left:4px solid var(--cyan);";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
const languageTopics = {
  python: ['Syntax & Data Types', 'Lists, Tuples & Dicts', 'Decorators & Generators', 'Context Managers (With)', 'Pandas & DataFrames', 'NumPy Vectorization', 'Neural Network Layers', 'Django/Flask Routing', 'Asyncio Concurrency', 'FastAPI Development'],
  javascript: ['ES6+ Features', 'DOM & Event Listeners', 'Promises & Async/Await', 'React Hooks (UseState/Effect)', 'Redux State Management', 'Node.js Express Middleware', 'Closures & Hoisting', 'TypeScript Interfaces', 'WebSocket Real-time', 'Next.js SSR/SSG'],
  c: ['Pointers & Addresses', 'Structs & Unions', 'Manual Memory (Malloc/Free)', 'File Handling (Fopen)', 'Preprocessors (#define)', 'Bitwise Operations', 'Standard Library (String.h)', 'Linked List Implementation', 'System Calls', 'Makefiles'],
  cpp: ['STL Containers (Vector, Map)', 'Classes & Inheritance', 'Templates & Generics', 'Memory Management (Smart Pointers)', 'Virtual Functions', 'Exception Handling', 'Operator Overloading', 'Lambda Expressions', 'Multithreading', 'Boost Libraries'],
  java: ['JVM Architecture', 'Collections Framework', 'Lambda & Streams', 'Multithreading (Executors)', 'Spring Boot Beans', 'Hibernate ORM', 'Reflection API', 'Interfaces & Abstracts', 'Maven/Gradle Build', 'JUnit Testing'],
  php: ['Laravel Eloquent', 'Composer Autoloading', 'Symfony Components', 'Sessions & Cookies', 'PHP 8 JIT/Attributes', 'Wordpress Hooks', 'RESTful API Design', 'MySQL Integration', 'Template Engines (Blade/Twig)', 'Namespace & Traits'],
  csharp: ['LINQ & Lambdas', 'ASP.NET Core Middleware', 'Entity Framework Core', 'Dependency Injection', 'Delegates & Events', 'Reflection & Attributes', 'Task Parallel Library', 'WPF/WinForms UI', 'Blazor Components', 'Unity Scripting'],
  ruby: ['Rails ActiveRecord', 'Metaprogramming (Define_method)', 'Procs & Lambdas', 'Mixins & Modules', 'Gems & Bundler', 'RSpec Testing', 'Blocks & Yield', 'Ruby 3 Typing (RBS)', 'Rack Middleware', 'Sinatra Web Framework'],
  rust: ['Ownership & Borrowing', 'Lifetimes & Traits', 'Cargo & Crates', 'Pattern Matching', 'Smart Pointers (Box, Rc)', 'Error Handling (Result/Option)', 'Tokio/Async Runtime', 'Macros & Metaprogramming', 'Unsafe Rust', 'WebAssembly (Wasm-bindgen)'],
  go: ['Goroutines & Channels', 'Interfaces & Embedding', 'Error Handling Pattern', 'Structs & JSON', 'Go Modules', 'Standard Library (Net/Http)', 'Context Management', 'Pointers (No Arithmetic)', 'Reflection in Go', 'Testing & Benchmarking'],
  swift: ['Optionals & Optional Binding', 'SwiftUI Views', 'Combine Framework', 'ARC Memory Management', 'Protocols & Extensions', 'Generics', 'Error Handling (Do-Catch)', 'CoreData Persistence', 'Grand Central Dispatch', 'Animations & Transitions'],
  algorithms: ['Arrays & Strings', 'Recursion & Backtracking', 'Dynamic Programming', 'Graph Traversals (DFS/BFS)', 'Shortest Path (Dijkstra)', 'Sorting & Searching', 'Trees & BST', 'Hashing & Heaps', 'Greedy Algorithms', 'Bit Manipulation'],
  other: ['General Programming', 'Software Architecture', 'DevOps & Deployment', 'Testing & QA', 'UI/UX Design', 'Other']
};

function updateTopics() {
  const lang = document.getElementById('s-lang').value;
  const otherLangInput = document.getElementById('s-lang-other');
  if(otherLangInput) otherLangInput.style.display = lang === 'other' ? 'block' : 'none';

  // Get topics for selected lang or fallback to algorithms
  const topics = [...(languageTopics[lang] || languageTopics['algorithms']), 'Other'];
  
  const select = document.getElementById('s-topic');
  if (select) {
    select.innerHTML = topics.map(t => `<option value="${t}">${t}</option>`).join('');
    updateTopicInput();
  }
}

function updateTopicInput() {
  const topicSelect = document.getElementById('s-topic');
  const otherTopicInput = document.getElementById('s-topic-other');
  if(topicSelect && otherTopicInput) {
    otherTopicInput.style.display = topicSelect.value === 'Other' ? 'block' : 'none';
  }
}

function openSessionModal(){
  document.getElementById('session-modal').style.display='flex';
  // Force refresh topics every time modal opens to ensure first-load consistency
  updateTopics();
}
function closeSessionModal(){ document.getElementById('session-modal').style.display='none'; }
async function submitSession(){
  if (!UID || UID === 'null' || UID === 'undefined') {
    alert('User session not found. Please log in again.');
    window.location.href = 'auth.html';
    return;
  }

  let topicText = document.getElementById('s-topic').value;
  if (topicText === 'Other') {
    topicText = document.getElementById('s-topic-other').value || 'Other';
  }
  
  const lang = document.getElementById('s-lang').value;
  if (lang === 'other') {
    const customLang = document.getElementById('s-lang-other').value;
    if (customLang) topicText = `${customLang} - ${topicText}`;
  }

  const res = await post('/session',{
    user_id: parseInt(UID),
    topic: topicText,
    accuracy: +document.getElementById('s-accuracy').value,
    duration_min: +document.getElementById('s-duration').value,
    problems_solved: +document.getElementById('s-problems').value
  });

  if (res && res.success) {
    closeSessionModal(); 
    toast('Session logged!'); 
    loadDashboard();
  } else {
    alert('Failed to log session. Please try again.');
  }
}
function scoreColor(s){ return s>=80?'var(--green)':s>=60?'var(--cyan)':s>=40?'var(--orange)':'var(--red)'; }
function heatColor(s){ return s>=90?'#10b981':s>=75?'#22c55e':s>=60?'#84cc16':s>=45?'#eab308':s>=30?'#f97316':'#ef4444'; }

// ──── DASHBOARD ────
async function loadDashboard(){
  const d = await api('/dashboard/'+UID); if(!d) return;
  state.dash = d;
  document.getElementById('top-score').textContent = d.predicted_score+'% Score';
  const pg = document.getElementById('page-dashboard');
  const ds = d.daily_status||[];
  const kpi = d.kpis||{};
  const vel = d.velocity||[];
  if (kpi.session_count === 0) {
    pg.innerHTML = `
      <div style="padding:60px 20px; text-align:center; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border); margin:20px 0">
        <div style="font-size:48px; margin-bottom:20px">📊</div>
        <h2 style="color:#fff; margin-bottom:10px">Welcome to Your Live Dashboard</h2>
        <p style="color:var(--text-secondary); max-width:500px; margin:0 auto 25px">We've cleared the demo data. Log your first study session to start training your Digital Twin and see your performance analytics.</p>
        <button class="btn-primary" onclick="openSessionModal()">+ Log My First Session</button>
      </div>`;
    return;
  }

  pg.innerHTML = `
    <div class="grid-auto" style="margin-bottom:18px">
      <div>
        <h1 class="page-title">Good morning, Researcher.</h1>
        <p class="page-sub">Your cognitive performance is tracking upward. You are in optimal state for complex problem solving.</p>
        <div style="display:flex;gap:10px;margin-top:14px">
          <button class="btn-primary" onclick="navigate('debugger')">⚡ Resume Session</button>
          <button class="btn-secondary" onclick="navigate('explainer')">View Detailed Report</button>
        </div>
      </div>
      <div class="glass-card" style="display:flex;gap:20px;align-items:center">
        <div class="score-ring-wrap">
          <div class="score-ring" style="--pct:${d.predicted_score}">
            <div class="score-ring-inner">
              <div class="score-value">${Math.round(d.predicted_score)}</div>
              <div class="score-label">SCORE</div>
            </div>
          </div>
        </div>
        <div style="flex:1">
          <div class="card-title">Daily Status</div>
          ${ds.map((s,i)=>`
            <div class="progress-bar-wrap">
              <div class="progress-bar-header"><span>${s.topic}</span><span style="color:var(--cyan)">${s.score}%</span></div>
              <div class="progress-bar"><div class="progress-bar-fill fill-${['cyan','purple','orange'][i%3]}" style="width:${s.score}%"></div></div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="glass-card" style="margin-bottom:18px">
      <div class="section-header">
        <div><div class="card-title">Learning Progress Velocity</div><div class="card-sub">Trajectory based on last ${kpi.session_count||0} active sessions</div></div>
      </div>
      <canvas id="velChart" height="100"></canvas>
    </div>
    <div class="grid-3">
      <div class="glass-card kpi-card">
        <div class="kpi-icon" style="background:var(--cyan-dim);color:var(--cyan)">⟨/⟩</div>
        <div class="kpi-value" style="color:var(--cyan)">${kpi.total_problems||0}</div>
        <div class="kpi-desc">Problems Solved</div>
      </div>
      <div class="glass-card kpi-card">
        <div class="kpi-icon" style="background:var(--purple-dim);color:var(--purple)">◷</div>
        <div class="kpi-value" style="color:var(--purple)">${kpi.focus_hours||0}<span style="font-size:14px">hrs</span></div>
        <div class="kpi-desc">Focus Time</div>
      </div>
      <div class="glass-card kpi-card">
        <div class="kpi-icon" style="background:rgba(16,185,129,0.15);color:var(--green)">◆</div>
        <div class="kpi-value" style="color:var(--green)">${kpi.avg_accuracy||0}%</div>
        <div class="kpi-desc">Average Accuracy</div>
      </div>
    </div>`;
  // Velocity chart
  const ctx = document.getElementById('velChart');
  if(ctx){
    new Chart(ctx,{type:'line',data:{
      labels:vel.map((_,i)=>'WK '+(i+1).toString().padStart(2,'0')),
      datasets:[{data:vel,borderColor:'#00e5ff',backgroundColor:'rgba(0,229,255,0.08)',
        fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:'#00e5ff',borderWidth:2}]},
      options:{responsive:true,plugins:{legend:{display:false}},
        scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4a5568',font:{size:10}}},
                y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#4a5568',font:{size:10}},min:0,max:100}}}});
  }
}

// ──── DIGITAL TWIN ────
async function loadTwin(){
  const pg = document.getElementById('page-twin');
  pg.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-secondary)">
    <div class="live-dot" style="margin:0 auto 15px"></div>
    Synchronizing with Neural Core...
  </div>`;
  
  const d = await api('/twin/'+UID); 
  if(!d) {
    pg.innerHTML = `<div style="padding:40px; text-align:center; color:var(--red)">
      Failed to load Twin Data. Please check if the backend is running.
      <br><button class="btn-primary" style="margin-top:15px" onclick="loadTwin()">Retry Sync</button>
    </div>`;
    return;
  }
  
  state.twin = d;
  if(d.avg_score) document.getElementById('top-score').textContent = d.avg_score.toFixed(1) + '% Score';
  
  const wt = d.weak_topics||[];
  const tips = d.tips||[];

  pg.innerHTML = `
    <h1 class="page-title">Digital Twin Dashboard</h1>
    <p class="page-sub">High-fidelity cognitive mapping and predictive performance modeling.</p>
    <div class="grid-auto" style="margin-bottom:18px">
      <div class="glass-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="label" style="color:var(--cyan)">ACTIVE SIMULATION</div>
          <div class="live-label"><span class="live-dot"></span> LIVE SYNC</div>
        </div>
        <div class="card-title">Cognitive Resonance Map</div>
        <canvas id="radarChart" height="200"></canvas>
      </div>
      <div class="glass-card">
        <div class="card-title">Behavioral Insights</div>
        ${wt.length ? wt.slice(0,3).map(w => `
          <div class="insight-card">
            <div class="insight-tag critical">WEAK AREA</div>
            <div class="insight-text"><strong>${w.topic}</strong> — avg score ${w.avg_score}%</div>
          </div>`).join('') : '<p style="color:var(--text-secondary)">No weak areas detected.</p>'}
      </div>
    </div>
    <div class="grid-2">
      <div class="glass-card">
        <div class="card-title">What-if Simulation</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:15px">
          <span class="label">Daily Study (Hours)</span>
          <span id="whatifVal" style="color:var(--cyan);font-weight:700">2.0h</span>
        </div>
        <input type="range" min="0.5" max="6" step="0.5" value="2" id="whatifSlider" style="width:100%;margin:10px 0" />
        <div id="whatifResult" class="stat-row" style="margin-top:12px">
            <div class="stat-box"><div class="val" id="wif-score">--</div><div class="lbl">Proj. Score</div></div>
            <div class="stat-box"><div class="val" id="wif-days">--</div><div class="lbl">To Mastery</div></div>
        </div>
      </div>
      <div class="glass-card">
        <div class="card-title">AI Recommendations</div>
        ${tips.map(t => `
          <div class="rec-card">
            <div class="rec-icon">💡</div>
            <div class="rec-body"><strong>${t.feature}</strong>: ${t.tip}</div>
          </div>`).join('') || '<p>Loading tips...</p>'}
      </div>
    </div>`;

  // Initialize Chart
  const rc = document.getElementById('radarChart');
  if(rc && typeof Chart !== 'undefined'){
    const sv = d.shap_values || {};
    const labels = Object.keys(sv).slice(0,6).map(k=>k.replace(/_/g,' '));
    const vals = Object.values(sv).slice(0,6).map(v=>Math.abs(v)*100);
    new Chart(rc, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          data: vals,
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0,229,255,0.1)',
          borderWidth: 2
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { display: false } } }
      }
    });
  }
  // What-if slider
  const sl = document.getElementById('whatifSlider');
  if(sl) sl.addEventListener('input', async ()=>{
    const valEl = document.getElementById('whatifVal');
    if(valEl) valEl.textContent = sl.value+'h';
    const r = await post('/whatif',{user_id:UID,extra_hours_per_day:+sl.value});
    if(r){
      const sEl = document.getElementById('wif-score');
      const dEl = document.getElementById('wif-days');
      if(sEl) sEl.textContent = r.projected_score+'%';
      if(dEl) dEl.textContent = r.days_to_mastery_delta+' Days';
    }
  });
  if(sl) sl.dispatchEvent(new Event('input'));
}

// ──── CODE DEBUGGER ────
function initDebugger(){
  const pg = document.getElementById('page-debugger');
  pg.innerHTML = `
    <h1 class="page-title">Advanced Code Debugger</h1>
    <p class="page-sub">Deep analysis and heuristic error detection for Python code.</p>
    <div style="display:flex; flex-direction:column; gap:20px; height: calc(100vh - 200px);">
        <div class="code-editor" style="flex: 1; display: flex; flex-direction: column; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); overflow: hidden;">
          <div class="code-editor-header" style="background: #161b22; border-bottom: 1px solid #30363d; padding: 8px 16px;">
            <div style="display:flex;align-items:center;gap:15px">
              <div class="code-editor-dots"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span></div>
              <select id="debug-lang-select" style="background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; padding: 2px 8px; font-size:12px; cursor:pointer;" onchange="const ext={python:'py',javascript:'js',cpp:'cpp',java:'java',php:'php',csharp:'cs',ruby:'rb',rust:'rs',go:'go',swift:'swift',c:'c'}[this.value]; document.querySelector('.code-editor-filename').textContent = 'script.' + ext">
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="php">PHP</option>
                <option value="csharp">C#</option>
                <option value="ruby">Ruby</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="swift">Swift</option>
              </select>
              <span class="code-editor-filename" style="color: #8b949e; font-size: 13px; font-family: monospace;">script.py</span>
            </div>
            <button type="button" class="btn-primary" style="padding:6px 20px; font-weight: 600;" onclick="event.preventDefault(); runDebug()">▶ Run Analysis</button>
          </div>
          <div style="flex: 1; position: relative; display: flex;">
            <div style="width: 45px; background: #0d1117; border-right: 1px solid #30363d; display: flex; flex-direction: column; align-items: center; padding-top: 15px; color: #484f58; font-family: monospace; font-size: 12px; user-select: none;">
               1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14<br>15<br>16<br>17<br>18<br>19<br>20
            </div>
            <textarea id="code-input" style="flex: 1; background: transparent; border: none; color: #e6edf3; padding: 15px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 14px; line-height: 1.6; outline: none; resize: none; tab-size: 4;" spellcheck="false" placeholder="// Start coding here..."></textarea>
          </div>
          <div class="code-editor-footer" style="background: #161b22; border-top: 1px solid #30363d; padding: 4px 16px; font-size: 11px; color: #8b949e; display: flex; justify-content: space-between;">
            <span>UTF-8 | LF</span>
            <span>Sarvam-X AI Engine v2.1</span>
          </div>
        </div>
        <div id="trace-section" style="height: 200px; overflow-y: auto; background: #010409; border: 1px solid #30363d; border-radius: 8px; font-family: monospace;"></div>
      </div>
      <div>
        <div id="debug-results"><p style="color:var(--text-secondary);font-size:12px">Click <strong>Analyze</strong> to debug your code.</p></div>
        <div id="debug-eff" style="margin-top:18px"></div>
      </div>`;
}

async function runDebug(){
  const code = document.getElementById('code-input').value;
  if(!code.trim()) return toast('Enter some code first');
  const lang = document.getElementById('debug-lang-select').value;
  const r = await post('/debug',{code,language:lang,user_id:UID}); if(!r) return toast('Backend error');
  const all_errs = r.errors||[], fixes = r.fixes||[], logs = r.trace_log||[];
  const errs = all_errs.filter(e => e.severity === 'CRITICAL' || e.severity === 'WARNING');
  const exec_out = r.exec_out || '';
  const exec_err = r.exec_err || '';
  const exec_code = r.exec_code !== undefined ? r.exec_code : 0;
  
  let html = '';
  if(errs.length){
    html += `<div class="card-title" style="margin-bottom:12px; color:#f85149">⚙ Error Detection</div>`;
    errs.forEach(e=>{
      const cls = e.severity==='CRITICAL'?'critical':'warning';
      html += `<div class="error-card ${cls}" style="background:#161b22; border:1px solid #30363d; margin-bottom:10px; padding:12px; border-radius:6px">
        <div class="error-card-header" style="display:flex; justify-content:space-between; margin-bottom:6px">
          <span style="font-weight:600; font-size:13px; color:${cls==='critical'?'#f85149':'#d29922'}">${e.type}</span>
          <span class="badge" style="font-size:10px; background:${cls==='critical'?'#f8514933':'#d2992233'}; padding:2px 8px; border-radius:10px">Line ${e.line}</span>
        </div>
        <div style="font-size:13px; color:#e6edf3">${e.message}</div></div>`;
    });
  } else {
    html = `
      <div style="background: #0d1117; border: 1px solid #238636; border-radius: 8px; padding: 25px; text-align: center; margin-bottom:20px">
        <div style="color: #3fb950; font-size: 32px; margin-bottom: 10px;">✓</div>
        <h3 style="color:#e6edf3; font-size:16px; margin-bottom:8px">No Static Errors Detected</h3>
        <p style="color:#8b949e; font-size:13px; margin-bottom:20px">Your code logic appears sound according to static analysis.</p>
      </div>`;
  }

  // Always show execution output
  const outText = (exec_out + exec_err).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  html += `
    <div style="text-align: left; background: #010409; padding: 15px; border-radius: 4px; font-family: 'Consolas', monospace; border: 1px solid #30363d; margin-bottom: 20px;">
      <div style="color: #8b949e; font-size: 11px; margin-bottom: 8px; border-bottom: 1px solid #30363d; padding-bottom:4px">CONSOLES / OUTPUT</div>
      <div style="color: #e6edf3; font-size: 13px; line-height:1.6; max-height: 250px; overflow-y: auto;">
        <span style="color:#8b949e"># Executing ${lang}...</span><br>
        ${outText || '<span style="color:#8b949e; font-style:italic">No output produced.</span>'} <br><br>
        <span style="color: ${exec_code === 0 ? '#3fb950' : '#f85149'}">Process finished with exit code ${exec_code}</span>
      </div>
    </div>`;

  if(fixes.length && errs.length){
    html += `<div class="card-title" style="margin:20px 0 10px; color:var(--cyan)">✦ AI Suggested Fixes</div>`;
    fixes.forEach(f=>{
      html += `<div class="fix-card" style="background:#161b22; border:1px solid #30363d; padding:12px; border-radius:6px; margin-bottom:10px">
        <div style="font-size:12px;font-weight:600;margin-bottom:6px; color:var(--cyan)">${f.type} — Line ${f.line}</div>
        <div style="font-size:13px; color:#e6edf3">${f.explanation||f.suggestion}</div></div>`;
    });
  }

  document.getElementById('debug-results').innerHTML = html;

  // Update Trace Log in the Terminal window
  let tl = `<div style="padding:10px; border-bottom:1px solid #30363d; background:#161b22; font-size:11px; color:#8b949e; display:flex; justify-content:space-between"><span>TERMINAL / TRACE LOG</span><span>${lang.toUpperCase()}</span></div>
            <div style="padding:10px; color:#e6edf3; font-size:12px; line-height:1.5">`;
  logs.forEach(l=>{
    const color = l.level==='FAIL'?'#f85149':l.level==='DEBUG'?'#d29922':'#3fb950';
    tl += `<div><span style="color:#8b949e">[${l.time}]</span> <span style="color:${color}; font-weight:600">[${l.level}]</span> ${esc(l.message)}</div>`;
  });
  tl += `</div>`;
  document.getElementById('trace-section').innerHTML = tl;

  // Efficiency ring
  document.getElementById('debug-eff').innerHTML = `
    <div style="background:#161b22; padding:15px; border-radius:8px; border:1px solid #30363d; display:flex; align-items:center; gap:15px">
        <div style="width:60px; height:60px; border-radius:50%; border:4px solid #30363d; border-top-color:#3fb950; display:flex; align-items:center; justify-content:center; transform: rotate(${r.efficiency * 3.6}deg)">
            <span style="transform: rotate(${-r.efficiency * 3.6}deg); font-weight:bold; font-size:14px">${r.efficiency}%</span>
        </div>
        <div>
            <div style="font-size:11px; color:#8b949e">EFFICIENCY SCORE</div>
            <div style="font-size:14px; color:#3fb950; font-weight:bold">Optimized</div>
        </div>
    </div>`;
  tl += '</div>';
  document.getElementById('trace-section').innerHTML = tl;
}
function esc(s){ return s?s.replace(/</g,'&lt;').replace(/>/g,'&gt;'):''; }

// ──── EXPLAINABLE AI ────
async function loadExplainer(){
  const d = await post('/explain',{user_id:UID}); if(!d) return;
  state.xai = d;
  const fb = d.feature_breakdown||[];
  const tips = d.improvement_tips||[];
  const pg = document.getElementById('page-explainer');
  pg.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:4px">
      <span class="badge badge-info">ANALYSIS ACTIVE</span>
    </div>
    <h1 class="page-title">Explainable AI Interface</h1>
    <p class="page-sub">Deconstructing complex neural decisions into human-readable insights.</p>
    <div class="grid-auto" style="margin-bottom:18px">
      <div class="glass-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div class="card-title">Cognitive Breakdown</div>
          <div class="live-label"><span class="live-dot"></span> LIVE REASONING</div>
        </div>
        <div class="narrative-box">${formatNarrative(d.narrative||'')}</div>
        <div class="stat-row" style="margin-top:16px">
          <div class="stat-box"><div class="val">${d.confidence||0}%</div><div class="lbl">Confidence</div></div>
          <div class="stat-box"><div class="val">${d.stability||'--'}</div><div class="lbl">Stability</div></div>
          <div class="stat-box"><div class="val">${d.anomaly_risk||0}%</div><div class="lbl">Anomaly Risk</div></div>
        </div>
      </div>
      <div class="glass-card">
        <div class="card-title">Feature Weights</div>
        <div class="card-sub">SHAP-based impact analysis</div>
        ${fb.map(f=>{
          const pct = Math.min(Math.abs(f.impact)*200, 100);
          const cls = f.impact>=0?'pos':'neg';
          return `<div class="feat-bar-wrap">
            <div class="feat-bar-header"><span>${f.feature}</span><span style="color:${f.impact>=0?'var(--cyan)':'var(--red)'}">${f.impact>=0?'+':''}${f.impact}</span></div>
            <div class="feat-bar"><div class="feat-bar-fill-${cls}" style="width:${pct}%"></div></div></div>`;
        }).join('')}
        <div class="insight-card" style="margin-top:14px">
          <div class="insight-text" style="font-size:11px">The SHAP values indicate how much each feature contributed to the final prediction, shifting away from the mean baseline.</div>
        </div>
      </div>
    </div>
    ${tips.length?`<div class="glass-card"><div class="card-title">🎓 Educational Context</div><div class="card-sub">Actionable improvement tips based on XAI analysis</div>
      <div class="grid-3">${tips.map(t=>`
        <div><div class="label" style="color:var(--orange);margin-bottom:4px">${t.feature}</div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.5">${t.tip}</div></div>`).join('')}</div></div>`:''}`;
}
function formatNarrative(n){
  return n.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
}

// ──── SKILL HEATMAP ────
async function loadHeatmap(){
  const d = await api('/heatmap/'+UID); if(!d) return;
  state.hm = d;
  const topics = d.topics||[];
  const months = d.months||[];
  const grid = d.grid||{};
  const dist = d.mastery_distribution||{};
  const pg = document.getElementById('page-heatmap');

  let hmHTML = `<div style="display:grid;grid-template-columns:140px repeat(${months.length},28px);gap:4px;align-items:center">`;
  hmHTML += `<div></div>`;
  months.forEach(m=>{ hmHTML += `<div class="heatmap-month">${m.split('-')[1]}</div>`; });
  topics.forEach(t=>{
    hmHTML += `<div class="heatmap-label">${t}</div>`;
    months.forEach(m=>{
      const s = (grid[t]&&grid[t][m])||0;
      hmHTML += `<div class="heatmap-cell" style="background:${heatColor(s)}" title="${t}: ${s.toFixed?s.toFixed(1):s}% (${m})"></div>`;
    });
  });
  hmHTML += '</div>';

  pg.innerHTML = `
    <div class="label">SYSTEM ANALYTICS</div>
    <h1 class="page-title">Skill Heatmap</h1>
    <p class="page-sub">Real-time proficiency matrix across multi-modal domains.</p>
    <div class="grid-auto">
      <div class="glass-card">
        <div style="display:flex;gap:20px;align-items:center;margin-bottom:16px">
          <div class="label">Legend: WEAK <span style="display:inline-flex;gap:2px;margin:0 6px">
            <span style="width:12px;height:12px;border-radius:2px;background:#ef4444;display:inline-block"></span>
            <span style="width:12px;height:12px;border-radius:2px;background:#f97316;display:inline-block"></span>
            <span style="width:12px;height:12px;border-radius:2px;background:#eab308;display:inline-block"></span>
            <span style="width:12px;height:12px;border-radius:2px;background:#22c55e;display:inline-block"></span>
            <span style="width:12px;height:12px;border-radius:2px;background:#10b981;display:inline-block"></span>
          </span> STRONG</div>
        </div>
        ${hmHTML}
      </div>
      <div>
        <div class="glass-card" style="margin-bottom:14px;text-align:center">
          <div class="label">AVERAGE PROFICIENCY</div>
          <div style="font-size:28px;font-weight:800;color:var(--cyan);margin:6px 0">${d.avg_proficiency||0}%</div>
        </div>
        <div class="glass-card">
          <div class="card-title">Mastery Distribution</div>
          <div class="progress-bar-wrap"><div class="progress-bar-header"><span>Expertise (90%+)</span><span style="color:var(--cyan)">${dist.expertise||0}%</span></div>
            <div class="progress-bar"><div class="progress-bar-fill fill-cyan" style="width:${dist.expertise||0}%"></div></div></div>
          <div class="progress-bar-wrap"><div class="progress-bar-header"><span>Proficiency (70-89%)</span><span style="color:var(--purple)">${dist.proficiency||0}%</span></div>
            <div class="progress-bar"><div class="progress-bar-fill fill-purple" style="width:${dist.proficiency||0}%"></div></div></div>
          <div class="progress-bar-wrap"><div class="progress-bar-header"><span>Foundational (0-69%)</span><span style="color:var(--orange)">${dist.foundational||0}%</span></div>
            <div class="progress-bar"><div class="progress-bar-fill fill-orange" style="width:${dist.foundational||0}%"></div></div></div>
        </div>
      </div>
    </div>`;
}

// ──── HISTORY ────
async function loadHistory(){
  const pg = document.getElementById('page-history');
  pg.innerHTML = `<div class="spinner"></div>`;
  const d = await api('/history/'+UID); if(!d) return;
  const sessions = d.sessions || [];
  
  if (sessions.length === 0) {
    pg.innerHTML = `
      <h1 class="page-title">Assessment History</h1>
      <p class="page-sub">Review your previous assessments and sessions.</p>
      <div style="padding:60px 20px; text-align:center; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border); margin:20px 0">
        <div style="font-size:48px; margin-bottom:20px">⌛</div>
        <h2 style="color:#fff; margin-bottom:10px">No History Yet</h2>
        <p style="color:var(--text-secondary); max-width:500px; margin:0 auto 25px">Complete your first session to see your history here.</p>
        <button class="btn-primary" onclick="openSessionModal()">Log a Session</button>
      </div>`;
    return;
  }

  pg.innerHTML = `
    <h1 class="page-title">Assessment History</h1>
    <p class="page-sub">Review your completed exams and scores.</p>
    
    <div class="glass-card" style="margin-bottom:24px">
        <div class="card-title" style="margin-bottom:15px">Assessment History</div>
        <div class="history-list">
            ${sessions.map(s => `
                <div class="history-item">
                    <div class="history-icon">📋</div>
                    <div class="history-info">
                        <div class="history-topic">${s.topic}</div>
                        <div class="history-date">${new Date(s.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div class="history-score-wrap">
                        <div class="history-score-lbl">FINAL SCORE</div>
                        <div class="history-score-val" style="color:${scoreColor(s.accuracy)}">${Math.round(s.accuracy)} / 100</div>
                    </div>
                    <div class="history-badge completed">COMPLETED</div>
                </div>
            `).join('')}
        </div>
    </div>`;
}

// ──── INIT ────
navigate(location.hash.slice(1) || 'dashboard');
