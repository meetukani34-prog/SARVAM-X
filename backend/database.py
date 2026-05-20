import os
import sqlite3
import json
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

# Move DB to a storage folder to avoid Live Server reloads
if os.environ.get("VERCEL"):
    DB_PATH = "/tmp/sarvam.db"
else:
    _BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
    _DB_DIR = os.path.join(_BACKEND_DIR, "db_storage")
    os.makedirs(_DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(_DB_DIR, "sarvam.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            topic TEXT,
            accuracy REAL,
            duration_min INTEGER,
            problems_solved INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS topic_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            topic TEXT,
            month TEXT,
            score REAL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS debug_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            code_snippet TEXT,
            errors_json TEXT,
            fixes_json TEXT,
            complexity TEXT,
            efficiency REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            predicted_score REAL,
            shap_values_json TEXT,
            explanation TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    """)
    conn.commit()
    existing = c.execute("SELECT id FROM users WHERE id=1").fetchone()
    if not existing:
        default_pwd = generate_password_hash("password123")
        c.execute("INSERT INTO users (id,name,email,password) VALUES (1,'Researcher','researcher@sarvam.ai', ?)", (default_pwd,))
        conn.commit()
    
    # CLEAR ALL DATA (Transition to Live Mode)
    # UNCOMMENT the lines below to wipe existing demo data once
    c.execute("DELETE FROM sessions")
    c.execute("DELETE FROM topic_scores")
    c.execute("DELETE FROM predictions")
    c.execute("DELETE FROM debug_history")
    conn.commit()
    conn.close()

def fetch_sessions(user_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM sessions WHERE user_id=? ORDER BY timestamp DESC LIMIT 30",
        (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def fetch_topic_scores(user_id):
    conn = get_conn()
    rows = conn.execute(
        "SELECT topic, month, score FROM topic_scores WHERE user_id=? ORDER BY month",
        (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_user(name, email, password):
    conn = get_conn()
    c = conn.cursor()
    try:
        hashed_pwd = generate_password_hash(password)
        c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, hashed_pwd))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError:
        conn.close()
        return None  # Email already exists

def verify_user(email, password):
    conn = get_conn()
    c = conn.cursor()
    user = c.execute("SELECT id, name, email, password FROM users WHERE email=?", (email,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password'], password):
        return {"id": user['id'], "name": user['name'], "email": user['email']}
    return None

def update_user_name(user_id, new_name):
    conn = get_conn()
    c = conn.cursor()
    c.execute("UPDATE users SET name=? WHERE id=?", (new_name, user_id))
    conn.commit()
    conn.close()
    return True

def save_session(user_id, topic, accuracy, duration_min, problems_solved):
    conn = get_conn()
    conn.execute(
        "INSERT INTO sessions (user_id,topic,accuracy,duration_min,problems_solved) VALUES (?,?,?,?,?)",
        (user_id, topic, accuracy, duration_min, problems_solved))
    conn.commit()
    conn.close()

def save_debug(user_id, code, errors, fixes, complexity, efficiency):
    conn = get_conn()
    conn.execute(
        "INSERT INTO debug_history (user_id,code_snippet,errors_json,fixes_json,complexity,efficiency) VALUES (?,?,?,?,?,?)",
        (user_id, code, json.dumps(errors), json.dumps(fixes), complexity, efficiency))
    conn.commit()
    conn.close()

def save_prediction(user_id, score, shap_vals, explanation):
    conn = get_conn()
    conn.execute(
        "INSERT INTO predictions (user_id,predicted_score,shap_values_json,explanation) VALUES (?,?,?,?)",
        (user_id, score, json.dumps(shap_vals), explanation))
    conn.commit()
    conn.close()

def fetch_user(user_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None
