import os
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://axwkorbsbhquxdgzmxnf.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2tvcmJzYmhxdXhkZ3pteG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNTA5NjUsImV4cCI6MjA5NjkyNjk2NX0.wntj_jumT7998fc-22BNR8XhcbnueXfMFMCzd326Ljk")

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
    res = supabase.table("topic_scores").select("topic, month, score").eq("user_id", user_id).order("month").execute()
    return res.data

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
