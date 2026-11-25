import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";

export const metadata: Metadata = {
  title: "Photo Gallery | Ta'meer-e-Rekhta",
  description:
    "Explore photo highlights from Ta'meer-e-Rekhta food drives, orphanage visits, Urdu poetry sessions, and youth workshops.",
};

export default function GalleryPage() {
  return (
    <div className="py-10 sm:py-16 space-y-10">
      <Container size="wide">
        {/* Header Section matching visual guide */}
        <SectionHeading
          title="Photo Gallery"
          description="Moments from our activities and events."
          align="center"
        />

        {/* Gallery Grid with Filters */}
        <GalleryGrid />
      </Container>
    </div>
  );
}
