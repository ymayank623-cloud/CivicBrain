import React, { useState, useRef, useCallback } from "react";
import { Sliders, CheckCircle2 } from "lucide-react";

interface ImageComparisonSliderProps {
  beforeImage: string | null | undefined;
  afterImage: string | null | undefined;
  heightClass?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function ImageComparisonSlider({
  beforeImage,
  afterImage,
  heightClass = "h-64 sm:h-72",
  beforeLabel = "Before (Citizen Report)",
  afterLabel = "After (Repaired Proof)"
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  // If one image is missing, render single image fallback
  if (!beforeImage && !afterImage) {
    return (
      <div className={`w-full ${heightClass} rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500`}>
        No photographic evidence attached.
      </div>
    );
  }

  if (!beforeImage || !afterImage) {
    const singleImage = beforeImage || afterImage;
    const singleLabel = beforeImage ? beforeLabel : afterLabel;
    return (
      <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md`}>
        <img src={singleImage!} alt={singleLabel} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700">
          {singleLabel}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-amber-400">
          <Sliders size={13} /> Interactive Repair Verification Slider
        </span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 size={11} /> AI Verified Match
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className={`relative w-full ${heightClass} rounded-2xl overflow-hidden select-none cursor-ew-resize border border-slate-700 shadow-2xl bg-slate-950`}
      >
        {/* AFTER IMAGE (Background / Full view) */}
        <img
          src={afterImage}
          alt="After Repair Proof"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-3 right-3 z-10 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md shadow-md">
          {afterLabel}
        </div>

        {/* BEFORE IMAGE (Clipped / Foreground) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt="Before Citizen Evidence"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
            className="absolute inset-0 h-full max-w-none object-cover"
          />
          <div className="absolute top-3 left-3 z-10 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-amber-950/90 text-amber-400 border border-amber-500/30 backdrop-blur-md shadow-md">
            {beforeLabel}
          </div>
        </div>

        {/* SLIDER DIVIDER LINE */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-black">
            ⇄
          </div>
        </div>

        {/* Helper Drag Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-slate-300 border border-slate-700 pointer-events-none opacity-80">
          Drag slider left / right to compare
        </div>
      </div>
    </div>
  );
}
