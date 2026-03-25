import React, { useState } from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useFusion } from "../context/FusionContext";

const BACKEND_URL = "http://127.0.0.1:8000";

const RiskAssessment: React.FC = () => {
  const { data } = useFusion();

  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);

  const fetchRisk = async () => {
    // 🚨 IMPORTANT CHECK
    if (!data.text && !data.speech && !data.face) {
      alert("Run Text / Speech / Face analysis first!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze-fusion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: data.text,
          speech: data.speech,
          face: data.face
        })
      });

      const res = await response.json();
      console.log("Fusion Response:", res);

      setRiskData(res);

    } catch (error) {
      console.error("Fusion failed:", error);
      alert("Fusion failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED KEYS
  const riskScore = riskData ? riskData.risk_score : 0;
  const riskLevel = riskData ? riskData.risk_level : "LOW";

  const circleDash = 251.2;
  const dashOffset = circleDash * (1 - riskScore);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* 🔥 RISK GAUGE */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-10 rounded-3xl text-center flex flex-col items-center justify-center shadow-xl">

          <div className="flex items-center gap-3 mb-8 self-start">
            <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Consolidated Risk Score
            </h3>
          </div>

          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-slate-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-indigo-500"
                strokeWidth="6"
                strokeDasharray={circleDash}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {riskLevel}
              </span>
              <span className="text-slate-500 text-xs uppercase mt-2">
                Stability Index
              </span>
            </div>
          </div>

          {/* STATUS */}
          <div className={`p-5 rounded-2xl w-full flex items-center gap-4 ${
            riskScore > 0.7
              ? "bg-red-500/10 border border-red-500/20"
              : riskScore > 0.4
              ? "bg-yellow-500/10 border border-yellow-500/20"
              : "bg-green-500/10 border border-green-500/20"
          }`}>

            <div className="w-10 h-10 flex items-center justify-center">
              {riskScore > 0.7 ? (
                <AlertTriangle className="text-red-500" size={20} />
              ) : (
                <CheckCircle2 className="text-green-500" size={20} />
              )}
            </div>

            <div className="text-left">
              <p className="text-white font-bold">
                Score: {(riskScore * 100).toFixed(1)}%
              </p>
              <p className="text-slate-400 text-xs">
                {riskData?.final_emotion
                  ? `Detected emotion: ${riskData.final_emotion}`
                  : "Run fusion to see result"}
              </p>
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={fetchRisk}
            disabled={loading}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl"
          >
            {loading ? "Analyzing..." : "Run Fusion"}
          </button>

        </div>

        {/* 📊 FORECAST */}
        <div className="md:col-span-7">

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-lg">

            <h3 className="text-xl font-bold text-white mb-6">
              Fusion Insights
            </h3>

            {riskData ? (
              <div className="space-y-6">

                <div className="p-6 bg-slate-800 rounded-xl">
                  <h4 className="text-white font-bold">Final Emotion</h4>
                  <p className="text-indigo-400 mt-2">
                    {riskData.final_emotion}
                  </p>
                </div>

                <div className="p-6 bg-slate-800 rounded-xl">
                  <h4 className="text-white font-bold">Confidence</h4>
                  <p className="text-slate-300 mt-2">
                    {(riskData.confidence * 100).toFixed(1)}%
                  </p>
                </div>

              </div>
            ) : (
              <p className="text-slate-400">
                Run fusion to generate insights.
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default RiskAssessment;