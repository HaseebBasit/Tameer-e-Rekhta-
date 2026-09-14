import React from "react";
import { Metadata } from "next";
import { HandHeart, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { initiatives } from "@/data/initiatives";
import { WorkCard } from "@/components/work/WorkCard";

export const metadata: Metadata = {
  title: "Our Work & Initiatives | Ta'meer-e-Rekhta",
  description:
    "Explore Ta'meer-e-Rekhta's core initiatives including Food Drives, Orphanage Care, Youth Leadership Workshops, and Community Welfare across Pakistan.",
};

export default function OurWorkPage() {
  return (
    <div className="py-10 sm:py-16 space-y-12 sm:space-y-16">
      <Container size="wide">
        {/* Header Section */}
        <SectionHeading
          title="Our Work"
          description="We focus on multiple areas to create a positive impact in the society."
          align="center"
        />

        {/* Initiatives 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {initiatives.map((item) => (
            <WorkCard key={item.id} initiative={item} />
          ))}
        </div>

        {/* Centered CTA Section matching visual guide */}
        <div className="pt-10 flex flex-col items-center text-center space-y-4">
          <Button
            href="/volunteer"
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            className="font-bold text-base px-8 py-3.5 shadow-lg shadow-brand-emerald/20"
          >
            Join Us in Our Mission
          </Button>
          <p className="text-xs text-gray-500 max-w-sm">
            Become a part of our volunteer network and help bring hope and education to those who need it most.
          </p>
        </div>
      </Container>
    </div>
  );
}
