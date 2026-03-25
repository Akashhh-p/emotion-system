from collections import Counter


class FusionService:

    # Tunable weights (based on reliability)
    WEIGHTS = {
        "text": 0.3,
        "speech": 0.4,
        "face": 0.3
    }

    # Emotion risk mapping
    RISK_WEIGHTS = {
        "sad": 0.8,
        "fear": 0.7,
        "angry": 0.75,
        "disgust": 0.6,
        "neutral": 0.2,
        "happy": 0.1,
        "surprise": 0.3,
        "no_face": 0.0
    }

    def fuse(self, text=None, speech=None, face=None):

        modalities = []

        if text:
            modalities.append(("text", text))
        if speech:
            modalities.append(("speech", speech))
        if face:
            modalities.append(("face", face))

        if not modalities:
            return {
                "final_emotion": "unknown",
                "confidence": 0,
                "risk_score": 0,
                "risk_level": "LOW"
            }

        # -------------------------
        # 1. Weighted Confidence Score
        # -------------------------
        total_score = 0
        total_weight = 0

        emotion_votes = []

        for modality, data in modalities:

            emotion = data.get("dominant_emotion")
            confidence = data.get("confidence", 0)

            if not emotion:
                continue

            weight = self.WEIGHTS.get(modality, 0.3)

            total_score += weight * confidence
            total_weight += weight

            emotion_votes.append(emotion)

        final_confidence = total_score / total_weight if total_weight > 0 else 0

        # -------------------------
        # 2. Majority Voting (Emotion)
        # -------------------------
        vote_counter = Counter(emotion_votes)
        final_emotion = vote_counter.most_common(1)[0][0]

        # -------------------------
        # 3. Risk Score Calculation
        # -------------------------
        risk_score = 0

        for emotion in emotion_votes:
            risk_score += self.RISK_WEIGHTS.get(emotion, 0.3)

        risk_score = risk_score / len(emotion_votes)

        # -------------------------
        # 4. Risk Level
        # -------------------------
        if risk_score > 0.65:
            risk_level = "HIGH"
        elif risk_score > 0.35:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "final_emotion": final_emotion,
            "confidence": round(final_confidence, 3),
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "modalities_used": len(modalities)
        }