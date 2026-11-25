import React from "react";
import { Hero } from "@/components/home/Hero";
import { MissionCards } from "@/components/home/MissionCards";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { RecentActivities } from "@/components/home/RecentActivities";
import { HomeGallery } from "@/components/home/HomeGallery";
import { Stats } from "@/components/home/Stats";
import { TeamSection } from "@/components/team/TeamSection";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0 pb-16">
      <Hero />
      <MissionCards />
      <FeaturedEvents />
      <RecentActivities />
      <HomeGallery />
      <Stats />
      <TeamSection />
    </div>
  );
}
