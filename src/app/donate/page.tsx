"use client";

import { useState } from "react";
import { ShieldCheck, Heart, Lock, Copy, Check, Landmark, Smartphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import DonationSection from "@/components/donate/DonationSection";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Transparency",
    description: "Every rupee donated is tracked and reported back to our community.",
  },
  {
    icon: Heart,
    title: "Direct Impact",
    description: "Funds go straight to food drives, orphanage care, and youth programs.",
  },
  {
    icon: Lock,
    title: "Secure Donations",
    description: "Manual verification and receipts keep every transfer accountable.",
  },
];

const MANUAL_ACCOUNTS = [
  {
    id: "easypaisa",
    icon: Smartphone,
    label: "EasyPaisa",
    accountTitle: "Ta'meer-e-Rekhta",
    accountNumber: "0312-3456789",
  },
  {
    id: "jazzcash",
    icon: Smartphone,
    label: "JazzCash",
    accountTitle: "Ta'meer-e-Rekhta",
    accountNumber: "0312-3456789",
  },
  {
    id: "bank",
    icon: Landmark,
    label: "Bank Transfer",
    accountTitle: "Meezan Bank Ltd",
    accountNumber: "0102-0105829103",
  },
];

function CopyableAccountCard({
  icon: Icon,
  label,
  accountTitle,
  accountNumber,
}: {
  icon: typeof Smartphone;
  label: string;
  accountTitle: string;
  accountNumber: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }

  return (
    <div className="rounded-2xl border border-brand-sand bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-brand-emerald">
        <Icon className="h-5 w-5" />
        <span className="font-heading font-semibold text-brand-dark">{label}</span>
      </div>
      <div className="text-xs text-brand-leaf">Account Title</div>
      <div className="mb-3 text-sm font-medium text-brand-dark">{accountTitle}</div>
      <div className="text-xs text-brand-leaf">Account Number</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-brand-dark">{accountNumber}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-emerald px-3 py-1.5 text-xs font-semibold text-brand-emerald transition hover:bg-brand-mint"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-dark py-16 sm:py-20">
        <Container size="wide">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-3xl font-bold text-brand-cream sm:text-4xl">
              Support Our Mission
            </h1>
            <p className="mt-3 text-brand-lime">
              Your generosity powers food drives, orphanage care, and youth leadership programs
              across Pakistan.
            </p>
          </div>
        </Container>
      </section>

      {/* Trust pillars */}
      <section className="py-12 sm:py-16">
        <Container size="wide">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TRUST_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-brand-sand bg-white p-6 text-center shadow-card"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-mint text-brand-emerald">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading font-semibold text-brand-dark">{pillar.title}</h3>
                  <p className="mt-1 text-sm text-brand-leaf">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Interactive test donation flow */}
      <section className="pb-12 sm:pb-16">
        <Container size="wide">
          <h2 className="mb-6 text-center font-heading text-2xl font-bold text-brand-dark">
            Make a Donation
          </h2>
          <DonationSection />
        </Container>
      </section>

      {/* Manual payment details */}
      <section className="border-t border-brand-sand bg-brand-sand/40 py-12 sm:py-16">
        <Container size="wide">
          <h2 className="mb-2 text-center font-heading text-2xl font-bold text-brand-dark">
            Prefer to Transfer Manually?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-center text-sm text-brand-leaf">
            Send your donation directly using any of the details below, then share your payment
            screenshot with us via WhatsApp or email for a verified receipt.
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {MANUAL_ACCOUNTS.map((account) => (
              <CopyableAccountCard key={account.id} {...account} />
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-xl rounded-xl bg-white p-5 text-center text-sm text-brand-leaf shadow-card">
            Share your screenshot on WhatsApp at <strong className="text-brand-dark">0312-3456789</strong>{" "}
            or email <strong className="text-brand-dark">tameerekhta@gmail.com</strong> to receive your
            verified donation receipt.
          </div>
        </Container>
      </section>

      {/* Closing quote */}
      <section className="bg-brand-dark py-14">
        <Container size="wide">
          <p className="mx-auto max-w-xl text-center font-heading text-xl italic text-brand-cream">
            &ldquo;We can&apos;t help everyone, but everyone can help someone.&rdquo;
          </p>
        </Container>
      </section>
    </main>
  );
}