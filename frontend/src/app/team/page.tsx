import React from "react";
import { Metadata } from "next";
import { Leaf } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TeamSection } from "@/components/team/TeamSection";

export const metadata: Metadata = {
  title: "Our Team | Ta'meer-e-Rekhta",
  description:
    "Meet the passionate youth leadership and organizers driving Ta'meer-e-Rekhta's cultural and humanitarian mission across Pakistan.",
};

export default function TeamPage() {
  return (
    <div className="space-y-12">
      {/* Team Hierarchy Section */}
      <TeamSection isStandalone={true} />

      {/* Shared Mission Quote Section */}
      <section className="bg-brand-pitch text-white py-16 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="wide">
          <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 mx-auto flex items-center justify-center text-brand-lime">
              <Leaf className="w-6 h-6" />
            </div>

            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              A strong team with a shared vision
              <br />
              <span className="text-brand-lime">can change the world.</span>
            </h3>

            <p className="text-gray-300 text-xs sm:text-sm max-w-lg mx-auto">
              United in purpose to empower youth, preserve the timeless beauty of Urdu, and alleviate suffering in our communities.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
