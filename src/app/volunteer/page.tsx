import React from "react";
import Image from "next/image";
import { Metadata } from "next";
import { Check, ClipboardList, PhoneCall, HeartHandshake, ArrowDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { VolunteerForm } from "@/components/volunteer/VolunteerForm";

export const metadata: Metadata = {
  title: "Become a Volunteer | Ta'meer-e-Rekhta",
  description:
    "Join Ta'meer-e-Rekhta as a youth volunteer. Gain leadership experience, serve underprivileged communities, and help revitalize Urdu culture in Pakistan.",
};

export default function VolunteerPage() {
  const benefits = [
    "Make a real impact",
    "Gain experience",
    "Build leadership skills",
    "Be a part of a positive change",
  ];

  const steps = [
    {
      number: "1",
      title: "Fill the form",
      description: "Complete the simple application form below with your basic information and skills.",
      icon: ClipboardList,
    },
    {
      number: "2",
      title: "Our team will contact you",
      description: "Our volunteer coordinator will review your profile and connect via WhatsApp/Call.",
      icon: PhoneCall,
    },
    {
      number: "3",
      title: "Be a part of our mission",
      description: "Participate in upcoming food drives, literature sessions, and youth workshops!",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="py-10 sm:py-16 space-y-16 sm:space-y-20">
      {/* 1. Hero Split Section matching visual guide */}
      <Container size="wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-14">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-brand-pitch tracking-tight">
              Become a Volunteer
            </h1>

            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Join hands with us and be the reason for someone&apos;s smile.
            </p>

            <ul className="space-y-3 pt-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm sm:text-base text-gray-700 font-medium">
                  <div className="w-5 h-5 rounded-full bg-brand-mint text-brand-emerald flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <Button
                href="#volunteer-form"
                variant="primary"
                size="lg"
                icon={<ArrowDown className="w-4 h-4" />}
                className="font-bold text-sm px-7 py-3.5 shadow-md shadow-brand-emerald/20"
              >
                Fill the Form
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="/images/volunteers.jpg"
                alt="Ta'meer-e-Rekhta youth volunteers standing together"
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Container>

      {/* 2. How to Join? Steps matching visual guide */}
      <Container size="wide">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
            How to Join?
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            A simple 3-step process to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.title}
                className="card-soft rounded-2xl p-6 sm:p-7 text-center flex flex-col items-center group relative border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-mint text-brand-emerald flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <IconComponent className="w-7 h-7" />
                </div>

                <div className="text-xs font-black text-brand-lime uppercase tracking-widest mb-1">
                  Step {step.number}
                </div>

                <h3 className="font-heading font-bold text-lg text-brand-pitch mb-2">
                  {step.title}
                </h3>

                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>

      {/* 3. Volunteer Application Form */}
      <Container size="wide">
        <VolunteerForm />
      </Container>

      {/* 4. Bottom Quote Banner matching visual guide */}
      <section className="bg-brand-pitch text-white py-12 border-y border-white/5">
        <Container size="wide">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl lg:text-2xl font-light italic text-gray-200">
              &ldquo;Alone we can do so little; together we can do so much.&rdquo;
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
