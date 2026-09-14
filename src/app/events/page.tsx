import React from "react";
import { Metadata } from "next";
import { Calendar, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { eventsData } from "@/data/events";
import { EventCard } from "@/components/events/EventCard";

export const metadata: Metadata = {
  title: "Upcoming Events | Ta'meer-e-Rekhta",
  description:
    "Discover and participate in upcoming Ta'meer-e-Rekhta events: Food Drives, Urdu Literature Sessions, Orphanage Care, and Youth Workshops.",
};

export default function EventsPage() {
  return (
    <div className="py-10 sm:py-16 space-y-12">
      <Container size="wide">
        {/* Header Section */}
        <SectionHeading
          title="Upcoming Events"
          description="Join our upcoming events and be a part of the change."
          align="center"
        />

        {/* Events Timeline / List matching visual guide */}
        <div className="max-w-4xl mx-auto space-y-6">
          {eventsData.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>

        {/* Bottom Action Button matching visual guide */}
        <div className="pt-8 flex flex-col items-center justify-center">
          <Button
            href="/volunteer"
            variant="primary"
            size="lg"
            className="font-bold text-sm px-8 py-3 bg-brand-forest hover:bg-brand-emerald text-white shadow-md"
            icon={<Sparkles className="w-4 h-4" />}
          >
            View All Events & Join
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Want to propose or host an event in your city? Reach out to our events team.
          </p>
        </div>
      </Container>
    </div>
  );
}
