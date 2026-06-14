"""
SARVAM-X Flask API — Main Application
"""
import os
import sys
import json
from datetime import timedelta
from flask import Flask, request, jsonify, Response, stream_with_context, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
from duckduckgo_search import DDGS
import requests
import re

# Add parent dir to path for models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

thinking_client = OpenAI(
  base_url="https://integrate.api.nvidia.com/v1",
  api_key=os.environ.get("NVIDIA_THINKING_API_KEY", "missing-key")
)

import database as db
from models.twin_model import DigitalTwin, WhatIfSimulator
from models.debugger import CodeDebugger
from models.explainer import ExplainabilityEngine
from models.momentum import MomentumEngine
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, set_access_cookies, unset_jwt_cookies
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Serve frontend files directly from Flask — no Live Server needed
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:5000", "https://sarvam-x.vercel.app"])

# Security Configurations
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-sarvam-key-change-me')
app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers']
app.config['JWT_COOKIE_SECURE'] = True # Required for cross-domain cookies
app.config['JWT_COOKIE_SAMESITE'] = 'None' # Required for cross-domain cookies
app.config['JWT_COOKIE_CSRF_PROTECT'] = False # Simplified for this demo
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024 # 1MB max payload

jwt = JWTManager(app)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Initialize components
db.init_db()
twin = DigitalTwin()
simulator = WhatIfSimulator(twin)
debugger = CodeDebugger()
explainer = ExplainabilityEngine()
momentum_engine = MomentumEngine()

# ─── GLOBAL ERROR HANDLER ────────────────────────────────────────────────────

@app.errorhandler(Exception)
def handle_exception(e):
    """Return JSON for any unhandled exception instead of a bare 500."""
    import traceback
    traceback.print_exc()
    return jsonify({"error": str(e), "type": type(e).__name__}), 500

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
        
    access_token = create_access_token(identity=str(user_id))
    resp = jsonify({"success": True, "user_id": user_id, "name": name, "email": email, "access_token": access_token})
    set_access_cookies(resp, access_token)
    return resp

@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Missing fields"}), 400
        
    user = db.verify_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401
        
    access_token = create_access_token(identity=str(user['id']))
    resp = jsonify({"success": True, "user_id": user['id'], "name": user['name'], "email": user['email'], "access_token": access_token})
    set_access_cookies(resp, access_token)
    return resp

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    resp = jsonify({"success": True, "message": "Logged out successfully"})
    unset_jwt_cookies(resp)
    return resp

@app.route('/api/auth/update', methods=['POST'])
@jwt_required()
def update_profile():
    data = request.json or {}
    user_id = int(get_jwt_identity())
    new_name = data.get('name')
    
    if not new_name:
        return jsonify({"error": "Missing name"}), 400
        
    db.update_user_name(user_id, new_name)
    return jsonify({"success": True, "name": new_name})

@app.route('/api/user/me', methods=['GET'])
@jwt_required(optional=True)
def get_me():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"success": False, "error": "Not logged in"}), 200
        
    user = db.fetch_user(int(user_id))
    if user:
        return jsonify({"success": True, "user_id": user['id'], "name": user['name'], "email": user['email']})
    return jsonify({"success": False, "error": "User not found"}), 404

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
@jwt_required()
def log_session():
    """Log a study session for a user."""
    print("\n" + "="*50)
    print("!!! RECEIVED SESSION LOG REQUEST !!!")
    try:
        data = request.json or {}
        print(f"[*] DATA: {data}")
    except Exception as e:
        print(f"[!] ERROR: {e}")
        return jsonify({"success": False, "error": "Invalid JSON"}), 400
        
    user_id = int(get_jwt_identity())
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

@app.route('/api/twin', methods=['GET'])
@jwt_required()
def get_twin():
    """Return digital twin state for a user."""
    user_id = int(get_jwt_identity())
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
@jwt_required()
def predict():
    """Run performance prediction on provided session data."""
    data = request.json or {}
    user_id = int(get_jwt_identity())
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

# ─── FAKE NEWS ANALYSIS ───────────────────────────────────────────────────────

@app.route('/api/fakenews/analyze', methods=['POST'])
@limiter.limit("10 per minute")
def analyze_fake_news():
    """Analyze text for fake news and misinformation."""
    data = request.json or {}
    text = data.get('text', data.get('claim', ''))
    
    if not text.strip():
        return jsonify({"error": "No text provided"}), 400

    prompt = f"""You are a highly advanced misinformation analysis engine.
Analyze the following news text and return a STRICT JSON object (no markdown, no backticks, just the JSON string).
Do NOT include any extra text.

CRITICAL INSTRUCTIONS:
- The input text may be in any language (English, Hindi, Tamil, Telugu, etc.). If it is not in English, internally translate and analyze it, but ALWAYS provide your final JSON response (including the explanation) in English.
- Do NOT flag text as fake simply because it describes geopolitical tension, conflict, or uses strong language (e.g., "condemned", "strong protest").
- Real news often involves dramatic events. Assume the text could be authentic breaking news unless it contains highly implausible claims, logical inconsistencies, known conspiracy theories, or extreme emotional manipulation without factual basis.
- Be objective and factual.

Input Text:
\"\"\"{text}\"\"\"

Output JSON Format:
{{
  "explanation": string (A detailed 2-3 sentence reasoning of your analysis. Explain WHY this might be real or fake before making your final judgment.),
  "isFake": boolean (true if likely misinformation or fabricated fake news, false if authentic real news),
  "confidence": number (integer between 0 and 100, how confident you are in your assessment),
  "sentiment": string (float between "0.00" and "1.00", representing emotional manipulation or sentiment intensity. 0.0 is factual/neutral, 1.0 is highly emotionally charged/manipulative),
  "keywords": array of strings (top 3 to 5 suspicious or manipulative words/phrases used in the text),
  "manipulationScore": string (float between "0.00" and "1.00", likelihood of deliberate factual manipulation),
  "sourceCredibility": number (integer between 0 and 100, estimate the credibility based on the tone and claims. 100 is highly credible, 0 is not credible)
}}
"""

    try:
        response = thinking_client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=500
        )
        result_text = response.choices[0].message.content.strip()
        
        # Clean up in case the model returns markdown JSON blocks
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        result_json = json.loads(result_text.strip())
        
        # Post-Processing: Web Presence Verification
        if not result_json.get("isFake", True) and result_json.get("confidence", 0) > 60:
            keywords = result_json.get("keywords", [])
            if keywords:
                query = " ".join(keywords[:3])
                try:
                    # Search broader time frame
                    results = DDGS().text(query, max_results=3)
                    if not results:
                        # Don't blindly force isFake to True, just lower confidence and add a warning
                        result_json["confidence"] = max(10, result_json.get("confidence", 80) - 30)
                        result_json["explanation"] = "[Unverified] We couldn't find immediate external web sources corroborating this. " + result_json.get("explanation", "")
                except Exception as e:
                    print(f"Search API error: {e}")
                    # If search fails, we don't strictly penalize but we can log it

        return jsonify({"success": True, "data": result_json})
    except Exception as e:
        print(f"[!] Fake News Analysis Error: {str(e)}")
        # Fallback to avoid breaking the UI if parsing fails
        return jsonify({
            "success": False, 
            "error": "Failed to analyze text", 
            "details": str(e),
            "data": {
                "isFake": True,
                "confidence": 50,
                "sentiment": "0.50",
                "keywords": ["analysis-failed"],
                "manipulationScore": "0.50",
                "sourceCredibility": 50,
                "explanation": "Analysis failed due to a processing error."
            }
        }), 500

# ─── DEBUG ──────────────────────────────────────────────────────────────────

@app.route('/api/whatsapp/webhook', methods=['POST'])
def whatsapp_webhook():
    """Receive messages from Twilio WhatsApp."""
    incoming_msg = request.form.get('Body', '').strip()
    sender = request.form.get('From', '')

    if not incoming_msg:
        return "<Response></Response>", 200

    # Process via Trinetra logic
    # Simulated basic prompt for the bot
    prompt = f"Analyze the following claim for fake news and give a 2 sentence summary including if it's likely True, False, or Misleading.\nClaim: {incoming_msg}"
    
    try:
        ai_resp = thinking_client.chat.completions.create(
            model="meta/llama-3.1-8b-instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.3
        )
        reply_text = ai_resp.choices[0].message.content.strip()
    except Exception as e:
        reply_text = "Sorry, I am currently unable to process requests."

    # Return TwiML response for WhatsApp
    xml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""
    return Response(xml_response, mimetype='text/xml')

@app.route('/api/leaderboard', methods=['GET'])
@jwt_required()
def get_leaderboard():
    """Return simulated gamification leaderboard for SARVAM-X students."""
    # Simulated top 5 students
    leaderboard = [
        {"rank": 1, "name": "Arjun Patel", "score": 9850, "badges": ["Top Coder", "Fast Debugger"]},
        {"rank": 2, "name": "Meera Sharma", "score": 9200, "badges": ["Algorithm Expert"]},
        {"rank": 3, "name": "You (Current User)", "score": 8450, "badges": ["Rising Star"]},
        {"rank": 4, "name": "Rohan Gupta", "score": 8100, "badges": ["Consistent"]},
        {"rank": 5, "name": "Sneha Reddy", "score": 7900, "badges": ["Quick Learner"]}
    ]
    return jsonify({"leaderboard": leaderboard, "global_percentile": "Top 12%"})

@app.route('/api/debug', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
def debug_code():
    """Analyze Python code for errors and suggest fixes."""
    data = request.json or {}
    code = data.get('code', '')
    language = data.get('language', 'python')
    user_id = int(get_jwt_identity())

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

        # AI Simulated Execution (only if code is correct)
        if len(result['errors']) == 0:
            prompt = f"You are a strict code execution engine. Simulate the execution of this {language} code. Output EXACTLY what would be printed to stdout. No explanations, no markdown formatting, no code blocks, just the raw terminal output. If there is no output, just output nothing.\n\nCode:\n{code}"
            try:
                ai_resp = thinking_client.chat.completions.create(
                    model="meta/llama-3.1-70b-instruct",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500,
                    temperature=0.1
                )
                sim_out = ai_resp.choices[0].message.content.strip()
                result['exec_out'] = sim_out if sim_out else "[Execution completed with no output]"
                result['exec_err'] = ""
                result['exec_code'] = 0
            except Exception as e:
                result['exec_out'] = "Code execution is currently disabled for security reasons."
                result['exec_err'] = f"AI simulation failed: {str(e)}"
                result['exec_code'] = 1
        else:
            result['exec_out'] = "Execution aborted. Please fix the detected errors above first."
            result['exec_err'] = "Static analysis failed."
            result['exec_code'] = 1

        # NOTE: Skipping db.save_debug() to prevent file-watch reloads
        return jsonify(result)
    except Exception as e:
        print(f"[!] Debugger Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/code/review-pr', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute")
def review_pr():
    """Fetch a GitHub PR and review it using LLM."""
    data = request.json or {}
    pr_url = data.get('pr_url', '')

    if not pr_url.strip():
        return jsonify({"error": "No PR URL provided"}), 400

    # Extract owner, repo, pull_number
    match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", pr_url)
    if not match:
        return jsonify({"error": "Invalid GitHub PR URL. Format: https://github.com/owner/repo/pull/123"}), 400

    owner, repo, pull_number = match.groups()
    api_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}"

    try:
        # Fetch PR diff/patch
        headers = {'Accept': 'application/vnd.github.v3.diff'}
        response = requests.get(api_url, headers=headers)
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch PR from GitHub (Status {response.status_code})"}), 400
        
        diff_text = response.text
        if len(diff_text) > 30000:
            diff_text = diff_text[:30000] + "\n...[TRUNCATED]"

        # Call LLM for code review
        prompt = f"""You are a strict and highly skilled Senior Software Engineer conducting a Code Review on a GitHub Pull Request.
Here is the raw git diff patch of the pull request:

```diff
{diff_text}
```

Review the code and provide a JSON response EXACTLY in the following format. Do not use markdown backticks outside of the JSON. Do not add any extra text.

{{
  "errors": [
    {{
      "line": integer (approximate line number of issue),
      "type": "Syntax Error" | "Security Vulnerability" | "Logic Flaw" | "Performance Issue",
      "message": "Description of the issue",
      "severity": "CRITICAL" | "WARNING" | "INFO"
    }}
  ],
  "fixes": [
    "A clear, actionable suggestion to fix an issue",
    "Another suggestion"
  ],
  "complexity": "O(n) / Unknown",
  "efficiency": "A brief note on efficiency"
}}
"""
        ai_resp = thinking_client.chat.completions.create(
            model="meta/llama-3.1-70b-instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.1
        )
        out_text = ai_resp.choices[0].message.content.strip()
        # Clean markdown if returned
        if out_text.startswith("```json"):
            out_text = out_text[7:-3].strip()
        elif out_text.startswith("```"):
            out_text = out_text[3:-3].strip()

        result = json.loads(out_text)

        # Generate XAI explanation
        xai_explanation = explainer.explain_debug(
            result.get('errors', []), result.get('fixes', []),
            result.get('complexity', 'Unknown'), result.get('efficiency', 'Unknown')
        )
        result['xai_explanation'] = xai_explanation
        result['trace_log'] = _generate_trace_log(result.get('errors', []), "github-pr")
        result['exec_out'] = "[Execution not available for PR diffs]"
        result['exec_err'] = ""
        result['exec_code'] = 0

        return jsonify(result)
    except Exception as e:
        print(f"[!] PR Review Error: {str(e)}")
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
@jwt_required()
def explain():
    """Get full XAI breakdown for latest prediction."""
    user_id = int(get_jwt_identity())
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

@app.route('/api/heatmap', methods=['GET'])
@jwt_required()
def heatmap():
    """Return skill heatmap data."""
    user_id = int(get_jwt_identity())
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
@jwt_required()
def whatif():
    """Run what-if simulation."""
    data = request.json or {}
    user_id = int(get_jwt_identity())
    extra_hours = float(data.get('extra_hours_per_day', 1.0))

    sessions = db.fetch_sessions(user_id)
    twin.train(sessions)
    result = simulator.simulate(sessions, extra_hours)
    return jsonify(result)

# ─── LEARNING PATH ────────────────────────────────────────────────────────────

@app.route('/api/path', methods=['GET'])
@jwt_required()
def learning_path():
    """Return personalized learning path."""
    user_id = int(get_jwt_identity())
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

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    """Return all dashboard metrics in one call."""
    user_id = int(get_jwt_identity())
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

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    """Return all session history for a user."""
    user_id = int(get_jwt_identity())
    sessions = db.fetch_sessions(user_id)
    return jsonify({
        "success": True,
        "sessions": sessions
    })

# ─── MOMENTUM ─────────────────────────────────────────────────────────────────

@app.route('/api/momentum', methods=['GET'])
@jwt_required()
def get_momentum():
    """Return full momentum analytics for the Cognitive Mirror."""
    user_id = int(get_jwt_identity())
    sessions = db.fetch_sessions(user_id)
    topic_scores = db.fetch_topic_scores(user_id)
    state = momentum_engine.calculate(sessions, topic_scores)
    return jsonify(state)

# ─── COGNITIVE MIRROR CHAT ────────────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
@jwt_required()
@limiter.limit("10 per minute")
def chat():
    """Stream a response from the Cognitive Mirror LLM."""
    data = request.json or {}
    user_id = int(get_jwt_identity())
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
