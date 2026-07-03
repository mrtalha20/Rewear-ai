"use client";

import { useCallback, useRef } from "react";

type Props = {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
  onReset: () => void;
};

export default function UploadZone({ onImageSelect, imagePreview, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onImageSelect(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (imagePreview) {
    return (
      <div className="relative">
        <img
          src={imagePreview}
          alt="Uploaded garment"
          className="w-full max-h-80 object-contain rounded-2xl border border-gray-100 bg-gray-50"
        />
        <button
          onClick={onReset}
          className="absolute top-3 right-3 bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Change
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer
                 hover:border-brand-500 hover:bg-brand-50 transition-all duration-150 group"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-100 transition-colors">
        <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <h2 className="text-base font-medium text-gray-800 mb-1">Drop your garment photo here</h2>
      <p className="text-sm text-gray-400 mb-4">or click to browse from your device</p>

      <div className="flex items-center justify-center gap-4 text-xs text-gray-300">
        <span>JPG</span>
        <span>·</span>
        <span>PNG</span>
        <span>·</span>
        <span>WEBP</span>
        <span>·</span>
        <span>Max 10MB</span>
      </div>
    </div>
  );
}
