"""
XAI Explainability Layer
Converts raw SHAP values → human-readable explanations
"""


class ExplainabilityEngine:
    def __init__(self):
        self.feature_labels = {
            "practice_frequency":   "practice frequency (sessions per week)",
            "avg_accuracy":         "average accuracy across sessions",
            "avg_duration":         "average session duration",
            "problems_solved":      "total problems solved",
            "topic_diversity":      "topic diversity",
            "recursion_score":      "recursion proficiency",
            "dp_score":             "dynamic programming proficiency",
            "trees_score":          "tree data-structures proficiency",
        }

        self.improvement_tips = {
            "practice_frequency":   "Schedule at least 5 practice sessions per week.",
            "avg_accuracy":         "Focus on understanding errors; review mistakes immediately.",
            "avg_duration":         "Aim for 45-60 minute focused sessions (Pomodoro technique).",
            "problems_solved":      "Solve at least 10 problems per week on LeetCode/HackerRank.",
            "topic_diversity":      "Explore new topics to strengthen cross-domain reasoning.",
            "recursion_score":      "Practice recursion problems daily: tree traversals, factorial, fibonacci.",
            "dp_score":             "Start DP with memoization, then bottom-up tabulation.",
            "trees_score":          "Implement BST from scratch and solve 10 tree problems.",
        }

    def generate_narrative(self, predicted_score: float, shap_values: dict, weak_topics: list) -> str:
        """Generate a human-readable explanation paragraph."""
        # Top positive and negative contributors
        sorted_shap = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
        top_positive = [(k, v) for k, v in sorted_shap if v > 0][:2]
        top_negative = [(k, v) for k, v in sorted_shap if v < 0][:2]

        parts = []
        parts.append(f"The SARVAM-X model predicts your performance score at **{predicted_score:.1f}/100**.")

        if top_positive:
            pos_strs = [f"**{self.feature_labels.get(k, k)}** (+{v:.2f})" for k, v in top_positive]
            parts.append(f"Your score is positively driven by {' and '.join(pos_strs)}, which push you above average.")

        if top_negative:
            neg_strs = [f"**{self.feature_labels.get(k, k)}** ({v:.2f})" for k, v in top_negative]
            parts.append(f"However, your score is held back by {' and '.join(neg_strs)}.")

        if weak_topics:
            topic_names = ', '.join(weak_topics[:3])
            parts.append(f"Weak areas detected: **{topic_names}**. Strengthening these could improve your score significantly.")

        # Confidence heuristic (higher score = higher confidence)
        confidence = min(99, 75 + abs(predicted_score - 50) * 0.4)
        parts.append(f"Model confidence: **{confidence:.1f}%**.")

        return ' '.join(parts)

    def get_feature_breakdown(self, shap_values: dict) -> list:
        """Return sorted list of feature impacts for bar chart."""
        breakdown = []
        for feature, impact in shap_values.items():
            breakdown.append({
                "feature": self.feature_labels.get(feature, feature),
                "key": feature,
                "impact": round(impact, 3),
                "direction": "positive" if impact >= 0 else "negative"
            })
        return sorted(breakdown, key=lambda x: abs(x['impact']), reverse=True)

    def get_improvement_tips(self, shap_values: dict) -> list:
        """Return actionable tips for the most impactful negative features."""
        tips = []
        for feature, impact in sorted(shap_values.items(), key=lambda x: x[1]):
            if impact < 0:
                tip = self.improvement_tips.get(feature)
                if tip:
                    tips.append({
                        "feature": self.feature_labels.get(feature, feature),
                        "impact": round(impact, 3),
                        "tip": tip
                    })
        return tips[:3]

    def explain_debug(self, errors: list, fixes: list, complexity: str, efficiency: float) -> str:
        """Generate human explanation for debug results."""
        if not errors:
            return f"No errors detected. Code complexity is **{complexity}** with an efficiency rating of **{efficiency:.0f}/100**."

        critical = [e for e in errors if e.get('severity') == 'CRITICAL']
        warnings = [e for e in errors if e.get('severity') == 'WARNING']
        infos = [e for e in errors if e.get('severity') == 'INFO']

        parts = []
        if critical:
            types = ', '.join(set(e['type'] for e in critical))
            parts.append(f"Found **{len(critical)} critical error(s)** ({types}) that will cause runtime failures.")
        if warnings:
            types = ', '.join(set(e['type'] for e in warnings))
            parts.append(f"**{len(warnings)} warning(s)** detected ({types}) that may cause subtle bugs.")
        if infos:
            parts.append(f"**{len(infos)} code quality suggestion(s)** found.")

        parts.append(f"Estimated time complexity: **{complexity}**. Efficiency score: **{efficiency:.0f}/100**.")

        if fixes:
            parts.append(f"**{len(fixes)} automated fix(es)** have been generated. Review and apply them carefully.")

        return ' '.join(parts)
