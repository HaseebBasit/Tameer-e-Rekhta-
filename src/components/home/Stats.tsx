import React from "react";
import { Calendar, Users, HeartHandshake, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const Stats: React.FC = () => {
  const stats = [
    {
      number: "10+",
      label: "Events",
      sublabel: "Organized & executed",
      icon: Calendar,
    },
    {
      number: "2K+",
      label: "People Reached",
      sublabel: "Through food & youth programs",
      icon: Users,
    },
    {
      number: "15+",
      label: "Volunteers",
      sublabel: "Active youth leaders",
      icon: HeartHandshake,
    },
    {
      number: "3+",
      label: "Cities",
      sublabel: "Karachi, Lahore & Hyderabad",
      icon: MapPin,
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <Container size="wide">
        <div className="relative overflow-hidden rounded-3xl bg-brand-forest text-white p-8 sm:p-12 shadow-xl border border-brand-moss/40">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand-lime/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-brand-lime mb-4 transition-transform duration-300 group-hover:scale-110">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <span className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-none mb-2">
                    {stat.number}
                  </span>

                  <span className="text-base sm:text-lg font-bold text-gray-100">
                    {stat.label}
                  </span>

                  <span className="text-xs text-gray-300 mt-1 hidden sm:block">
                    {stat.sublabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
};
