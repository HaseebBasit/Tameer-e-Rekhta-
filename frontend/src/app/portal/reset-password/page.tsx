"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { API_BASE } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Reset token is missing. Please check your reset link or request a new one.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {}

      setSubmitting(false);

      if (res.ok && data?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/portal/login");
        }, 2500);
      } else {
        setError(data?.error || (res.status === 400 ? "Invalid or expired password reset link." : "Failed to reset password. Please try again."));
      }
    } catch {
      setSubmitting(false);
      setError("Unable to connect to the authentication server. Please check your network connection.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-mint/20 via-brand-cream/60 to-white">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-mint/50 border border-brand-emerald/20 flex items-center justify-center p-1 shadow-sm">
              <Image
                src="/images/logo-mark.png"
                alt="Ta'meer-e-Rekhta Logo"
                width={48}
                height={48}
                className="object-contain p-1"
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
            Set New Password
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
            Enter and confirm your new secure portal password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Password Reset Successful</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Your password has been updated. Redirecting you to the portal login...
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-emerald hover:text-brand-pitch"
              >
                Go to Sign In Now →
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {!searchParams.get("token") && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Reset Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    placeholder="Paste the reset token from your email"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all font-mono text-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
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
                  Updating Password...
                </span>
              ) : (
                <span>Update Password</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-emerald font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-sm text-gray-500">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
