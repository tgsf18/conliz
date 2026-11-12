"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  legenda?: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl, legenda }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative aspect-[16/10] w-full overflow-hidden border border-maison-hairline shadow-lg select-none cursor-ew-resize"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* After Image (Background full) */}
        <Image
          src={afterUrl}
          alt="Obra Depois da Conliz"
          fill
          className="object-cover"
          sizes="100vw"
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeUrl}
            alt="Obra Antes da Reforma"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Button Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-maison-terracotta text-white flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-white pointer-events-none">
            ↔
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-4 bg-maison-charcoal/80 text-white backdrop-blur-sm px-3 py-1 text-[11px] font-sans font-semibold tracking-widest uppercase">
          Antes
        </div>
        <div className="absolute top-4 right-4 bg-maison-terracotta text-white backdrop-blur-sm px-3 py-1 text-[11px] font-sans font-semibold tracking-widest uppercase">
          Depois (Conliz)
        </div>
      </div>

      {legenda && (
        <p className="text-xs font-sans text-maison-muted text-center italic">
          {legenda} (Arraste o cursor horizontalmente para comparar o Antes e Depois)
        </p>
      )}
    </div>
  );
}
