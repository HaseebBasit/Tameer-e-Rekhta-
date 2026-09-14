"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ZoomIn, MapPin } from "lucide-react";
import { galleryItems, galleryCategories, GalleryItem } from "@/data/gallery";
import { Lightbox } from "./Lightbox";

export const GalleryGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const filteredItems =
    selectedCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  const currentItem =
    activePhotoIndex !== null ? filteredItems[activePhotoIndex] : null;

  const handlePrev = () => {
    if (activePhotoIndex !== null && activePhotoIndex > 0) {
      setActivePhotoIndex(activePhotoIndex - 1);
    }
  };

  const handleNext = () => {
    if (activePhotoIndex !== null && activePhotoIndex < filteredItems.length - 1) {
      setActivePhotoIndex(activePhotoIndex + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs matching visual guide */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        {galleryCategories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActivePhotoIndex(null);
              }}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-brand-emerald text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-brand-pitch border border-gray-200"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Grid matching visual guide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setActivePhotoIndex(index)}
            className="card-soft rounded-2xl overflow-hidden cursor-pointer group relative aspect-4/3 sm:aspect-square bg-gray-100"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Hover overlay with zoom icon and title */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-pitch/80 via-brand-pitch/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ZoomIn className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-brand-lime uppercase tracking-wider">
                {item.categoryLabel}
              </span>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white mt-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-brand-lime" />
                <span>{item.location} • {item.date}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        item={currentItem}
        onClose={() => setActivePhotoIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={activePhotoIndex !== null && activePhotoIndex > 0}
        hasNext={
          activePhotoIndex !== null &&
          activePhotoIndex < filteredItems.length - 1
        }
      />
    </div>
  );
};
