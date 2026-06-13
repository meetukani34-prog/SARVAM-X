import os
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def init_db():
    # Tables are created manually in Supabase SQL editor.
    # We can just verify connection by fetching the researcher user.
    try:
        res = supabase.table("users").select("id").eq("id", 1).execute()
        if not res.data:
            default_pwd = generate_password_hash("password123")
            supabase.table("users").insert({
                "id": 1,
                "name": "Researcher",
                "email": "researcher@sarvam.ai",
                "password": default_pwd
            }).execute()
    except Exception as e:
        print("Supabase Init Error:", e)

def fetch_sessions(user_id):
    res = supabase.table("sessions").select("*").eq("user_id", user_id).order("timestamp", desc=True).limit(30).execute()
    return res.data

def fetch_topic_scores(user_id):
    # Dynamically compute topic_scores from real user sessions
    res = supabase.table("sessions").select("topic, accuracy, timestamp").eq("user_id", user_id).execute()
    sessions = res.data
    
    if not sessions:
        return []
        
    scores_dict = {}
    for s in sessions:
        topic = s.get("topic")
        acc = s.get("accuracy", 0)
        ts_str = s.get("timestamp")
        
        if ts_str:
            try:
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                sort_key = dt.strftime("%Y-%m")
                display_month = dt.strftime("%b %y") # e.g. "Jun 26"
            except Exception:
                sort_key = "2000-01"
                display_month = "Unknown"
        else:
            sort_key = "2000-01"
            display_month = "Unknown"
            
        key = (topic, sort_key, display_month)
        if key not in scores_dict:
            scores_dict[key] = []
        scores_dict[key].append(acc)
        
    topic_scores = []
    for (topic, sort_key, display_month), acc_list in scores_dict.items():
        avg_score = sum(acc_list) / len(acc_list)
        topic_scores.append({
            "topic": topic,
            "sort_key": sort_key,
            "month": display_month,
            "score": round(avg_score, 1)
        })
        
    topic_scores.sort(key=lambda x: x["sort_key"])
    return topic_scores

def create_user(name, email, password):
    hashed_pwd = generate_password_hash(password)
    try:
        res = supabase.table("users").insert({
            "name": name,
            "email": email,
            "password": hashed_pwd
        }).execute()
        return res.data[0]["id"]
    except Exception as e:
        print("Create User Error:", e)
        return None  # Email already exists or other error

def verify_user(email, password):
    res = supabase.table("users").select("id, name, email, password").eq("email", email).execute()
    if res.data:
        user = res.data[0]
        if check_password_hash(user['password'], password):
            return {"id": user['id'], "name": user['name'], "email": user['email']}
    return None

def update_user_name(user_id, new_name):
    supabase.table("users").update({"name": new_name}).eq("id", user_id).execute()
    return True

def save_session(user_id, topic, accuracy, duration_min, problems_solved):
    supabase.table("sessions").insert({
        "user_id": user_id,
        "topic": topic,
        "accuracy": accuracy,
        "duration_min": duration_min,
        "problems_solved": problems_solved
    }).execute()

def save_debug(user_id, code, errors, fixes, complexity, efficiency):
    supabase.table("debug_history").insert({
        "user_id": user_id,
        "code_snippet": code,
        "errors_json": json.dumps(errors),
        "fixes_json": json.dumps(fixes),
        "complexity": complexity,
        "efficiency": efficiency
    }).execute()

def save_prediction(user_id, score, shap_vals, explanation):
    supabase.table("predictions").insert({
        "user_id": user_id,
        "predicted_score": score,
        "shap_values_json": json.dumps(shap_vals),
        "explanation": explanation
    }).execute()

def fetch_user(user_id):
    res = supabase.table("users").select("*").eq("id", user_id).execute()
    return res.data[0] if res.data else None
