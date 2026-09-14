"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { GalleryItem } from "@/data/gallery";

interface LightboxProps {
  item: GalleryItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const Lightbox: React.FC<LightboxProps> = ({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  // ESC and Arrow key listeners
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [item, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
        aria-label="Close image preview"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Modal Content container */}
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-16/10 sm:aspect-16/9 max-h-[72vh] rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 95vw, 1000px"
            className="object-contain"
            priority
          />
        </div>

        {/* Caption */}
        <div className="mt-4 w-full text-center text-white space-y-1 px-4">
          <h3 className="font-heading font-bold text-lg sm:text-xl text-white">
            {item.title}
          </h3>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-lime" />
              <span>{item.date}</span>
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-lime" />
              <span>{item.location}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
