"use client";
import Image from "next/image";
import { useState } from "react";

export function ImageZoom({ src, alt, fill = false, className = "" }: { src: string; alt: string; fill?: boolean; className?: string }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel((prev) => {
      const newLevel = e.deltaY > 0 ? Math.max(1, prev - 0.2) : Math.min(3, prev + 0.2);
      return parseFloat(newLevel.toFixed(1));
    });
  };

  const handleClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
      setZoomLevel(1);
    } else {
      setIsZoomed(true);
      setZoomLevel(1.5);
    }
  };

  if (isZoomed) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
        onClick={handleClick}
        onWheel={handleWheel}
      >
        <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            style={{ transform: `scale(${zoomLevel})` }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
            🔍 Zoom: {Math.round(zoomLevel * 100)}% | Scroll to zoom | Click to close
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative cursor-zoom-in ${className}`} onClick={handleClick} role="button" tabIndex={0}>
      {fill ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <img src={src} alt={alt} className="w-full h-auto" />
      )}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
        🔍 Click to zoom
      </div>
    </div>
  );
}
