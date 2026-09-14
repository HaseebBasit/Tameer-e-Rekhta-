"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Target,
  Lock,
  Copy,
  Check,
  Building2,
  Phone,
  Info,
  Heart,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";

export default function DonatePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const pillars = [
    {
      title: "100% Transparency",
      description: "We use every donation responsibly with full financial accountability.",
      icon: ShieldCheck,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Direct Impact",
      description: "Your support reaches directly to those in need on the ground.",
      icon: Target,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Secure Donations",
      description: "Your information is safe and verified through trusted bank channels.",
      icon: Lock,
      color: "text-teal-700 bg-teal-50 border-teal-200",
    },
  ];

  return (
    <div className="py-10 sm:py-16 space-y-14 sm:space-y-18">
      <Container size="wide">
        {/* Header Section matching visual guide */}
        <SectionHeading
          title="Support Our Mission"
          description="Your small contribution can bring a big change in someone's life."
          align="center"
        />

        {/* Three Pillars matching visual guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {pillars.map((p) => {
            const IconComponent = p.icon;
            return (
              <div
                key={p.title}
                className="card-soft rounded-2xl p-6 text-center flex flex-col items-center border border-gray-100"
              >
                <div
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${p.color}`}
                >
                  <IconComponent className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-lg text-brand-pitch mb-1">
                  {p.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* MAKE A DONATION Container matching visual guide */}
        <div className="max-w-3xl mx-auto card-soft rounded-3xl p-6 sm:p-10 bg-white border border-gray-100 shadow-xl space-y-8">
          <div className="text-center space-y-1">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
              Make a Donation
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Easypaisa / JazzCash / Bank Transfer
            </p>
          </div>

          {/* Quick Mobile Wallet Badges matching visual guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Easypaisa */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    EP
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-brand-dark text-base">
                      Easypaisa
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Title: {siteConfig.donation.easypaisa.title}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-800">
                  Instant
                </span>
              </div>

              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-emerald-200 text-sm font-mono font-bold text-emerald-900">
                <span>{siteConfig.donation.easypaisa.number}</span>
                <button
                  onClick={() =>
                    copyToClipboard(siteConfig.donation.easypaisa.number, "ep")
                  }
                  className="p-1 rounded text-emerald-700 hover:bg-emerald-50 transition-colors"
                  aria-label="Copy Easypaisa number"
                >
                  {copiedKey === "ep" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* JazzCash */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                    JC
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-brand-dark text-base">
                      JazzCash
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Title: {siteConfig.donation.jazzcash.title}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200/60 text-amber-800">
                  Instant
                </span>
              </div>

              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 text-sm font-mono font-bold text-amber-950">
                <span>{siteConfig.donation.jazzcash.number}</span>
                <button
                  onClick={() =>
                    copyToClipboard(siteConfig.donation.jazzcash.number, "jc")
                  }
                  className="p-1 rounded text-amber-800 hover:bg-amber-50 transition-colors"
                  aria-label="Copy JazzCash number"
                >
                  {copiedKey === "jc" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bank Transfer Details Card */}
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            <div className="flex items-center gap-2.5 text-brand-pitch">
              <Building2 className="w-5 h-5 text-brand-emerald" />
              <h3 className="font-heading font-bold text-base">
                Direct Bank Transfer Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">
                  Bank Name
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {siteConfig.donation.bank.name}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">
                  Account Title
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {siteConfig.donation.bank.accountTitle}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">
                  Account Number
                </span>
                <div className="flex items-center gap-2 font-mono font-bold text-gray-900 text-sm mt-0.5">
                  <span>{siteConfig.donation.bank.accountNumber}</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        siteConfig.donation.bank.accountNumber,
                        "acc"
                      )
                    }
                    className="p-1 rounded hover:bg-gray-200"
                    aria-label="Copy account number"
                  >
                    {copiedKey === "acc" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block uppercase font-semibold text-[10px]">
                  IBAN Number
                </span>
                <div className="flex items-center gap-2 font-mono font-bold text-gray-900 text-xs mt-0.5">
                  <span className="break-all">
                    {siteConfig.donation.bank.iban}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(siteConfig.donation.bank.iban, "iban")
                    }
                    className="p-1 rounded hover:bg-gray-200 shrink-0"
                    aria-label="Copy IBAN"
                  >
                    {copiedKey === "iban" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Disclosure matching prompt requirements */}
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Donation Confirmation & Transparency</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                After making a transfer via Easypaisa, JazzCash or Bank, please share your payment receipt via WhatsApp to{" "}
                <strong>{siteConfig.contact.phone}</strong> or email{" "}
                <strong>{siteConfig.contact.email}</strong> to receive an official electronic acknowledgement. Automated card gateway processing is currently in queue.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Quote Banner matching visual guide */}
      <section className="bg-brand-pitch text-white py-12 border-y border-white/5">
        <Container size="wide">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg sm:text-xl lg:text-2xl font-light italic text-gray-200">
              &ldquo;We can&apos;t help everyone, but everyone can help someone.&rdquo;
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
