import React from "react";
import { Hero } from "@/components/home/Hero";
import { MissionCards } from "@/components/home/MissionCards";
import { RecentActivities } from "@/components/home/RecentActivities";
import { Stats } from "@/components/home/Stats";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-0 pb-16">
      <Hero />
      <MissionCards />
      <RecentActivities />
      <Stats />
    </div>
  );
}
