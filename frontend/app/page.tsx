"use client";

import { useState, useEffect } from "react";
import UploadZone from "./components/UploadZone";
import AnalysisResult from "./components/AnalysisResult";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ImpactDashboard, { Project, DashboardStats } from "./components/ImpactDashboard";

export type AnalysisData = {
  garmentType: string;
  condition: string;
  issue: string;
  severity: "minor" | "moderate" | "major";
  material: string;
  repairOption: {
    title: string;
    summary: string;
    steps: string[];
    materialsNeeded: string[];
  };
  styleOption: {
    title: string;
    summary: string;
    outfits: { look: string; description: string }[];
  };
  sustainabilityTip: string;
};

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    garmentsSaved: 0,
    waterSaved: 0,
    co2Saved: 0,
    wasteSaved: 0,
  });

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("rewear_projects");
      const storedStats = localStorage.getItem("rewear_stats");
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  const handleCompleteProject = (water: number, co2: number, waste: number) => {
    if (!result) return;
    const newProject: Project = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      garmentType: result.garmentType,
      issue: result.issue,
      material: result.material,
      imagePreview: imagePreview || "",
      waterSaved: water,
      co2Saved: co2,
      wasteSaved: waste,
    };

    const updatedProjects = [newProject, ...projects];
    const updatedStats = {
      garmentsSaved: stats.garmentsSaved + 1,
      waterSaved: stats.waterSaved + water,
      co2Saved: stats.co2Saved + co2,
      wasteSaved: stats.wasteSaved + waste,
    };

    setProjects(updatedProjects);
    setStats(updatedStats);

    localStorage.setItem("rewear_projects", JSON.stringify(updatedProjects));
    localStorage.setItem("rewear_stats", JSON.stringify(updatedStats));

    handleReset();
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Analysis failed. Please try again.");
      }

      const data: AnalysisData = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {!result ? (
          <div className="space-y-6">
            <ImpactDashboard projects={projects} stats={stats} />

            <UploadZone
              onImageSelect={handleImageSelect}
              imagePreview={imagePreview}
              onReset={handleReset}
            />

            {imagePreview && (
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-primary w-full text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing garment…
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a5 5 0 01-1.49 1.198l-.437.207a1 1 0 01-.956-.025L12 18.5l-.44.255a1 1 0 01-.957.025l-.437-.207a5 5 0 01-1.49-1.198l-.347-.347z" />
                    </svg>
                    Analyze this garment
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex gap-2 items-start">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <AnalysisResult
            result={result}
            imagePreview={imagePreview!}
            onReset={handleReset}
            onComplete={handleCompleteProject}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
