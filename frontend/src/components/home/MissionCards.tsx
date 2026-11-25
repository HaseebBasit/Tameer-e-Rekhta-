import React from "react";
import { BookOpen, GraduationCap, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const MissionCards: React.FC = () => {
  const pillars = [
    {
      title: "Revive Urdu",
      urduTitle: "احیاءِ اردو",
      description: "Promoting the beauty of Urdu language and literature.",
      icon: BookOpen,
      iconColor: "text-brand-emerald bg-brand-mint",
    },
    {
      title: "Empower Youth",
      urduTitle: "تعمیرِ نوجوان",
      description: "Creating meaningful opportunities for young people.",
      icon: GraduationCap,
      iconColor: "text-emerald-700 bg-emerald-100",
    },
    {
      title: "Serve Humanity",
      urduTitle: "خدمتِ خلق",
      description: "Working for the welfare and betterment of communities.",
      icon: HeartHandshake,
      iconColor: "text-teal-700 bg-teal-100",
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <Container size="wide">
        <SectionHeading
          title="Our Mission in Action"
          description="Guided by compassion, cultural pride, and youth empowerment to build a brighter Pakistan."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="card-soft rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${pillar.iconColor}`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                <h3 className="text-xl font-bold font-heading text-brand-pitch mb-1">
                  {pillar.title}
                </h3>

                <span className="urdu-text text-brand-green text-sm font-semibold mb-3">
                  {pillar.urduTitle}
                </span>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
