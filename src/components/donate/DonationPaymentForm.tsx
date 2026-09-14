"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Smartphone, Landmark, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReceiptData } from "./DonationReceipt";

const CAUSES = [
  { value: "food_drives", label: "Food Drives & Ration Relief" },
  { value: "orphanage_care", label: "Orphanage Care" },
  { value: "youth_leadership", label: "Youth Leadership" },
  { value: "general_welfare", label: "General Welfare Fund" },
] as const;

const AMOUNT_PRESETS = [1000, 2500, 5000, 10000];

const PAYMENT_METHODS = [
  {
    value: "easypaisa",
    label: "EasyPaisa",
    icon: Smartphone,
    detail: "Account: 0312-3456789 · Title: Ta'meer-e-Rekhta",
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    icon: Smartphone,
    detail: "Account: 0312-3456789 · Title: Ta'meer-e-Rekhta",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    icon: Landmark,
    detail: "Meezan Bank Ltd · Account: 0102-0105829103",
  },
  {
    value: "card",
    label: "Test Card",
    icon: CreditCard,
    detail: "Simulation only — no card details required",
  },
] as const;

type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];

interface FormState {
  cause: string;
  amount: string;
  customAmount: string;
  paymentMethod: PaymentMethodValue;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  notes: string;
}

const INITIAL_STATE: FormState = {
  cause: CAUSES[0].value,
  amount: String(AMOUNT_PRESETS[1]),
  customAmount: "",
  paymentMethod: "easypaisa",
  donorName: "",
  donorEmail: "",
  donorPhone: "",
  notes: "",
};

interface DonationPaymentFormProps {
  onSuccess: (receipt: ReceiptData) => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethodValue, string> = {
  easypaisa: "EasyPaisa (Test Mode)",
  jazzcash: "JazzCash (Test Mode)",
  bank: "Bank Transfer — Meezan Bank Ltd (Test Mode)",
  card: "Test Card (Simulation)",
};

const CAUSE_LABELS: Record<string, string> = Object.fromEntries(CAUSES.map((c) => [c.value, c.label]));

export default function DonationPaymentForm({ onSuccess }: DonationPaymentFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const effectiveAmount = form.customAmount ? Number(form.customAmount) : Number(form.amount);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.donorName.trim()) next.donorName = "Please enter your full name.";
    if (!isValidEmail(form.donorEmail)) next.donorEmail = "Please enter a valid email address.";
    if (!form.donorPhone.trim()) next.donorPhone = "Phone / WhatsApp is required.";
    if (!effectiveAmount || effectiveAmount <= 0) next.amount = "Please choose or enter a valid amount.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: form.donorName,
          donorEmail: form.donorEmail,
          donorPhone: form.donorPhone,
          amount: effectiveAmount,
          paymentMethod: form.paymentMethod,
          cause: form.cause,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmitError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      // The API's receipt object already carries transactionId, donorName,
      // donorEmail, donorPhone, a pre-formatted `amount` string, and `date`.
      // We override paymentMethod/cause with human-friendly labels for display.
      onSuccess({
        transactionId: data.receipt.transactionId,
        donorName: data.receipt.donorName,
        donorEmail: data.receipt.donorEmail,
        donorPhone: data.receipt.donorPhone,
        amount: data.receipt.amount,
        paymentMethod: PAYMENT_METHOD_LABELS[form.paymentMethod],
        cause: CAUSE_LABELS[form.cause],
        date: data.receipt.date,
      });
    } catch {
      setSubmitError("Network error — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const activeMethod = PAYMENT_METHODS.find((m) => m.value === form.paymentMethod)!;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-2xl border border-brand-sand bg-white p-6 shadow-card sm:p-8"
    >
      <div className="mb-5 flex items-start gap-2 rounded-lg bg-brand-mint/50 px-3.5 py-2.5 text-xs text-brand-forest">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          This is a <strong>Test / Simulation</strong> donation flow using dummy account numbers. No real
          payment gateway is contacted and no funds are transferred.
        </span>
      </div>

      {/* Cause */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-dark">Cause / Initiative</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CAUSES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => update("cause", c.value)}
              className={cn(
                "rounded-lg border px-3.5 py-2.5 text-left text-sm transition",
                form.cause === c.value
                  ? "border-brand-emerald bg-brand-mint/60 font-semibold text-brand-forest"
                  : "border-brand-sand text-brand-charcoal hover:border-brand-lime"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-dark">Amount (PKR)</label>
        <div className="grid grid-cols-4 gap-2">
          {AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                update("amount", String(preset));
                update("customAmount", "");
              }}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-sm font-semibold transition",
                !form.customAmount && form.amount === String(preset)
                  ? "border-brand-emerald bg-brand-mint/60 text-brand-forest"
                  : "border-brand-sand text-brand-charcoal hover:border-brand-lime"
              )}
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          placeholder="Or enter a custom amount"
          value={form.customAmount}
          onChange={(e) => update("customAmount", e.target.value)}
          className="mt-2 w-full rounded-lg border border-brand-sand px-3.5 py-2.5 text-sm outline-none focus:border-brand-emerald"
        />
        {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
      </div>

      {/* Payment method */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-dark">Payment Method</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PAYMENT_METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => update("paymentMethod", m.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition",
                  form.paymentMethod === m.value
                    ? "border-brand-emerald bg-brand-mint/60 text-brand-forest"
                    : "border-brand-sand text-brand-charcoal hover:border-brand-lime"
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 rounded-lg bg-brand-sand px-3 py-2 text-xs text-brand-leaf">{activeMethod.detail}</p>
      </div>

      {/* Donor info */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-semibold text-brand-dark">Full Name</label>
          <input
            type="text"
            value={form.donorName}
            onChange={(e) => update("donorName", e.target.value)}
            className="w-full rounded-lg border border-brand-sand px-3.5 py-2.5 text-sm outline-none focus:border-brand-emerald"
            placeholder="Your full name"
          />
          {errors.donorName && <p className="mt-1 text-xs text-red-600">{errors.donorName}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-brand-dark">Email Address</label>
          <input
            type="email"
            value={form.donorEmail}
            onChange={(e) => update("donorEmail", e.target.value)}
            className="w-full rounded-lg border border-brand-sand px-3.5 py-2.5 text-sm outline-none focus:border-brand-emerald"
            placeholder="you@example.com"
          />
          {errors.donorEmail && <p className="mt-1 text-xs text-red-600">{errors.donorEmail}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-brand-dark">Phone / WhatsApp</label>
          <input
            type="tel"
            value={form.donorPhone}
            onChange={(e) => update("donorPhone", e.target.value)}
            className="w-full rounded-lg border border-brand-sand px-3.5 py-2.5 text-sm outline-none focus:border-brand-emerald"
            placeholder="03XX-XXXXXXX"
          />
          {errors.donorPhone && <p className="mt-1 text-xs text-red-600">{errors.donorPhone}</p>}
        </div>
      </div>

      {submitError && (
        <div className="mb-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-emerald px-5 py-3.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-green disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Processing test payment..." : "Submit Test Donation"}
      </button>
    </form>
  );
}