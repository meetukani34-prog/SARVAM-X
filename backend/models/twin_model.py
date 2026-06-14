"""
Digital Twin ML Model — Performance Prediction & What-If Simulation
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings('ignore')


class DigitalTwin:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            "practice_frequency",   # sessions per week
            "avg_accuracy",         # mean accuracy across sessions
            "avg_duration",         # avg minutes per session
            "problems_solved",      # total problems
            "topic_diversity",      # unique topics studied
            "recursion_score",      # specific weak-area scores
            "dp_score",
            "trees_score",
        ]

    def _sessions_to_features(self, sessions):
        """Convert raw session list → feature vector."""
        if not sessions:
            return np.zeros(len(self.feature_names))

        df = pd.DataFrame(sessions)
        df['accuracy'] = pd.to_numeric(df['accuracy'], errors='coerce').fillna(50)
        df['duration_min'] = pd.to_numeric(df['duration_min'], errors='coerce').fillna(30)
        df['problems_solved'] = pd.to_numeric(df['problems_solved'], errors='coerce').fillna(1)

        weeks = max(1, len(sessions) / 5)
        freq = len(sessions) / weeks
        avg_acc = df['accuracy'].mean()
        avg_dur = df['duration_min'].mean()
        total_probs = df['problems_solved'].sum()
        diversity = df['topic'].nunique() if 'topic' in df.columns else 1

        def topic_score(topic_name):
            mask = df['topic'].str.lower().str.contains(topic_name, na=False)
            subset = df[mask]
            return subset['accuracy'].mean() if len(subset) > 0 else avg_acc - 10

        rec_score = topic_score('recursion')
        dp_score = topic_score('dynamic')
        tree_score = topic_score('tree')

        return np.array([freq, avg_acc, avg_dur, total_probs, diversity,
                         rec_score, dp_score, tree_score])

    def train(self, sessions):
        """Train on historical session data (supervised with synthetic labels)."""
        if len(sessions) < 5:
            self.is_trained = False
            return

        # Generate training samples by time-windowing
        X, y = [], []
        df = pd.DataFrame(sessions)
        df = df.sort_values('timestamp') if 'timestamp' in df.columns else df

        # Rolling window: use first N sessions → predict avg accuracy of next 5
        for i in range(5, len(sessions)):
            window = sessions[max(0, i-10):i]
            features = self._sessions_to_features(window)
            next_window = sessions[i:min(i+5, len(sessions))]
            if next_window:
                label = np.mean([s.get('accuracy', 70) for s in next_window])
            else:
                label = features[1]  # fallback to current avg
            X.append(features)
            y.append(label)

        if len(X) < 3:
            self.is_trained = False
            return

        X = np.array(X)
        y = np.array(y)
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True

    def predict(self, sessions):
        """Predict performance score from sessions."""
        features = self._sessions_to_features(sessions)

        if not self.is_trained:
            # Fallback: weighted heuristic
            score = (features[1] * 0.4 + features[0] * 5 + features[4] * 2)
            score = min(100, max(0, score))
        else:
            X = features.reshape(1, -1)
            X_scaled = self.scaler.transform(X)
            score = float(self.model.predict(X_scaled)[0])
            score = min(100, max(0, score))

        return round(score, 1), features

    def get_shap_values(self, sessions):
        """Return SHAP-like feature importances (approximated for demo)."""
        features = self._sessions_to_features(sessions)
        if self.is_trained:
            try:
                import shap
                X_scaled = self.scaler.transform(features.reshape(1, -1))
                explainer = shap.TreeExplainer(self.model)
                shap_values = explainer.shap_values(X_scaled)[0]
                return dict(zip(self.feature_names, [round(float(v), 3) for v in shap_values]))
            except Exception:
                pass
        # Heuristic importance (normalized feature contributions)
        baseline = 70.0
        impacts = {
            "practice_frequency": round((features[0] - 3) * 2.5, 2),
            "avg_accuracy":        round((features[1] - 70) * 0.4, 2),
            "avg_duration":        round((features[2] - 45) * 0.08, 2),
            "problems_solved":     round(min(features[3], 50) * 0.05, 2),
            "topic_diversity":     round((features[4] - 3) * 0.9, 2),
            "recursion_score":     round((features[5] - 70) * 0.35, 2),
            "dp_score":            round((features[6] - 70) * 0.28, 2),
            "trees_score":         round((features[7] - 70) * 0.18, 2),
        }
        return impacts

    def detect_weak_topics(self, topic_scores):
        """Return topics where recent score < 70."""
        if not topic_scores:
            return []
        from collections import defaultdict
        by_topic = defaultdict(list)
        for row in topic_scores:
            by_topic[row['topic']].append(row['score'])
        weak = []
        for topic, scores in by_topic.items():
            avg = np.mean(scores[-3:]) if len(scores) >= 3 else np.mean(scores)
            if avg < 70:
                weak.append({"topic": topic, "avg_score": round(avg, 1)})
        sorted_weak = sorted(weak, key=lambda x: x['avg_score'])
        return [w['topic'] for w in sorted_weak]

    def generate_study_plan(self, weak_topics, sessions):
        """Generate personalized 4-week study plan."""
        plan = []
        priority_topics = weak_topics[:3]
        all_topics = ["Arrays", "Recursion", "Dynamic Programming", "Trees", "Graphs"]
        strong = [t for t in all_topics if t not in priority_topics]

        for week in range(1, 5):
            week_plan = {"week": week, "focus": [], "review": []}
            if priority_topics:
                week_plan["focus"] = priority_topics[:2]
                week_plan["review"] = strong[:1]
            else:
                week_plan["focus"] = all_topics[:2]
                week_plan["review"] = []
            plan.append(week_plan)
        return plan

    def get_velocity(self, sessions):
        """Return weekly progress velocity data for chart."""
        if not sessions:
            return []
        df = pd.DataFrame(sessions)
        df['accuracy'] = pd.to_numeric(df['accuracy'], errors='coerce').fillna(50)
        # Group by week index (sessions already sorted newest first)
        sessions_rev = sessions[::-1]  # oldest first
        chunk = max(1, len(sessions_rev) // 7)
        velocity = []
        for i in range(min(7, len(sessions_rev))):
            window = sessions_rev[i*chunk:(i+1)*chunk]
            if window:
                avg = np.mean([s.get('accuracy', 50) for s in window])
                velocity.append(round(float(avg), 1))
        return velocity


class WhatIfSimulator:
    def __init__(self, twin: DigitalTwin):
        self.twin = twin

    def simulate(self, sessions, extra_hours_per_day: float):
        """Project performance if user increases practice by extra_hours_per_day."""
        base_score, base_features = self.twin.predict(sessions)

        # Scale features proportionally
        multiplier = 1 + (extra_hours_per_day / 4.0)  # 4h = 100% boost cap
        sim_features = base_features.copy()
        sim_features[0] = min(sim_features[0] * multiplier, 14)  # sessions/wk
        sim_features[2] = min(sim_features[2] + extra_hours_per_day * 60, 180)
        sim_features[3] = sim_features[3] * multiplier

        # Project score using ridge (quick heuristic)
        ridge = Ridge()
        X_dummy = np.vstack([base_features, sim_features])
        y_dummy = np.array([base_score, base_score + extra_hours_per_day * 5])
        ridge.fit(X_dummy, y_dummy)
        projected = float(ridge.predict(sim_features.reshape(1,-1))[0])
        projected = min(100, max(base_score, projected))

        days_saved = max(0, int((projected - base_score) * 0.8))
        retention_lift = round((projected - base_score) * 0.6, 1)

        return {
            "base_score": base_score,
            "projected_score": round(projected, 1),
            "days_to_mastery_delta": -days_saved,
            "retention_lift": retention_lift,
        }
