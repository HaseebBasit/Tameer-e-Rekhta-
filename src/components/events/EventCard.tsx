import React from "react";
import Image from "next/image";
import { MapPin, Clock, ArrowRight, Tag } from "lucide-react";
import { EventItem } from "@/data/events";
import { Button } from "@/components/ui/Button";

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="card-soft rounded-3xl overflow-hidden bg-white border border-gray-100 flex flex-col md:flex-row group transition-all duration-300 hover:shadow-xl">
      {/* Left side: Event Image */}
      <div className="relative w-full md:w-72 lg:w-80 aspect-16/10 md:aspect-auto shrink-0 overflow-hidden bg-gray-100">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-brand-pitch/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
          {event.category}
        </div>
      </div>

      {/* Middle & Right Content */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        {/* Date block */}
        <div className="flex items-center sm:flex-col justify-start sm:justify-center text-center px-4 py-3 bg-brand-mint/60 border border-brand-green/20 rounded-2xl shrink-0 gap-2 sm:gap-0 sm:min-w-[85px]">
          <span className="font-heading font-black text-2xl sm:text-3xl text-brand-dark leading-none">
            {event.day}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-leaf leading-none sm:mt-1">
            {event.month}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2">
          <h3 className="font-heading font-bold text-xl text-brand-pitch group-hover:text-brand-emerald transition-colors">
            {event.title}
          </h3>

          <p className="text-gray-600 text-sm font-medium">
            {event.subtitle}
          </p>

          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              <span>{event.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              <span>{event.time}</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex items-center">
          <Button
            href="/volunteer"
            variant="outline"
            size="sm"
            className="w-full sm:w-auto text-xs font-semibold py-2 px-4"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Participate
          </Button>
        </div>
      </div>
    </div>
  );
};
