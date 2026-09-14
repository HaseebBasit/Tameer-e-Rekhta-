import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { initiatives } from "@/data/initiatives";

export const RecentActivities: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-white/50 border-y border-gray-100">
      <Container size="wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <SectionHeading
            title="Our Recent Activities"
            description="Moments of impact and ongoing community welfare initiatives across Pakistan."
            align="left"
            className="mb-0"
          />

          <Link
            href="/our-work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-emerald hover:text-brand-leaf transition-colors shrink-0 group"
          >
            <span>View All Initiatives</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {initiatives.map((item) => (
            <div
              key={item.id}
              className="card-soft rounded-2xl overflow-hidden flex flex-col group"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-brand-pitch/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                  {item.categoryLabel}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold font-heading text-brand-pitch mb-1.5 group-hover:text-brand-emerald transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                    <span>{item.location}</span>
                  </span>
                  <span className="font-medium text-brand-leaf">
                    {item.impactMetrics.split(" ")[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
