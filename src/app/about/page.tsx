import React from "react";
import Image from "next/image";
import { Metadata } from "next";
import {
  ShieldCheck,
  Heart,
  Handshake,
  Users,
  Award,
  Eye,
  Leaf,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About Us | Ta'meer-e-Rekhta",
  description:
    "Learn about Ta'meer-e-Rekhta, our vision, values, and dedication to Urdu Revival, Youth Leadership, and Humanitarian Welfare in Pakistan.",
};

export default function AboutPage() {
  const values = [
    {
      title: "Integrity",
      description: "Honesty and transparency in every initiative and rupee spent.",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Compassion",
      description: "Serving the vulnerable with deep empathy and dignity.",
      icon: Heart,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    },
    {
      title: "Respect",
      description: "Honoring our cultural traditions, elders, and youth perspectives.",
      icon: Handshake,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      title: "Teamwork",
      description: "Collaborating as a unified family of youth changemakers.",
      icon: Users,
      color: "text-teal-700 bg-teal-50 border-teal-200",
    },
    {
      title: "Dedication",
      description: "Relentless commitment to building an educated, empathetic society.",
      icon: Award,
      color: "text-green-700 bg-green-50 border-green-200",
    },
  ];

  return (
    <div className="py-10 sm:py-16 space-y-16 sm:space-y-20">
      {/* 1. Intro Section */}
      <Container size="wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-14">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-mint text-brand-dark text-xs font-semibold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Who We Are</span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-brand-pitch tracking-tight">
              About Ta&apos;meer-e-Rekhta
            </h1>

            <div className="urdu-text text-2xl text-brand-green font-bold">
              تعمیرِ ریختہ - ایک تحریک
            </div>

            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              Ta&apos;meer-e-Rekhta is an organization for Urdu Revival, Youth Leadership Events &amp;
              Welfare of Mankind in Pakistan.
            </p>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              We believe in preserving our cultural identity, empowering the youth, and serving
              humanity selflessly. Founded by passionate young leaders, we bridge literary
              renaissance with ground-level social responsibility.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border-l-2 border-brand-emerald pl-4">
                <span className="font-heading font-bold text-lg text-brand-pitch block">
                  Cultural Roots
                </span>
                <span className="text-xs text-gray-500">
                  Reviving Urdu literature &amp; arts
                </span>
              </div>
              <div className="border-l-2 border-brand-leaf pl-4">
                <span className="font-heading font-bold text-lg text-brand-pitch block">
                  Youth Power
                </span>
                <span className="text-xs text-gray-500">
                  Grassroots humanitarian action
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <Image
                src="/images/hero_sprout.jpg"
                alt="Plant seedling in hands representing youth development"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Container>

      {/* 2. Our Vision Section (Dark Immersive Banner) */}
      <section className="bg-brand-pitch text-white py-16 sm:py-20 relative overflow-hidden border-y border-white/5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="wide">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 mx-auto flex items-center justify-center text-brand-lime shadow-lg">
              <Eye className="w-8 h-8" />
            </div>

            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Our Vision
            </h2>

            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 font-light italic leading-relaxed">
              &ldquo;A society that values its language, empowers its youth and serves humanity with
              compassion.&rdquo;
            </p>

            <div className="urdu-text text-xl sm:text-2xl text-brand-lime pt-2">
              ایک روشن اور ہمدرد معاشرہ جہاں زبان و نوجوان معتبر ہوں
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Our Values Section */}
      <Container size="wide">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-brand-pitch mb-3">
            Our Values
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            The foundational ethical principles that guide our volunteers in every project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {values.map((v) => {
            const IconComponent = v.icon;
            return (
              <div
                key={v.title}
                className="card-soft rounded-2xl p-6 flex flex-col items-center text-center group border border-gray-100"
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${v.color}`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>

                <h3 className="font-heading font-bold text-lg text-brand-pitch mb-2">
                  {v.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* 4. Bottom Statement Banner */}
      <Container size="wide">
        <div className="relative rounded-3xl bg-brand-sand/60 border border-brand-green/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <div className="flex items-center justify-center md:justify-start gap-2 text-brand-emerald text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Our Pledge</span>
            </div>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
              We work for a better tomorrow,
              <br />
              <span className="text-brand-green">with the strength of today&apos;s youth.</span>
            </h3>
          </div>

          <div className="shrink-0 z-10">
            <div className="w-20 h-20 rounded-full bg-brand-mint border border-brand-green/30 flex items-center justify-center text-brand-emerald">
              <Leaf className="w-10 h-10" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
