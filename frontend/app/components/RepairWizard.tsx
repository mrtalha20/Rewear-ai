"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  title: string;
  summary: string;
  steps: string[];
  materialsNeeded: string[];
  material: string;
  onComplete: (water: number, co2: number, waste: number) => void;
  onClose: () => void;
};

export default function RepairWizard({
  title,
  summary,
  steps,
  materialsNeeded,
  material,
  onComplete,
  onClose,
}: Props) {
  const [currentStep, setCurrentStep] = useState<-1 | number>(-1); // -1 is Materials Checklist
  const [checkedMaterials, setCheckedMaterials] = useState<Record<number, boolean>>({});
  const [stepCompleted, setStepCompleted] = useState<Record<number, boolean>>({});
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [totalTimerDuration, setTotalTimerDuration] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Parse time from step string (e.g., "Wait 10 minutes", "Let dry for 5 mins")
  const parseTimerFromStep = (stepText: string): number | null => {
    const minsMatch = stepText.match(/(\d+)\s*(minute|minutes|min|mins)/i);
    if (minsMatch) {
      return parseInt(minsMatch[1], 10) * 60;
    }
    const secsMatch = stepText.match(/(\d+)\s*(second|seconds|sec|secs)/i);
    if (secsMatch) {
      return parseInt(secsMatch[1], 10);
    }
    return null;
  };

  // Reset timer on step change
  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const duration = parseTimerFromStep(steps[currentStep]);
      if (duration) {
        setTimeRemaining(duration);
        setTotalTimerDuration(duration);
        setIsTimerRunning(false);
      } else {
        setTimeRemaining(null);
        setTotalTimerDuration(0);
        setIsTimerRunning(false);
      }
    } else {
      setTimeRemaining(null);
      setTotalTimerDuration(0);
      setIsTimerRunning(false);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [currentStep, steps]);

  // Timer countdown hook
  useEffect(() => {
    if (isTimerRunning && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Play notification sound
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = "sine";
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
              gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
              oscillator.start();
              oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (e) {
              console.log("Audio failed to play", e);
            }
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  // Voice recognition init
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        setVoiceTranscript(transcript);

        if (transcript.includes("next") || transcript.includes("continue")) {
          handleNext();
        } else if (transcript.includes("back") || transcript.includes("previous")) {
          handlePrev();
        } else if (transcript.includes("start") || transcript.includes("play")) {
          setIsTimerRunning(true);
        } else if (transcript.includes("pause") || transcript.includes("stop")) {
          setIsTimerRunning(false);
        } else if (transcript.includes("repeat") || transcript.includes("read")) {
          speakCurrentStep();
        }
      };

      recognition.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
      };

      recognition.onend = () => {
        if (isVoiceActive) {
          // Restart if it should be active
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isVoiceActive, currentStep]);

  // Handle voice toggle
  const toggleVoiceControl = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isVoiceActive) {
      recognitionRef.current.stop();
      setIsVoiceActive(false);
    } else {
      recognitionRef.current.start();
      setIsVoiceActive(true);
      setVoiceTranscript("Listening...");
    }
  };

  // Text-to-speech for steps
  const speakCurrentStep = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      let textToSpeak = "";
      if (currentStep === -1) {
        textToSpeak = "First, verify that you have gathered all the necessary materials.";
      } else if (currentStep === steps.length) {
        textToSpeak = "Great job! You have completed the repair. Log your savings to finish.";
      } else {
        textToSpeak = `Step ${currentStep + 1}. ${steps[currentStep]}`;
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger speech when step changes if voice control is active
  useEffect(() => {
    if (isVoiceActive) {
      speakCurrentStep();
    }
  }, [currentStep]);

  const handleNext = () => {
    setCurrentStep((prev) => {
      if (prev < steps.length) {
        return prev + 1;
      }
      return prev;
    });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => {
      if (prev > -1) {
        return prev - 1;
      }
      return prev;
    });
  };

  // Compute eco savings locally
  const getSavings = () => {
    const mat = material.toLowerCase();
    if (mat.includes("cotton")) {
      return { water: 2700, co2: 8.0, waste: 0.25 };
    } else if (mat.includes("denim") || mat.includes("jean")) {
      return { water: 8000, co2: 20.0, waste: 0.6 };
    } else if (mat.includes("polyester") || mat.includes("synthetic") || mat.includes("nylon")) {
      return { water: 1000, co2: 15.0, waste: 0.2 };
    } else if (mat.includes("wool") || mat.includes("silk")) {
      return { water: 3000, co2: 12.0, waste: 0.3 };
    }
    return { water: 2000, co2: 10.0, waste: 0.25 };
  };

  const savings = getSavings();

  const handleCompleteProject = () => {
    onComplete(savings.water, savings.co2, savings.waste);
  };

  const allMaterialsChecked =
    materialsNeeded.length === 0 ||
    materialsNeeded.every((_, idx) => checkedMaterials[idx]);

  // Circular progress calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    timeRemaining !== null && totalTimerDuration > 0
      ? circumference - (timeRemaining / totalTimerDuration) * circumference
      : 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm font-semibold"
          >
            ✕
          </button>
          <p className="text-xxs uppercase tracking-wider font-semibold text-brand-100 mb-1">
            Active Repair Guide
          </p>
          <h3 className="text-lg font-bold truncate">{title}</h3>
          <p className="text-xs text-brand-50/90 line-clamp-1 mt-1">{summary}</p>
        </div>

        {/* Voice Control Overlay Indicator */}
        <div className="bg-brand-50 border-b border-brand-100 px-6 py-2 flex items-center justify-between text-xs">
          <button
            onClick={toggleVoiceControl}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-colors ${
              isVoiceActive
                ? "bg-brand-500 text-white animate-pulse"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>🎙️</span>
            {isVoiceActive ? "Hands-Free On" : "Enable Hands-Free"}
          </button>
          {isVoiceActive && (
            <span className="text-[10px] text-brand-600 truncate max-w-[200px] italic">
              Say "next", "back", "read", or "pause"
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP -1: Materials Checklist */}
          {currentStep === -1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-800">Gather Your Materials</h4>
                <p className="text-xs text-gray-500">
                  Check off the materials before beginning. Preparation is key to a clean repair!
                </p>
              </div>

              {materialsNeeded.length > 0 ? (
                <div className="space-y-2">
                  {materialsNeeded.map((materialItem, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedMaterials[idx]}
                        onChange={(e) =>
                          setCheckedMaterials((prev) => ({
                            ...prev,
                            [idx]: e.target.checked,
                          }))
                        }
                        className="w-4.5 h-4.5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                      />
                      <span
                        className={`text-sm text-gray-700 ${
                          checkedMaterials[idx] ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {materialItem}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                  No specific materials required. Let's get started!
                </div>
              )}
            </div>
          )}

          {/* STEPS 0 to N-1: Guided step-by-step details */}
          {currentStep >= 0 && currentStep < steps.length && (
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span className="text-brand-600">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
                </span>
              </div>

              {/* Progress mini-bar */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Step instruction card */}
              <div className="bg-gray-50 rounded-2xl border border-gray-150 p-5 space-y-3">
                <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
                  {currentStep + 1}
                </span>
                <p className="text-base text-gray-800 font-medium leading-relaxed">
                  {steps[currentStep]}
                </p>
              </div>

              {/* Interactive Timer (if time remaining is parsed) */}
              {timeRemaining !== null && (
                <div className="flex flex-col items-center justify-center p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="#e2e8f0"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="#0ea5e9"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-sky-700">
                      {Math.floor(timeRemaining / 60)}:
                      {String(timeRemaining % 60).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${
                        isTimerRunning ? "bg-amber-500 hover:bg-amber-600" : "bg-sky-600 hover:bg-sky-700"
                      }`}
                    >
                      {isTimerRunning ? "Pause" : "Start Timer"}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimeRemaining(totalTimerDuration);
                      }}
                      className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP N: Completion Renders savings & stats */}
          {currentStep === steps.length && (
            <div className="space-y-6 text-center py-4 flex flex-col items-center">
              {/* CSS Confetti/Celebration */}
              <div className="relative">
                <span className="text-5xl animate-bounce block">🎉</span>
                <div className="absolute inset-0 w-16 h-16 border-2 border-brand-500 rounded-full animate-ping opacity-25 scale-125" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-gray-800">You Saved Your Garment!</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  By repairing instead of replacing, you successfully kept this item in circulation and logged real savings for the planet.
                </p>
              </div>

              {/* Eco Savings Panel */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-sm bg-brand-50/50 rounded-2xl border border-brand-100 p-4">
                <div className="text-center space-y-1">
                  <span className="text-lg">💧</span>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Water</p>
                  <p className="text-sm font-bold text-brand-700">{savings.water} L</p>
                </div>
                <div className="text-center space-y-1 border-x border-brand-100">
                  <span className="text-lg">☁️</span>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">CO₂</p>
                  <p className="text-sm font-bold text-brand-700">{savings.co2.toFixed(1)} kg</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-lg">🗑️</span>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Waste</p>
                  <p className="text-sm font-bold text-brand-700">{savings.waste.toFixed(2)} kg</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-between gap-3">
          {/* Prev button */}
          {currentStep > -1 ? (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {/* Next / Action button */}
          {currentStep === -1 ? (
            <button
              onClick={handleNext}
              disabled={!allMaterialsChecked}
              className="px-5 py-2.5 bg-brand-500 disabled:bg-gray-300 text-white rounded-xl hover:bg-brand-600 disabled:cursor-not-allowed text-sm font-semibold transition-colors flex items-center gap-1.5 ml-auto"
            >
              Start Repair →
            </button>
          ) : currentStep === steps.length ? (
            <button
              onClick={handleCompleteProject}
              className="px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 text-sm font-semibold transition-colors flex items-center gap-1.5 ml-auto animate-pulse"
            >
              Complete & Log Impact 🌱
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 text-sm font-semibold transition-colors flex items-center gap-1.5 ml-auto"
            >
              {currentStep === steps.length - 1 ? "Finish Repair" : "Next Step →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
