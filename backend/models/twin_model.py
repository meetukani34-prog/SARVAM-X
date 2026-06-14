"""
Digital Twin ML Model — Performance Prediction & What-If Simulation
(Rewritten in pure Python to avoid 500MB Vercel serverless limit)
"""

class DigitalTwin:
    def __init__(self):
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
            return [0] * len(self.feature_names)

        accuracies = [float(s.get('accuracy', 50)) for s in sessions]
        durations = [float(s.get('duration_min', 30)) for s in sessions]
        probs = [float(s.get('problems_solved', 1)) for s in sessions]
        topics = set(s.get('topic', 'General') for s in sessions)

        weeks = max(1.0, len(sessions) / 5.0)
        freq = len(sessions) / weeks
        avg_acc = sum(accuracies) / len(accuracies) if accuracies else 50.0
        avg_dur = sum(durations) / len(durations) if durations else 30.0
        total_probs = sum(probs)
        diversity = len(topics)

        def topic_score(topic_name):
            matching = [float(s.get('accuracy', 50)) for s in sessions if topic_name in str(s.get('topic', '')).lower()]
            return sum(matching) / len(matching) if matching else avg_acc - 10.0

        rec_score = topic_score('recursion')
        dp_score = topic_score('dynamic')
        tree_score = topic_score('tree')

        return [freq, avg_acc, avg_dur, total_probs, diversity,
                rec_score, dp_score, tree_score]

    def train(self, sessions):
        """Mock training to satisfy API"""
        if len(sessions) >= 5:
            self.is_trained = True
        else:
            self.is_trained = False

    def predict(self, sessions):
        """Predict performance score from sessions."""
        features = self._sessions_to_features(sessions)
        score = (features[1] * 0.4 + features[0] * 5 + features[4] * 2)
        score = min(100.0, max(0.0, score))
        return round(score, 1), features

    def get_shap_values(self, sessions):
        """Return SHAP-like feature importances (approximated for demo)."""
        features = self._sessions_to_features(sessions)
        
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
            recent_scores = scores[-3:] if len(scores) >= 3 else scores
            avg = sum(recent_scores) / len(recent_scores) if recent_scores else 0
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
        
        sessions_rev = sessions[::-1]
        chunk = max(1, len(sessions_rev) // 7)
        velocity = []
        for i in range(min(7, len(sessions_rev))):
            window = sessions_rev[i*chunk:(i+1)*chunk]
            if window:
                accuracies = [float(s.get('accuracy', 50)) for s in window]
                avg = sum(accuracies) / len(accuracies) if accuracies else 50.0
                velocity.append(round(float(avg), 1))
        return velocity


class WhatIfSimulator:
    def __init__(self, twin: DigitalTwin):
        self.twin = twin

    def simulate(self, sessions, extra_hours_per_day: float):
        """Project performance if user increases practice by extra_hours_per_day."""
        base_score, base_features = self.twin.predict(sessions)

        # Scale features proportionally
        multiplier = 1 + (extra_hours_per_day / 4.0)
        sim_features = base_features.copy()
        sim_features[0] = min(sim_features[0] * multiplier, 14)  # sessions/wk
        sim_features[2] = min(sim_features[2] + extra_hours_per_day * 60, 180)
        sim_features[3] = sim_features[3] * multiplier

        # Project score using heuristic
        projected = base_score + (extra_hours_per_day * 5)
        projected = min(100.0, max(base_score, projected))

        days_saved = max(0, int((projected - base_score) * 0.8))
        retention_lift = round((projected - base_score) * 0.6, 1)

        return {
            "current_score": base_score,
            "projected_score": round(projected, 1),
            "days_saved": days_saved,
            "retention_lift_percent": retention_lift
        }
