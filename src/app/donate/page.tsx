"use client";

import { ShieldCheck, Heart, Lock, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import DonationSection from "@/components/donate/DonationSection";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Transparency",
    description: "Every rupee donated is directly accounted for and directed towards on-ground welfare.",
  },
  {
    icon: Heart,
    title: "Direct Impact",
    description: "Contributions support emergency ration distribution, orphan care, and youth literacy.",
  },
  {
    icon: Lock,
    title: "Verified Transfers",
    description: "Instant screenshot confirmation via WhatsApp and email ensures verified acknowledgments.",
  },
];

export default function DonatePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-dark py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center relative z-10">
            <span className="inline-block text-xs uppercase font-bold tracking-widest text-brand-lime bg-white/10 px-3.5 py-1.5 rounded-full mb-3">
              Support Our Noble Cause
            </span>
            <h1 className="font-heading text-3xl font-extrabold text-brand-cream sm:text-4xl lg:text-5xl">
              Donate &amp; Transform Lives
            </h1>
            <p className="mt-3 text-brand-lime text-sm sm:text-base leading-relaxed">
              Your generosity directly funds urgent food drives, orphanage care, student mentorship, and cultural youth initiatives across Pakistan.
            </p>
          </div>
        </Container>
      </section>

      {/* Trust pillars */}
      <section className="py-12 sm:py-16 bg-white border-b border-gray-100">
        <Container size="wide">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-brand-sand bg-white p-6 text-center shadow-card hover:shadow-lg transition-all"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint text-brand-emerald">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-bold text-brand-dark text-lg">{pillar.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-brand-leaf leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Official Donation Section */}
      <section className="py-14 sm:py-20 bg-brand-cream/60">
        <Container size="wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
              Official Payment Methods
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-brand-pitch mt-1">
              Send Your Contribution
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-2">
              Transfer securely using our official JazzCash or Easypaisa accounts below, then share your payment proof with us.
            </p>
          </div>

          <DonationSection />
        </Container>
      </section>

      {/* Closing quote */}
      <section className="bg-brand-dark py-14">
        <Container size="wide">
          <p className="mx-auto max-w-xl text-center font-heading text-lg sm:text-xl italic text-brand-cream">
            &ldquo;We can&apos;t help everyone, but everyone can help someone.&rdquo;
          </p>
          <p className="text-center text-xs text-brand-lime/80 mt-2">
            Ta&apos;meer-e-Rekhta Welfare Society • Serving Humanity With Compassion
          </p>
        </Container>
      </section>
    </main>
  );
}