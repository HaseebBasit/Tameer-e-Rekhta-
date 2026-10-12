import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { eventsData } from "@/data/events";
import { EventCard } from "@/components/events/EventCard";

export const FeaturedEvents: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 bg-brand-light/40 border-b border-gray-100">
      <Container size="wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-brand-forest text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Gatherings & Initiatives</span>
            </div>
            <SectionHeading
              title="Signature Events & Campaigns"
              description="Explore landmark Urdu literary festivals, humanitarian ration drives, and compassion outreach campaigns organized by Ta'meer-e-Rekhta."
              align="left"
              className="mb-0"
            />
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-forest hover:text-brand-emerald transition-colors shrink-0 group self-start md:self-end"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* List of Flagship Events */}
        <div className="max-w-5xl mx-auto space-y-6">
          {eventsData.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </Container>
    </section>
  );
};
