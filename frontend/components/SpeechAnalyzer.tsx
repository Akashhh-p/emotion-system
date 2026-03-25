import React, { useState, useRef } from "react";
import { Mic, Square, Play } from "lucide-react";
import { useFusion } from "../context/FusionContext";

const API = "http://127.0.0.1:8000/api";

const SpeechAnalyzer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { setSpeech } = useFusion();

  // 🔥 LONG + RANDOM SUPPORT MESSAGES
  const getSupportMessage = (emotion: string) => {
    const responses: Record<string, string[]> = {

      sad: [
        "You sound emotionally low right now, and that’s completely okay. Try to slow down and give yourself space to process everything calmly.\nTalking to someone or doing something comforting can help ease this feeling.",
        
        "Sadness can feel heavy, but it doesn’t last forever. Take small steps and focus on caring for yourself instead of rushing through emotions.\nYou deserve patience and understanding during this time.",
        
        "It seems like you're going through something difficult. Instead of pushing it away, try to acknowledge your feelings gently.\nEven small actions like resting or breathing deeply can help improve your state."
      ],

      angry: [
        "You sound frustrated or tense, which is completely natural sometimes. Try to pause before reacting and allow your mind to settle.\nA few deep breaths can help you regain control over your emotions.",
        
        "Anger often builds up quickly, but reacting immediately may not help. Try stepping away and giving yourself time to cool down.\nYou’ll respond much better once your mind is calm.",
        
        "Your tone suggests strong emotions right now. Instead of reacting instantly, slow down and think clearly.\nA calm response later is always better than a rushed reaction."
      ],

      fear: [
        "You seem anxious or uncertain at the moment. Try to ground yourself and focus on what is happening right now.\nSlow breathing can help reduce the intensity of fear.",
        
        "Fear can make situations feel overwhelming. Try shifting your focus to what you can control instead of what you cannot.\nSmall steps can help rebuild confidence.",
        
        "You might be feeling worried or uneasy. Take a moment to pause and let your thoughts settle.\nClarity usually comes when your mind is calm."
      ],

      happy: [
        "You sound positive and emotionally uplifted, which is great to hear. Try to enjoy this moment fully without overthinking it.\nHolding onto this feeling helps build long-term positivity.",
        
        "It’s nice to hear a positive tone in your voice. Take time to appreciate this moment and let it strengthen your mindset.\nYou can also share this positivity with others.",
        
        "You're in a good emotional state right now. Stay present and allow yourself to enjoy it completely.\nMoments like these help maintain emotional balance."
      ],

      neutral: [
        "Your tone seems calm and steady right now. This is a good state to stay focused and think clearly.\nMaintaining this balance helps you handle situations better.",
        
        "You appear emotionally stable at the moment. Use this time to stay mindful and aware of your thoughts.\nA steady mindset is always beneficial.",
        
        "You sound balanced and composed. Not every moment needs strong emotions, and this is perfectly fine.\nUse this calmness to stay productive and focused."
      ],

      stress: [
        "You seem a bit stressed or under pressure. Try to slow down and focus on one thing at a time.\nTaking short breaks can help clear your mind.",
        
        "Stress builds when too much is happening at once. Try stepping back and giving yourself a moment to reset.\nEven a small pause can improve your clarity.",
        
        "It sounds like you're dealing with pressure right now. Remember, you don’t need to handle everything immediately.\nBreak things into smaller steps and move gradually."
      ]
    };

    const options = responses[emotion?.toLowerCase()] || [
      "Take a moment to slow down and check in with yourself. Your emotional state matters.\nGive yourself time and space to reset calmly.",
      
      "Whatever you're feeling right now is valid. Try not to rush your reactions.\nLet your mind settle naturally.",
      
      "Pause and focus on your breathing. You don’t need to solve everything instantly.\nTake things step by step."
    ];

    return options[Math.floor(Math.random() * options.length)];
  };

  // 🎤 Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error(err);
      setError("Microphone access denied");
    }
  };

  // 🛑 Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 🧠 Analyze
  const analyzeAudio = async () => {
    if (!audioUrl) return;

    setProcessing(true);
    setResult(null);
    setError(null);

    try {
      const blob = await fetch(audioUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("student_id", "student_001");
      formData.append("file", blob, "audio.webm");

      const response = await fetch(`${API}/analyze-speech`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Speech Response:", data);

      if (data.analysis) {
        setResult(data.analysis);
        setSpeech(data.analysis); // fusion
      } else {
        setError("Invalid response");
      }

    } catch (err) {
      console.error(err);
      setError("Speech analysis failed");
    }

    setProcessing(false);
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* 🎤 RECORD */}
        <div className="bg-slate-900 p-8 rounded-3xl flex flex-col items-center">

          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
            isRecording ? "bg-red-600" : "bg-indigo-600"
          }`}>
            {isRecording ? <Square className="text-white" /> : <Mic className="text-white" />}
          </div>

          <div className="mt-6">
            {!isRecording ? (
              <button onClick={startRecording} className="bg-indigo-600 px-6 py-3 text-white rounded-xl">
                Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} className="bg-red-600 px-6 py-3 text-white rounded-xl">
                Stop
              </button>
            )}
          </div>

          {audioUrl && !isRecording && (
            <div className="mt-6 flex gap-4">
              <button onClick={() => new Audio(audioUrl).play()} className="bg-indigo-600 p-2 rounded">
                <Play />
              </button>

              <button onClick={analyzeAudio} className="bg-slate-700 px-4 py-2 text-white rounded">
                {processing ? "Processing..." : "Analyze"}
              </button>
            </div>
          )}

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>

        {/* 📊 RESULT */}
        <div className="bg-slate-900 p-8 rounded-3xl">
          {result ? (
            <div className="space-y-4">

              <p className="text-white text-2xl font-bold">
                {result.dominant_emotion || result.sentiment}
              </p>

              {result.confidence && (
                <p className="text-purple-400">
                  {(result.confidence * 100).toFixed(2)}%
                </p>
              )}

              {/* 🔥 FRONTEND SUPPORT */}
              <p className="text-green-400 whitespace-pre-line">
                {getSupportMessage(result.dominant_emotion || result.sentiment)}
              </p>

            </div>
          ) : (
            <p className="text-slate-400">Record and analyze speech</p>
          )}
        </div>
      </div>

      {/* 🤖 BUTTON */}
      {result && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setActiveTab("assistant")}
            className="px-8 py-3 bg-green-600 text-white rounded-xl"
          >
            Talk to Assistant
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeechAnalyzer;