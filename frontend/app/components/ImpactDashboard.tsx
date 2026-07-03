"use client";

import { useEffect, useState } from "react";

export type Project = {
  id: string;
  timestamp: string;
  garmentType: string;
  issue: string;
  material: string;
  imagePreview: string;
  waterSaved: number;
  co2Saved: number;
  wasteSaved: number;
};

export type DashboardStats = {
  garmentsSaved: number;
  waterSaved: number;
  co2Saved: number;
  wasteSaved: number;
};

type Props = {
  projects: Project[];
  stats: DashboardStats;
};

export default function ImpactDashboard({ projects, stats }: Props) {
  return (
    <div className="space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">
          Your Eco-Impact Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Track the environmental savings of repairing and restyling your wardrobe.
        </p>
      </div>

      {/* Grid of 4 Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Garments Saved */}
        <div className="bg-white rounded-2xl border border-brand-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300 -z-0 opacity-60" />
          <div className="relative z-10 space-y-2">
            <span className="text-2xl">👕</span>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Garments Saved</p>
            <h3 className="text-3xl font-extrabold text-brand-700">{stats.garmentsSaved}</h3>
            <p className="text-[10px] text-brand-600 font-medium">kept in circulation</p>
          </div>
        </div>

        {/* Water Saved */}
        <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300 -z-0 opacity-60" />
          <div className="relative z-10 space-y-2">
            <span className="text-2xl">💧</span>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Water Saved</p>
            <h3 className="text-3xl font-extrabold text-sky-600">{stats.waterSaved.toLocaleString()} L</h3>
            <p className="text-[10px] text-sky-500 font-medium">equivalent tap water</p>
          </div>
        </div>

        {/* CO2 Saved */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300 -z-0 opacity-60" />
          <div className="relative z-10 space-y-2">
            <span className="text-2xl">☁️</span>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">CO₂ Offset</p>
            <h3 className="text-3xl font-extrabold text-emerald-600">{stats.co2Saved.toFixed(1)} kg</h3>
            <p className="text-[10px] text-emerald-500 font-medium">emissions prevented</p>
          </div>
        </div>

        {/* Waste Saved */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300 -z-0 opacity-60" />
          <div className="relative z-10 space-y-2">
            <span className="text-2xl">🗑️</span>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Waste Diverted</p>
            <h3 className="text-3xl font-extrabold text-amber-600">{stats.wasteSaved.toFixed(2)} kg</h3>
            <p className="text-[10px] text-amber-500 font-medium">diverted from landfill</p>
          </div>
        </div>
      </div>

      {/* Completed Projects Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>✨</span> Completed Projects History
        </h3>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-xl animate-bounce">
              🌱
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Your sustainability journey starts here!</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Analyze a garment, follow the step-by-step repair guide, and log your completion to see your eco-savings grow.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {project.imagePreview ? (
                  <img
                    src={project.imagePreview}
                    alt={project.garmentType}
                    className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-brand-550 rounded-lg flex items-center justify-center text-brand-700 flex-shrink-0 font-medium">
                    👕
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-700 truncate">{project.garmentType}</p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(project.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{project.issue}</p>
                  <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center gap-0.5">
                      <span>💧</span> {project.waterSaved}L
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span>☁️</span> {project.co2Saved.toFixed(1)}kg
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span>🗑️</span> {project.wasteSaved.toFixed(2)}kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
