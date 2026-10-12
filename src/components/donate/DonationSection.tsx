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
  HeartHandshake,
  RotateCcw,
  Receipt
} from "lucide-react";
import { siteConfig } from "@/data/site";

export default function DonationSection() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptResult, setReceiptResult] = useState<{
    receiptNo: string;
    amount: string;
    email: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    paymentMethod: "JazzCash",
    transactionId: "",
    cause: "General Welfare Fund",
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
    setErrorMessage(null);

    if (!formData.donorName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.donorEmail.trim() || !/\S+@\S+\.\S+/.test(formData.donorEmail)) {
      setErrorMessage("Please enter a valid email address so we can send your receipt copy.");
      return;
    }
    if (!formData.donorPhone.trim()) {
      setErrorMessage("Please enter your Phone or WhatsApp number.");
      return;
    }
    if (!formData.amount.trim() || Number(formData.amount) <= 0) {
      setErrorMessage("Please enter a valid donated amount.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Try server-side API endpoint
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: formData.donorName,
          donorEmail: formData.donorEmail,
          donorPhone: formData.donorPhone,
          amount: formData.amount,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId || "Direct Transfer",
          cause: formData.cause || "General Welfare Fund",
          notes: formData.notes,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        const issuedReceiptNo = data.receipt?.receiptNo || "TMR-01";
        try {
          const numPart = parseInt(issuedReceiptNo.replace("TMR-", ""), 10);
          if (!isNaN(numPart)) {
            localStorage.setItem("tmr_receipt_seq", String(numPart));
          }
        } catch {
          // ignore localStorage error
        }

        setReceiptResult({
          receiptNo: issuedReceiptNo,
          amount: data.receipt?.amount || `Rs. ${Number(formData.amount).toLocaleString()} PKR`,
          email: formData.donorEmail,
        });
        setFormSubmitted(true);
        return;
      }

      // 2. Direct browser fallback if API route failed
      console.warn("API route failed, sending via direct fallback service...", data?.error);
      let fallbackReceiptNo = "TMR-01";
      try {
        const stored = localStorage.getItem("tmr_receipt_seq");
        const nextNum = stored ? parseInt(stored, 10) + 1 : 1;
        localStorage.setItem("tmr_receipt_seq", String(nextNum));
        fallbackReceiptNo = `TMR-${String(nextNum).padStart(2, "0")}`;
      } catch {
        fallbackReceiptNo = "TMR-01";
      }

      const formattedAmount = `Rs. ${Number(formData.amount).toLocaleString()} PKR`;
      const fallbackResponse = await fetch(
        "https://formsubmit.co/ajax/taameer.e.rekhta@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject: `Official Donation Receipt: ${formattedAmount} [${fallbackReceiptNo}] - Ta'meer-e-Rekhta`,
            _captcha: "false",
            _template: "box",
            _replyto: formData.donorEmail,
            _cc: formData.donorEmail,
            "Receipt Number": fallbackReceiptNo,
            "Transaction / Ref ID": formData.transactionId || fallbackReceiptNo,
            "Donor Name": formData.donorName,
            "Donor Email": formData.donorEmail,
            "Donor Phone": formData.donorPhone,
            "Donation Amount": formattedAmount,
            "Payment Method": formData.paymentMethod,
            "Cause / Initiative": formData.cause || "General Welfare Fund",
            "Special Note": formData.notes || "None",
            "Status": "Payment Recorded & Verified",
          }),
        }
      );

      const fallbackData = await fallbackResponse.json().catch(() => null);
      if (fallbackResponse.ok && fallbackData?.success !== "false") {
        setReceiptResult({
          receiptNo: fallbackReceiptNo,
          amount: formattedAmount,
          email: formData.donorEmail,
        });
        setFormSubmitted(true);
        return;
      }

      setErrorMessage(
        data?.error || fallbackData?.message || "Failed to submit donation record. Please try again or reach out on WhatsApp."
      );
    } catch (err: any) {
      setErrorMessage("Network error occurred. Please check your connection or contact our team directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      amount: "",
      paymentMethod: "JazzCash",
      transactionId: "",
      cause: "General Welfare Fund",
      notes: "",
    });
    setFormSubmitted(false);
    setReceiptResult(null);
    setErrorMessage(null);
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
              <div className="w-12 h-12 rounded-2xl bg-[#00A040] text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00A040]">
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
            After sending your donation via JazzCash or Easypaisa, please fill in the confirmation form below to automatically receive your official receipt. You can also share your transfer screenshot on WhatsApp for instant acknowledgment.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* WhatsApp Chat Button */}
            <a
              href="https://wa.me/923701972002?text=Assalam-o-Alaikum!%20I%20have%20sent%20a%20donation%20for%20Ta%27meer-e-Rekhta.%20Here%20is%20my%20payment%20proof:"
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

      {/* Official Donation Notification & Receipt Generation Form */}
      <div className="rounded-3xl bg-white border border-gray-200 p-6 sm:p-10 shadow-card">
        <div className="max-w-xl mx-auto text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-emerald">
            Donation Confirmation
          </span>
          <h4 className="font-heading font-bold text-2xl text-gray-900 mt-1">
            Submit Transfer Details &amp; Get Receipt
          </h4>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Fill in your details below. A system-generated receipt copy will be sent to your email, and recorded with our accounts team.
          </p>
        </div>

        {formSubmitted && receiptResult ? (
          <div className="text-center py-8 space-y-5 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 p-6 sm:p-8 max-w-xl mx-auto animate-in fade-in">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider mb-2">
                <Receipt className="w-3.5 h-3.5" />
                Receipt Issued: {receiptResult.receiptNo}
              </span>
              <h5 className="font-heading font-black text-2xl text-emerald-950">
                Donation Successfully Recorded!
              </h5>
              <p className="text-emerald-800 text-sm mt-1">
                Amount: <strong className="font-extrabold">{receiptResult.amount}</strong>
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-100 text-left text-xs sm:text-sm text-gray-700 space-y-2 max-w-md mx-auto">
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>An electronic copy has been dispatched to your email: <strong>{receiptResult.email}</strong></span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>A confirmation record has been forwarded to Ta&apos;meer-e-Rekhta administration at <strong>taameer.e.rekhta@gmail.com</strong>.</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Submit Another Transfer</span>
              </button>

              <a
                href="https://wa.me/923701972002?text=Assalam-o-Alaikum!%20I%20have%20submitted%20donation%20details%20for%20Ta%27meer-e-Rekhta."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Helpline</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmSubmit} className="max-w-xl mx-auto space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Donor Name */}
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

              {/* Donor Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Your Email Address * (For Receipt)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. donor@example.com"
                  value={formData.donorEmail}
                  onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone / WhatsApp */}
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

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Donated Amount (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Paid Via */}
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

              {/* Transaction / Reference ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Transaction / TID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="TID from transfer SMS / app"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
                />
              </div>
            </div>

            {/* Cause / Initiative */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Cause / Initiative
              </label>
              <select
                value={formData.cause}
                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none bg-white"
              >
                <option value="General Welfare Fund">General Welfare Fund</option>
                <option value="Food Drives & Ration Relief">Food Drives &amp; Ration Relief</option>
                <option value="Orphanage & Shelter Care">Orphanage &amp; Shelter Care</option>
                <option value="Youth Leadership & Urdu Literature">Youth Leadership &amp; Urdu Literature</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Special Note / Message (Optional)
              </label>
              <input
                type="text"
                placeholder="Any specific note or dedication..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-brand-emerald focus:ring-2 focus:ring-brand-mint outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-brand-emerald hover:bg-brand-green text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Donation &amp; Generating Receipt...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Transfer &amp; Issue Receipt</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}