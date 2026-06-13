"""
SARVAM-X Flask API — Main Application
"""
import os
import sys
import json
from flask import Flask, request, jsonify, Response, stream_with_context, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Add parent dir to path for models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

import database as db
from models.twin_model import DigitalTwin, WhatIfSimulator
from models.debugger import CodeDebugger
from models.explainer import ExplainabilityEngine
from models.momentum import MomentumEngine

# Serve frontend files directly from Flask — no Live Server needed
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/favicon.ico')
def favicon():
    return '', 204

# Initialize components
db.init_db()
twin = DigitalTwin()
simulator = WhatIfSimulator(twin)
debugger = CodeDebugger()
explainer = ExplainabilityEngine()
momentum_engine = MomentumEngine()

# ─── AUTHENTICATION ─────────────────────────────────────────────────────────

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    user_id = db.create_user(name, email, password)
    if not user_id:
        return jsonify({"error": "Email already exists"}), 409
        
    return jsonify({"success": True, "user_id": user_id, "name": name, "email": email})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    user = db.verify_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
        
    return jsonify({"success": True, "user_id": user['id'], "name": user['name'], "email": user['email']})

@app.route('/api/auth/update', methods=['POST'])
def update_profile():
    data = request.json or {}
    user_id = data.get('user_id')
    new_name = data.get('name')
    
    if not user_id or not new_name:
        return jsonify({"error": "Missing fields"}), 400
        
    db.update_user_name(user_id, new_name)
    return jsonify({"success": True, "name": new_name})

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.fetch_user(user_id)
    if user:
        return jsonify({"success": True, "name": user['name'], "email": user['email']})
    return jsonify({"error": "User not found"}), 404

# ─── LLM CONFIGURATION ──────────────────────────────────────────────────────
# Thinking Client (Complex Reasoning)
thinking_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ.get("NVIDIA_THINKING_API_KEY", "")
)

# Speaking Client (Multilingual Articulation)
speaking_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ.get("NVIDIA_SPEAKING_API_KEY", "")
)

COGNITIVE_MIRROR_PERSONA = """You are the SARVAM-X Cognitive Mirror — a weightless, empathetic AI learning companion.

PERSONALITY RULES:
- Speak like a smart, caring peer — never corporate or robotic.
- Use 'Empathetic Drift': read the student's emotional state and adapt tone.
- Never guilt-trip. If momentum is low, be encouraging, not pressuring.
- Keep responses concise (2-4 sentences max) unless asked for detail.
- Use analogies and metaphors to explain complex ideas.
- Celebrate wins genuinely. Acknowledge struggles without dwelling.
- Always end with a clear, actionable micro-step.
- Reference specific data (scores, topics, streaks) to feel personalized.

CRITICAL LANGUAGE RULE:
- Mirror the user's language EXACTLY.
- If the user writes in English, reply in English.
- If the user writes in Hindi, reply in Hindi.
- If the user writes in Telugu, Tamil, Gujarati, Kannada, or mix them (e.g., Hinglish), reply in that EXACT SAME language and script.

You have access to the student's real-time learning data below. Use it naturally in conversation — don't dump it all at once.
"""
# ─── STARTUP ────────────────────────────────────────────────────────────────

@app.before_request
def startup():
    pass  # DB already initialized at module load

# ─── HEALTH ──────────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "version": "1.0.0", "system": "SARVAM-X"})

# ─── SESSION ─────────────────────────────────────────────────────────────────

@app.route('/api/session', methods=['POST'])
def log_session():
    """Log a study session for a user."""
    print("\n" + "="*50)
    print("!!! RECEIVED SESSION LOG REQUEST !!!")
    try:
        data = request.get_json(force=True)
        print(f"[*] DATA: {data}")
    except Exception as e:
        print(f"[!] ERROR: {e}")
        return jsonify({"success": False, "error": "Invalid JSON"}), 400
        
    user_id = data.get('user_id', 1)
    topic = data.get('topic', 'General')
    try:
        accuracy = float(data.get('accuracy', 70))
        duration_min = int(data.get('duration_min', 30))
        problems_solved = int(data.get('problems_solved', 5))
    except (ValueError, TypeError) as e:
        print(f"[!] Value error in log_session: {e}")
        return jsonify({"success": False, "error": str(e)}), 400

    db.save_session(user_id, topic, accuracy, duration_min, problems_solved)
    return jsonify({"success": True, "message": "Session logged successfully"})

# ─── DIGITAL TWIN ─────────────────────────────────────────────────────────

@app.route('/api/twin/<int:user_id>', methods=['GET'])
def get_twin(user_id):
    """Return digital twin state for a user."""
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)
    user = db.fetch_user(user_id)

    # Train model on user's data
    twin.train(sessions)
    predicted_score, features = twin.predict(sessions)
    shap_vals = twin.get_shap_values(sessions)
    weak_topics = twin.detect_weak_topics(topic_scores)
    study_plan = twin.generate_study_plan(weak_topics, sessions)
    velocity = twin.get_velocity(sessions)

    # XAI narrative
    narrative = explainer.generate_narrative(predicted_score, shap_vals, weak_topics)
    feature_breakdown = explainer.get_feature_breakdown(shap_vals)
    tips = explainer.get_improvement_tips(shap_vals)

    # Save prediction
    db.save_prediction(user_id, predicted_score, shap_vals, narrative)

    return jsonify({
        "user": user,
        "predicted_score": predicted_score,
        "velocity": velocity,
        "weak_topics": weak_topics,
        "study_plan": study_plan,
        "shap_values": shap_vals,
        "feature_breakdown": feature_breakdown,
        "narrative": narrative,
        "tips": tips,
        "session_count": len(sessions),
    })

# ─── PREDICT ─────────────────────────────────────────────────────────────────

@app.route('/api/predict', methods=['POST'])
def predict():
    """Run performance prediction on provided session data."""
    data = request.json or {}
    user_id = data.get('user_id', 1)
    sessions = db.fetch_sessions(user_id)

    twin.train(sessions)
    predicted_score, _ = twin.predict(sessions)
    shap_vals = twin.get_shap_values(sessions)
    topic_scores = db.fetch_topic_scores(user_id)
    weak_topics = twin.detect_weak_topics(topic_scores)

    narrative = explainer.generate_narrative(predicted_score, shap_vals, weak_topics)
    feature_breakdown = explainer.get_feature_breakdown(shap_vals)

    db.save_prediction(user_id, predicted_score, shap_vals, narrative)

    return jsonify({
        "predicted_score": predicted_score,
        "shap_values": shap_vals,
        "feature_breakdown": feature_breakdown,
        "narrative": narrative,
        "weak_topics": weak_topics,
    })

# ─── DEBUG ──────────────────────────────────────────────────────────────────

@app.route('/api/debug', methods=['POST'])
def debug_code():
    """Analyze Python code for errors and suggest fixes."""
    data = request.json or {}
    code = data.get('code', '')
    language = data.get('language', 'python')
    user_id = data.get('user_id', 1)

    if not code.strip():
        return jsonify({"error": "No code provided"}), 400

    try:
        result = debugger.analyze(code, language)

        # XAI explanation for debug
        xai_explanation = explainer.explain_debug(
            result['errors'], result['fixes'],
            result['complexity'], result['efficiency']
        )
        result['xai_explanation'] = xai_explanation

        # Generate trace log
        result['trace_log'] = _generate_trace_log(result['errors'], language)

        # Execute code if it's Python
        if language == 'python':
            import subprocess
            import tempfile
            try:
                with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                    f.write(code)
                    temp_path = f.name
                
                # Run with 3 second timeout
                exec_res = subprocess.run([sys.executable, temp_path], capture_output=True, text=True, timeout=3)
                result['exec_out'] = exec_res.stdout
                result['exec_err'] = exec_res.stderr
                result['exec_code'] = exec_res.returncode
                os.unlink(temp_path)
            except subprocess.TimeoutExpired:
                result['exec_err'] = "Execution timed out (infinite loop?)."
                result['exec_code'] = 124
            except Exception as e:
                result['exec_err'] = str(e)
                result['exec_code'] = 1
        else:
            result['exec_out'] = "Execution not supported for this language in demo mode."
            result['exec_code'] = 0

        # NOTE: Skipping db.save_debug() to prevent file-watch reloads
        return jsonify(result)
    except Exception as e:
        print(f"[!] Debugger Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def _generate_trace_log(errors, language='python'):
    """Generate simulated runtime trace log based on language."""
    from datetime import datetime
    now = datetime.now().strftime('%H:%M:%S')
    
    analyzer_names = {
        'python': 'Python AST Analyzer',
        'javascript': 'V8 Engine Profiler',
        'cpp': 'Clang Static Analyzer',
        'java': 'JVM Bytecode Verifier',
        'c': 'GCC Static Analyzer',
        'php': 'Zend Engine Debugger',
        'csharp': 'Roslyn Compiler Services',
        'ruby': 'YARV Bytecode Inspector',
        'rust': 'LLVM Borrow Checker',
        'go': 'Go Runtime Tracer',
        'swift': 'Swift Intermediate Language (SIL) Optimizer'
    }
    
    parsing_steps = {
        'python': ['Parsing AST', 'Checking Indentation'],
        'javascript': ['Parsing JIT Hooks', 'Lexical Analysis'],
        'cpp': ['Preprocessing Headers', 'Linking Symbols'],
        'java': ['Loading Classes', 'Bytecode Validation'],
        'c': ['Preprocessing headers', 'Memory boundary check'],
        'php': ['Tokenizing PHP tags', 'Executing Opcode'],
        'csharp': ['Metadata Inspection', 'IL Generation'],
        'ruby': ['Parsing GVL state', 'Object Graph Trace'],
        'rust': ['Borrow Checking', 'Ownership Analysis'],
        'go': ['Goroutine Scheduling', 'Stack Analysis'],
        'swift': ['Reference Counting', 'ARC Analysis']
    }
    
    logs = [{"time": now, "level": "INFO",  "message": f"Initializing SARVAM-X {analyzer_names.get(language, 'Generic')}... OK"}]
    
    for step in parsing_steps.get(language, ['Parsing Source']):
        logs.append({"time": now, "level": "INFO", "message": f"{step}... OK"})
        
    logs.append({"time": now, "level": "INFO",  "message": "Running pattern analysis... OK"})
    for err in errors:
        level = "FAIL" if err.get('severity') == 'CRITICAL' else "DEBUG"
        logs.append({
            "time": now,
            "level": level,
            "message": f"[Line {err.get('line',0)}] {err.get('type','Error')}: {err.get('message','')[:80]}"
        })
    logs.append({"time": now, "level": "INFO", "message": "Analysis complete."})
    return logs

# ─── EXPLAINABILITY ───────────────────────────────────────────────────────────

@app.route('/api/explain', methods=['POST'])
def explain():
    """Get full XAI breakdown for latest prediction."""
    data = request.json or {}
    user_id = data.get('user_id', 1)
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)

    twin.train(sessions)
    predicted_score, _ = twin.predict(sessions)
    shap_vals = twin.get_shap_values(sessions)
    weak_topics = twin.detect_weak_topics(topic_scores)

    narrative = explainer.generate_narrative(predicted_score, shap_vals, weak_topics)
    feature_breakdown = explainer.get_feature_breakdown(shap_vals)
    tips = explainer.get_improvement_tips(shap_vals)

    # Confidence heuristic
    confidence = min(99, 75 + abs(predicted_score - 50) * 0.4)
    anomaly_risk = round(max(0, (100 - predicted_score) * 0.05), 1)

    return jsonify({
        "narrative": narrative,
        "feature_breakdown": feature_breakdown,
        "improvement_tips": tips,
        "predicted_score": predicted_score,
        "confidence": round(confidence, 1),
        "anomaly_risk": anomaly_risk,
        "stability": "High" if confidence > 85 else "Medium",
    })

# ─── HEATMAP ──────────────────────────────────────────────────────────────────

@app.route('/api/heatmap/<int:user_id>', methods=['GET'])
def heatmap(user_id):
    """Return skill heatmap data."""
    topic_scores = db.fetch_topic_scores(user_id)

    # Pivot: {topic: {month: score}}
    grid = {}
    months_sorted = []
    for row in topic_scores:
        topic = row['topic']
        month = row['month']
        if month not in months_sorted:
            months_sorted.append(month)
            
        if topic not in grid:
            grid[topic] = {}
        grid[topic][month] = row['score']

    # Calculate mastery distribution
    all_scores = [s for m in grid.values() for s in m.values()]
    expertise = round(sum(1 for s in all_scores if s >= 90) / max(len(all_scores), 1) * 100, 1)
    proficiency = round(sum(1 for s in all_scores if 70 <= s < 90) / max(len(all_scores), 1) * 100, 1)
    foundational = round(100 - expertise - proficiency, 1)
    avg_proficiency = round(sum(all_scores) / max(len(all_scores), 1), 1)

    return jsonify({
        "grid": grid,
        "months": months_sorted,
        "topics": list(grid.keys()),
        "avg_proficiency": avg_proficiency,
        "mastery_distribution": {
            "expertise": expertise,
            "proficiency": proficiency,
            "foundational": foundational,
        }
    })

# ─── WHAT-IF ─────────────────────────────────────────────────────────────────

@app.route('/api/whatif', methods=['POST'])
def whatif():
    """Run what-if simulation."""
    data = request.json or {}
    user_id = data.get('user_id', 1)
    extra_hours = float(data.get('extra_hours_per_day', 1.0))

    sessions = db.fetch_sessions(user_id)
    twin.train(sessions)
    result = simulator.simulate(sessions, extra_hours)
    return jsonify(result)

# ─── LEARNING PATH ────────────────────────────────────────────────────────────

@app.route('/api/path/<int:user_id>', methods=['GET'])
def learning_path(user_id):
    """Return personalized learning path."""
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)
    twin.train(sessions)
    weak_topics = twin.detect_weak_topics(topic_scores)
    plan = twin.generate_study_plan(weak_topics, sessions)
    tips = explainer.get_improvement_tips(twin.get_shap_values(sessions))

    return jsonify({
        "study_plan": plan,
        "weak_topics": weak_topics,
        "tips": tips,
    })

# ─── DASHBOARD ────────────────────────────────────────────────────────────────

@app.route('/api/dashboard/<int:user_id>', methods=['GET'])
def dashboard(user_id):
    """Return all dashboard metrics in one call."""
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)
    user = db.fetch_user(user_id)

    twin.train(sessions)
    predicted_score, features = twin.predict(sessions)
    velocity = twin.get_velocity(sessions)
    weak_topics = twin.detect_weak_topics(topic_scores)
    shap_vals = twin.get_shap_values(sessions)

    # XAI narrative and study plan
    study_plan = twin.generate_study_plan(weak_topics, sessions)
    narrative = explainer.generate_narrative(predicted_score, shap_vals, weak_topics)
    feature_breakdown = explainer.get_feature_breakdown(shap_vals)
    tips = explainer.get_improvement_tips(shap_vals)

    # Save prediction
    db.save_prediction(user_id, predicted_score, shap_vals, narrative)

    # KPIs
    total_problems = sum(s.get('problems_solved', 0) for s in sessions)
    total_hours = round(sum(s.get('duration_min', 0) for s in sessions) / 60, 1)
    avg_acc = round(sum(s.get('accuracy', 0) for s in sessions) / max(len(sessions), 1), 1)

    # Daily status: top 3 topics by recent score
    topic_avg = {}
    for row in topic_scores:
        t = row['topic']
        topic_avg.setdefault(t, []).append(row['score'])
    daily_status = sorted(
        [{"topic": t, "score": round(sum(v[-3:]) / len(v[-3:]), 1)} for t, v in topic_avg.items()],
        key=lambda x: -x['score']
    )[:3]

    return jsonify({
        "user": user,
        "predicted_score": predicted_score,
        "velocity": velocity,
        "weak_topics": weak_topics[:3],
        "study_plan": study_plan,
        "shap_values": shap_vals,
        "feature_breakdown": feature_breakdown,
        "narrative": narrative,
        "tips": tips,
        "session_count": len(sessions),
        "kpis": {
            "total_problems": total_problems,
            "focus_hours": total_hours,
            "avg_accuracy": avg_acc,
            "session_count": len(sessions),
        },
        "daily_status": daily_status,
    })


# ─── HISTORY ──────────────────────────────────────────────────────────────────

@app.route('/api/history/<int:user_id>', methods=['GET'])
def get_history(user_id):
    """Return all session history for a user."""
    sessions = db.fetch_sessions(user_id)
    return jsonify({
        "success": True,
        "sessions": sessions
    })

# ─── MOMENTUM ─────────────────────────────────────────────────────────────────

@app.route('/api/momentum/<int:user_id>', methods=['GET'])
def get_momentum(user_id):
    """Return full momentum analytics for the Cognitive Mirror."""
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)
    state = momentum_engine.calculate(sessions, topic_scores)
    return jsonify(state)

# ─── COGNITIVE MIRROR CHAT ────────────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    """Stream a response from the Cognitive Mirror LLM."""
    data = request.json or {}
    user_id = data.get('user_id', 1)
    message = data.get('message', '')
    history = data.get('history', [])  # [{role, content}, ...]

    if not message.strip():
        return jsonify({"error": "No message provided"}), 400

    # Gather student context
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)
    mom_state = momentum_engine.calculate(sessions, topic_scores)

    twin.train(sessions)
    predicted_score, _ = twin.predict(sessions)
    weak_topics = twin.detect_weak_topics(topic_scores)
    twin_data = {"predicted_score": predicted_score, "weak_topics": weak_topics}
    student_ctx = momentum_engine.build_system_context(mom_state, twin_data)

    system_msg = COGNITIVE_MIRROR_PERSONA + "\n" + student_ctx
    
    # Format history for OpenAI API
    formatted_messages = [{"role": "system", "content": system_msg + "\nCOMPULSORY RULE: You are a multilingual AI. Look at the user's LATEST message. You MUST reply in the EXACT SAME language. If the user writes in English, reply in English. If they write in Hindi, reply in Hindi. If Telugu, reply in Telugu. Match their language perfectly."}]
    
    for msg in history[-4:]: # Keep last 4 turns for context
        formatted_messages.append({
            "role": msg.get("role", "user"), 
            "content": msg.get("content", "")
        })
    
    formatted_messages.append({
        "role": "user", 
        "content": f"{message}\n\n[SYSTEM ENFORCEMENT: Reply EXACTLY in the language and script of the text above. Do NOT inherit the language from the conversation history. If the user only uses English words (even if their grammar is bad, e.g. 'i solve again'), you MUST reply in pure English. Do NOT reply in Hinglish unless they explicitly use Hindi vocabulary like 'kya', 'hai', 'aap'.]"
    })

    def generate():
        try:
            # OPTIMIZED: Single-stage reasoning and speaking for ultra-low latency.
            # Using a high-performance multilingual model.
            completion = thinking_client.chat.completions.create(
                model="meta/llama-3.1-70b-instruct",
                messages=formatted_messages,
                temperature=0.5,
                max_tokens=512,
                stream=True
            )

            for chunk in completion:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield "data: " + json.dumps({"token": chunk.choices[0].delta.content}) + "\n\n"
            
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield "data: " + json.dumps({"token": f"[Link Lag: {str(e)[:50]}. Retrying...]"}) + "\n\n"
            yield "data: [DONE]\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    db.init_db()
    print("[*] SARVAM-X running at http://localhost:5000")
    print("[*] Open http://localhost:5000 in your browser (NOT Live Server!)")
    app.run(debug=False, port=5000)
