import React from "react";
import Image from "next/image";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const Hero: React.FC = () => {
  return (
    <section className="py-6 sm:py-8 lg:py-10">
      <Container size="wide">
        <div className="relative overflow-hidden rounded-3xl bg-brand-pitch text-white shadow-2xl border border-white/5">
          {/* Subtle background ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 p-6 sm:p-10 lg:p-16">
            {/* Left Column: Mission Content */}
            <div className="lg:col-span-7 space-y-6 z-10">
              <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl tracking-tight leading-[1.15]">
                Reviving Urdu.
                <br />
                <span className="text-white">Empowering Youth.</span>
                <br />
                <span className="text-brand-lime">Serving Humanity.</span>
              </h1>

              {/* Urdu Visual Subtitle */}
              <div className="pt-1">
                <span className="urdu-text text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-lime">
                  آوازِ نو - رسمِ کہن
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Ta&apos;meer-e-Rekhta is a youth-led organization working for Urdu Revival,
                Youth Leadership, and Welfare of Mankind in Pakistan.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Button
                  href="/volunteer"
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="font-semibold shadow-md"
                >
                  Join the Movement
                </Button>

                <Button
                  href="/our-work"
                  variant="secondary"
                  size="lg"
                  icon={<Compass className="w-4 h-4" />}
                  className="font-medium"
                >
                  Explore Our Work
                </Button>
              </div>
            </div>

            {/* Right Column: Hero Visual matching visual guide */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square lg:aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <Image
                  src="/images/hero_sprout.jpg"
                  alt="Ta'meer-e-Rekhta - Plant seedling sprouting in caring hands"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs text-gray-200">
                  <p className="font-semibold text-white">Nurturing Youth & Culture</p>
                  <p className="text-gray-300 text-[11px]">Empowering communities across Pakistan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
