import React from "react";
import { Metadata } from "next";
import { Calendar, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { eventsData } from "@/data/events";
import { EventCard } from "@/components/events/EventCard";

export const metadata: Metadata = {
  title: "Flagship Events & Initiatives | Ta'meer-e-Rekhta",
  description:
    "Explore hallmark events and community initiatives hosted by Ta'meer-e-Rekhta: Naqsh-e-Khiyaal Urdu Literary Festival, Food Drives, and Orphanage Care Visits.",
};

export default function EventsPage() {
  return (
    <div className="py-10 sm:py-16 space-y-12">
      <Container size="wide">
        {/* Header Section */}
        <SectionHeading
          title="Flagship Events & Initiatives"
          description="Hallmark literary festivals, community welfare drives, and social outreach campaigns organized by Ta'meer-e-Rekhta."
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
            Become a Volunteer & Join Future Drives
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Want to propose or host a Ta&apos;meer-e-Rekhta drive in your city? Reach out to our community team.
          </p>
        </div>
      </Container>
    </div>
  );
}
