import React, { useRef, useState, useEffect } from "react";
import { useFusion } from "../context/FusionContext";

const BACKEND_URL = "http://127.0.0.1:8000";

const FaceAnalyzer: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setFace } = useFusion();

  // 🔥 SUPPORT MESSAGES (3 PER EMOTION)
  const getSupportMessage = (emotion: string) => {
    const responses: Record<string, string[]> = {

      sad: [
        "You appear emotionally low right now, and that’s completely okay. Try to give yourself space to process what you're feeling.\nTaking a short break or speaking with someone you trust may help ease your state.",
        
        "Your facial expression suggests sadness. Instead of pushing it away, allow yourself to understand what you’re feeling calmly.\nEven small actions like stepping outside or relaxing can help improve your mood.",
        
        "It seems like you're going through something emotionally heavy. Take a moment to slow down and focus on yourself.\nRemember, it's okay to not feel okay sometimes."
      ],

      angry: [
        "Your expression shows signs of frustration or anger. Try to pause and give yourself a moment before reacting.\nA few deep breaths can help you regain control over your emotions.",
        
        "You seem tense or upset right now. Instead of reacting immediately, step back and allow your mind to settle.\nCalm thinking will help you handle the situation better.",
        
        "There’s visible intensity in your expression. Try to slow down your thoughts and avoid quick reactions.\nResponding calmly later is always more effective."
      ],

      fear: [
        "You look slightly anxious or uneasy. Try to ground yourself and focus on the present moment.\nSlow breathing can help you reduce this feeling.",
        
        "Your expression suggests uncertainty or fear. Shift your focus to what you can control.\nTaking small steps can help you regain confidence.",
        
        "You seem a bit worried. Pause for a moment and let your thoughts slow down naturally.\nClarity comes when your mind is calm."
      ],

      happy: [
        "You look happy and relaxed, which is great to see. Try to fully enjoy this moment without overthinking it.\nPositive emotions like this help build long-term well-being.",
        
        "Your expression reflects a positive emotional state. Take a moment to appreciate it.\nSharing this positivity can also uplift others around you.",
        
        "You seem to be in a good emotional space. Stay present and let this feeling strengthen your mindset.\nMoments like these are valuable."
      ],

      neutral: [
        "Your expression appears calm and balanced. This is a good state to stay focused and think clearly.\nMaintaining this balance helps with emotional stability.",
        
        "You look emotionally steady right now. Use this time to stay mindful of your thoughts.\nA stable mindset is always beneficial.",
        
        "Your face shows a neutral state, which is perfectly fine. Not every moment needs strong emotions.\nUse this calmness to stay grounded."
      ]

    };

    const options = responses[emotion?.toLowerCase()] || [
      "Take a moment to slow down and check in with yourself. Your emotional state matters.\nGive yourself time to reset calmly.",
      
      "Whatever you're feeling right now is valid. Try not to rush your reactions.\nLet your mind settle naturally.",
      
      "Pause and focus on your breathing. You don’t need to handle everything instantly.\nTake things step by step."
    ];

    return options[Math.floor(Math.random() * options.length)];
  };

  // Attach stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  // Cleanup
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setLoadingCamera(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      setStream(mediaStream);

    } catch (err) {
      console.error(err);
      setError("Camera access denied");
    } finally {
      setLoadingCamera(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capture & analyze
  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;

    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);

      const blob: Blob = await new Promise(resolve =>
        canvas.toBlob(b => resolve(b!), "image/jpeg")
      );

      const formData = new FormData();
      formData.append("student_id", "student_001");
      formData.append("file", blob, "frame.jpg");

      const response = await fetch(`${BACKEND_URL}/api/analyze-face`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Face Response:", data);

      if (data.analysis) {
        setResult(data.analysis);

        if (data.analysis.dominant_emotion !== "no_face") {
          setFace(data.analysis);
        }
      } else {
        setError("No Face Detected. Try better lighting or positioning.");
      }

    } catch (err) {
      console.error(err);
      setError("Face analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-col lg:flex-row gap-8">

        {/* CAMERA */}
        <div className="flex-1 space-y-4">

          {!stream ? (
            <button
              onClick={startCamera}
              className="bg-indigo-600 px-4 py-2 text-white rounded-xl"
            >
              {loadingCamera ? "Starting..." : "Start Camera"}
            </button>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-xl"
            />
          )}

          <div className="flex gap-4">
            <button
              onClick={captureAndAnalyze}
              disabled={!stream || analyzing}
              className="bg-indigo-600 px-4 py-2 text-white rounded-xl"
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </button>

            <button
              onClick={stopCamera}
              disabled={!stream}
              className="bg-slate-700 px-4 py-2 text-white rounded-xl"
            >
              Stop
            </button>
          </div>

          {error && <p className="text-red-400">{error}</p>}
        </div>

        {/* RESULT */}
        <div className="bg-slate-900 p-6 rounded-xl w-full lg:w-80">

          {result ? (
            <div className="space-y-4">

              <p className="text-white text-2xl font-bold">
                {result.dominant_emotion}
              </p>

              <p className="text-slate-400">
                {(result.confidence * 100).toFixed(2)}%
              </p>

              {result.dominant_emotion === "no_face" && (
                <p className="text-yellow-400">
                  No face detected. Try better lighting or positioning.
                </p>
              )}

              {/* 🔥 FRONTEND SUPPORT */}
              {result.dominant_emotion !== "no_face" && (
                <p className="text-green-400 whitespace-pre-line">
                  {getSupportMessage(result.dominant_emotion)}
                </p>
              )}

            </div>
          ) : (
            <p className="text-slate-400">Capture and analyze your face</p>
          )}

        </div>
      </div>

      {/* BUTTON */}
      {result && result.dominant_emotion !== "no_face" && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setActiveTab("assistant")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl"
          >
            Talk to Assistant
          </button>
        </div>
      )}

    </div>
  );
};

export default FaceAnalyzer;