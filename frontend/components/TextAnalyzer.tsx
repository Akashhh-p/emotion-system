import React, { useState } from "react";
import { FileText } from "lucide-react";
import { useFusion } from "../context/FusionContext";

const TextAnalyzer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setText: setFusionText } = useFusion();

  // 🔥 MULTIPLE LONG RESPONSES (3 per emotion)
  const getSupportMessage = (emotion: string) => {
    const responses: Record<string, string[]> = {

      sad: [
        "It seems like you're feeling low right now, and that’s completely okay. Give yourself time to slow down and process everything gently.\nTry doing something comforting like listening to music or talking to someone you trust.",
        
        "Feeling sad can be overwhelming, but it doesn’t define who you are. Take things one step at a time and allow yourself to rest without guilt.\nYou deserve patience, care, and understanding during moments like this.",
        
        "You might be going through something emotionally heavy right now. Instead of pushing it away, try to understand your feelings calmly.\nSmall actions like stepping outside or taking deep breaths can help ease your mind."
      ],

      angry: [
        "You seem frustrated or upset, and that’s completely natural. Try to pause before reacting and allow your mind to settle.\nTaking a few deep breaths can help you regain control over your emotions.",
        
        "Anger often comes from deeper thoughts or stress. Instead of reacting instantly, try stepping away for a moment.\nWhen you return with a calm mind, you’ll handle things much better.",
        
        "Right now your emotions feel intense, but reacting quickly may not help. Give yourself a moment to cool down and think clearly.\nA calm response later is always more powerful than an immediate reaction."
      ],

      fear: [
        "It looks like you're feeling anxious or uncertain. Try to ground yourself and focus on what is happening right now.\nSlow breathing and small steps can help reduce the intensity of fear.",
        
        "Fear can make situations feel worse than they are. Shift your focus to what you can control instead of what you cannot.\nEven small positive actions can help you regain confidence.",
        
        "You may be feeling overwhelmed or worried. Take a pause and let your thoughts slow down naturally.\nClarity often comes when your mind is calm, not rushed."
      ],

      happy: [
        "You seem to be in a really positive and happy state right now, which is great to see. Allow yourself to fully enjoy this moment.\nHolding onto these feelings helps build long-term emotional balance.",
        
        "It’s nice to see you feeling good and content. Take time to appreciate this state without overthinking it.\nYou can also spread this positive energy to others around you.",
        
        "You're experiencing a strong positive emotion, and that’s valuable. Stay present and let this feeling strengthen your mindset.\nMoments like these help create emotional stability."
      ],

      neutral: [
        "You seem calm and emotionally balanced right now. This is a good state to maintain clarity and focus.\nTry to stay mindful and aware of your thoughts as they come and go.",
        
        "A neutral emotional state shows stability in your mind. Use this time to think clearly and make thoughtful decisions.\nBeing steady like this is a sign of good emotional control.",
        
        "You are in a stable and relaxed state, which is completely fine. Not every moment needs strong emotions.\nUse this calmness to stay focused and maintain balance."
      ],

      stress: [
        "You seem a bit stressed or overwhelmed at the moment. Try to slow things down and focus on one task at a time.\nTaking short breaks and breathing deeply can help reduce pressure.",
        
        "Stress builds up when too many things happen at once. Instead of pushing harder, take a step back and reset your mind.\nEven a small pause can improve clarity and energy.",
        
        "It looks like you're under pressure right now. Remember, you don’t have to solve everything immediately.\nBreak things into smaller steps and give yourself time to think clearly."
      ]
    };

    const options = responses[emotion?.toLowerCase()] || [
      "Take a moment to slow down and check in with yourself. Your emotional state deserves attention.\nGive yourself time and space to reset calmly.",
      
      "Whatever you're feeling right now is valid. Try not to rush your reactions and let your mind settle naturally.\nClarity comes with patience.",
      
      "Pause for a moment and focus on your breathing. You don’t need to figure everything out instantly.\nTake things step by step."
    ];

    return options[Math.floor(Math.random() * options.length)];
  };

  const analyzeText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: "user_1",
          text: text,
        }),
      });

      const data = await response.json();
      console.log("Text Response:", data);

      if (data.analysis) {
        setResult(data.analysis);

        // 🔥 Store for fusion
        setFusionText(data.analysis);
      } else {
        setError("Invalid response from server");
      }

    } catch (err) {
      console.error(err);
      setError("Failed to analyze text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* INPUT */}
      <div className="bg-slate-900 p-8 rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-indigo-400" />
          <h3 className="text-white font-bold">Text Emotion Analysis</h3>
        </div>

        <textarea
          className="w-full h-40 bg-slate-800 p-4 text-white rounded-xl"
          placeholder="Enter your thoughts..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          onClick={analyzeText}
          disabled={loading}
          className="mt-4 bg-indigo-600 px-6 py-3 text-white rounded-xl"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && (
          <p className="text-red-400 mt-4">{error}</p>
        )}
      </div>

      {/* RESULT */}
      {result && (
        <div className="bg-slate-900 p-8 rounded-3xl space-y-4">

          <p className="text-white text-2xl font-bold">
            {result.dominant_emotion}
          </p>

          <p className="text-slate-400">
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </p>

          {/* 🔥 FRONTEND GENERATED SUPPORT */}
          <p className="text-green-400 whitespace-pre-line">
            {getSupportMessage(result.dominant_emotion)}
          </p>

          {/* BUTTON */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setActiveTab("assistant")}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500"
            >
              Talk to Assistant
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default TextAnalyzer;