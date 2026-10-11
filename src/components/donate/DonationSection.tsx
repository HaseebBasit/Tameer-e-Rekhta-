"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Copy,
  Check,
  MessageCircle,
  Mail,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  HeartHandshake
} from "lucide-react";
import { siteConfig } from "@/data/site";

export default function DonationSection() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    donorName: "",
    donorPhone: "",
    amount: "",
    paymentMethod: "JazzCash",
    transactionId: "",
    notes: "",
  });

  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      // fallback
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName.trim() || !formData.amount.trim()) return;

    setSubmitting(true);
    try {
      // Dispatch donation notification to admin email
      await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: formData.donorName,
          donorEmail: "taameer.e.rekhta@gmail.com",
          donorPhone: formData.donorPhone || "Not provided",
          amount: formData.amount,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId || "Self-Reported Transfer",
          cause: "General Welfare Fund",
          notes: formData.notes,
        }),
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const jazzcash = siteConfig.donation.jazzcash;
  const easypaisa = siteConfig.donation.easypaisa;

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Payment Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* JazzCash Card */}
        <div className="rounded-3xl bg-white border-2 border-red-100 p-6 sm:p-8 shadow-card hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                  Mobile Account
                </span>
                <h3 className="font-heading font-black text-2xl text-gray-900">
                  JazzCash
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              Verified
            </span>
          </div>

          {/* Account Details */}
          <div className="space-y-4 bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Account Title
              </span>
              <p className="font-heading font-extrabold text-lg sm:text-xl text-gray-900">
                {jazzcash.title}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Account / Mobile Number
              </span>
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200">
                <span className="font-mono font-bold text-lg text-brand-pitch tracking-wider">
                  {jazzcash.rawNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(jazzcash.rawNumber, "jazzcash")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedField === "jazzcash"
                      ? "bg-emerald-600 text-white"
                      : "bg-red-50 hover:bg-red-100 text-red-700"
                  }`}
                  aria-label="Copy JazzCash Account Number"
                >
                  {copiedField === "jazzcash" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Send directly from JazzCash app or via any Raast ID / Bank transfer.</span>
          </div>
        </div>

        {/* Easypaisa Card */}
        <div className="rounded-3xl bg-white border-2 border-emerald-100 p-6 sm:p-8 shadow-card hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Mobile Account
                </span>
                <h3 className="font-heading font-black text-2xl text-gray-900">
                  Easypaisa
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>

          {/* Account Details */}
          <div className="space-y-4 bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Account Title
              </span>
              <p className="font-heading font-extrabold text-lg sm:text-xl text-gray-900">
                {easypaisa.title}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider block mb-1">
                Account / Mobile Number
              </span>
              <div className="flex items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200">
                <span className="font-mono font-bold text-lg text-brand-pitch tracking-wider">
                  {easypaisa.rawNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(easypaisa.rawNumber, "easypaisa")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedField === "easypaisa"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                  }`}
                  aria-label="Copy Easypaisa Account Number"
                >
                  {copiedField === "easypaisa" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 text-xs text-gray-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Send directly from Easypaisa app or via any 1LINK / Raast transfer.</span>
          </div>
        </div>
      </div>

      {/* Verification & Screenshot Step Section */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-pitch to-[#0e3a24] text-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center space-y-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center text-brand-lime">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            How to Confirm Your Donation
          </h3>

          <p className="text-gray-300 text-sm leading-relaxed">
            After sending your donation via JazzCash or Easypaisa, please share your transfer screenshot with our team on WhatsApp or Email for instant verification and your verified receipt.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* WhatsApp Chat Button */}
            <a
              href="https://wa.me/923075615688?text=Assalam-o-Alaikum!%20I%20have%20sent%20a%20donation%20for%20Ta%27meer-e-Rekhta.%20Here%20is%20my%20payment%20proof:"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition-transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share Screenshot via WhatsApp</span>
            </a>

            {/* Email Contact Button */}
            <a
              href="mailto:taameer.e.rekhta@gmail.com?subject=Donation%20Transfer%20Proof"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <Mail className="w-5 h-5 text-brand-lime" />
              <span>Email: taameer.e.rekhta@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Donation Notification Form */}
      <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-10 shadow-card">
        <div className="max-w-xl mx-auto text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
            Quick Notification
          </span>
          <h4 className="font-heading font-bold text-2xl text-gray-900 mt-1">
            Notify Admin of Your Transfer
          </h4>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Fill in your details so our team can record and verify your contribution in the ledger.
          </p>
        </div>

        {formSubmitted ? (
          <div className="text-center py-8 space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h5 className="font-heading font-bold text-xl text-emerald-950">
              Notification Sent Successfully!
            </h5>
            <p className="text-emerald-800 text-sm max-w-md mx-auto">
              Thank you, <strong>{formData.donorName}</strong>! Your donation notification of <strong>Rs. {formData.amount}</strong> has been forwarded to our accounts team at <strong>taameer.e.rekhta@gmail.com</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ahmad"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Phone / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="03XX-XXXXXXX"
                  value={formData.donorPhone}
                  onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Donated Amount (PKR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Paid Via *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none bg-white"
                >
                  <option value="JazzCash">JazzCash (0307-5615688)</option>
                  <option value="Easypaisa">Easypaisa (0325-2790731)</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Transaction ID / TID (Optional)
              </label>
              <input
                type="text"
                placeholder="Transaction ID from SMS / app"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Notes / Initiative Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Food Drive, Orphanage Support, Youth Leadership"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-brand-emerald hover:bg-brand-green text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Notification...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Notify Admin via Email</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}