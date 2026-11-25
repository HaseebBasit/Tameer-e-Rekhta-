"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please provide your registered email address.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSubmitted(true);
        if (data.devResetToken) {
          setDevToken(data.devResetToken);
        }
      } else {
        setError(data.error || "Failed to process request. Please try again.");
      }
    } catch {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-mint/20 via-brand-cream/60 to-white">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-brand-mint/50 border border-brand-emerald/20 flex items-center justify-center p-1 shadow-sm">
              <Image
                src="/images/logo-mark.png"
                alt="Ta'meer-e-Rekhta Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="text-left">
              <span className="font-heading font-extrabold text-brand-pitch text-lg tracking-tight block">
                Ta&apos;meer e Rekhta
              </span>
              <span className="urdu-text text-xs text-brand-green font-bold block">
                تعمیرِ ریختہ
              </span>
            </div>
          </Link>

          <h2 className="mt-5 text-2xl font-bold font-heading text-brand-pitch">
            Reset Portal Password
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {submitted ? (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Instructions Sent</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                If the email <span className="font-medium text-gray-800">{email}</span> is registered with the portal, you will receive password reset instructions shortly.
              </p>
            </div>

            {devToken && (
              <div className="p-3 rounded-lg bg-brand-mint/40 border border-brand-emerald/30 text-left text-xs">
                <span className="font-semibold text-brand-pitch block">Development Reset Link:</span>
                <Link
                  href={`/portal/reset-password?token=${devToken}`}
                  className="text-brand-emerald font-medium underline break-all hover:text-brand-pitch"
                >
                  /portal/reset-password?token={devToken}
                </Link>
              </div>
            )}

            <div className="pt-3">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-emerald hover:text-brand-pitch"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@rekhta.org"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-emerald hover:bg-brand-pitch focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald shadow-md disabled:opacity-60 transition-all duration-200"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending Instructions...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  Send Reset Link
                </span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-emerald font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Portal Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
