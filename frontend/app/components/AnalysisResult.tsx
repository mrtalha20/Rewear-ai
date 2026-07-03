"use client";

import { useState } from "react";
import type { AnalysisData } from "../page";
import RepairWizard from "./RepairWizard";

type Props = {
  result: AnalysisData;
  imagePreview: string;
  onReset: () => void;
  onComplete: (water: number, co2: number, waste: number) => void;
};

const severityColors = {
  minor:    "bg-green-50 text-green-700 border-green-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  major:    "bg-red-50 text-red-700 border-red-200",
};

export default function AnalysisResult({ result, imagePreview, onReset, onComplete }: Props) {
  const [tab, setTab] = useState<"repair" | "style">("repair");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  return (
    <div className="space-y-4">

      {/* Sustainability tip banner */}
      <div className="flex items-start gap-2.5 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-sm text-brand-700">
        <span className="text-base mt-0.5">🌱</span>
        <span>{result.sustainabilityTip}</span>
      </div>

      {/* Garment summary card */}
      <div className="card">
        <div className="flex gap-4">
          <img
            src={imagePreview}
            alt="Your garment"
            className="w-20 h-20 object-cover rounded-xl border border-gray-100 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {result.garmentType}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${severityColors[result.severity]}`}>
                {result.severity} issue
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">{result.issue}</p>
            <p className="text-xs text-gray-400">Material: {result.material}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("repair")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
              tab === "repair" ? "tab-active" : "tab-inactive"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
            Repair it
          </button>
          <button
            onClick={() => setTab("style")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
              tab === "style" ? "tab-active" : "tab-inactive"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Restyle it
          </button>
        </div>

        {/* Repair panel */}
        {tab === "repair" && (
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{result.repairOption.title}</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{result.repairOption.summary}</p>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="btn-primary w-full py-2.5 text-sm mb-5 flex items-center justify-center gap-2"
            >
              <span>🛠️</span> Start Guided Step-by-Step
            </button>

            {result.repairOption.materialsNeeded?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">You'll need</p>
                <div className="flex flex-wrap gap-2">
                  {result.repairOption.materialsNeeded.map((m, i) => (
                    <span key={i} className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Step-by-step</p>
            <ol className="space-y-3">
              {result.repairOption.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 bg-brand-50 text-brand-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Style panel */}
        {tab === "style" && (
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{result.styleOption.title}</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{result.styleOption.summary}</p>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Outfit ideas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.styleOption.outfits.map((outfit, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm font-medium text-gray-800 mb-1">{outfit.look}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{outfit.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset button */}
      <button onClick={onReset} className="btn-outline w-full">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Analyze another garment
      </button>

      {isWizardOpen && (
        <RepairWizard
          title={result.repairOption.title}
          summary={result.repairOption.summary}
          steps={result.repairOption.steps}
          materialsNeeded={result.repairOption.materialsNeeded}
          material={result.material}
          onClose={() => setIsWizardOpen(false)}
          onComplete={(water, co2, waste) => {
            setIsWizardOpen(false);
            onComplete(water, co2, waste);
          }}
        />
      )}
    </div>
  );
}
