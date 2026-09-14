import React from "react";
import Image from "next/image";
import { MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Initiative } from "@/data/initiatives";

interface WorkCardProps {
  initiative: Initiative;
}

export const WorkCard: React.FC<WorkCardProps> = ({ initiative }) => {
  return (
    <div className="card-soft rounded-3xl overflow-hidden flex flex-col bg-white border border-gray-100 group">
      {/* Image container */}
      <div className="relative aspect-16/10 sm:aspect-16/9 overflow-hidden bg-gray-100">
        <Image
          src={initiative.image}
          alt={initiative.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-brand-pitch/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          {initiative.categoryLabel}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-brand-pitch group-hover:text-brand-emerald transition-colors">
            {initiative.title}
          </h3>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {initiative.description}
          </p>

          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed pt-1">
            {initiative.fullDetails}
          </p>
        </div>

        {/* Card Footer / Metadata */}
        <div className="pt-6 mt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>{initiative.schedule}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>{initiative.location}</span>
          </div>

          <div className="sm:col-span-2 flex items-center gap-1.5 text-brand-dark font-medium pt-1">
            <CheckCircle2 className="w-4 h-4 text-brand-leaf shrink-0" />
            <span>{initiative.impactMetrics}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
