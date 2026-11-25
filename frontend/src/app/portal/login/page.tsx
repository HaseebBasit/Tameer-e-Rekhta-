"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PortalLoginPage() {
  const router = useRouter();
  const { user, login, loading, error, clearError, getDashboardRoute } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (user && !loading) {
      const targetRoute = getDashboardRoute(user.role);
      router.push(targetRoute);
    }
  }, [user, loading, router, getDashboardRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success && result.user) {
      const targetRoute = getDashboardRoute(result.user.role);
      router.push(targetRoute);
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-mint/20 via-brand-cream/60 to-white">
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-brand-mint/50 border border-brand-emerald/20 flex items-center justify-center p-1.5 shadow-sm group-hover:border-brand-emerald transition-colors">
              <Image
                src="/images/logo-mark.png"
                alt="Ta'meer-e-Rekhta Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="text-left">
              <span className="font-heading font-extrabold text-brand-pitch text-xl tracking-tight block">
                Ta&apos;meer e Rekhta
              </span>
              <span className="urdu-text text-sm text-brand-green font-bold block">
                تعمیرِ ریختہ
              </span>
            </div>
          </Link>

          <div className="mt-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-mint/60 text-brand-dark border border-brand-emerald/20">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
              Official Management Portal
            </span>
            <h2 className="mt-3 text-2xl font-bold font-heading text-brand-pitch">
              Sign In to Your Workspace
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
              Authorized access for Super Admin, Department Heads, HR, Finance & Members
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{displayError}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Email Address
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
                autoComplete="email"
                className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/portal/forgot-password"
                className="text-xs font-medium text-brand-emerald hover:text-brand-pitch hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                autoComplete="current-password"
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

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-brand-emerald focus:ring-brand-emerald w-3.5 h-3.5"
              />
              Remember my session
            </label>
            <Link
              href="/portal/activate"
              className="font-medium text-brand-emerald hover:text-brand-pitch hover:underline"
            >
              Activate invited account
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-emerald hover:bg-brand-pitch focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-200"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign In to Portal
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-brand-emerald font-medium transition-colors"
          >
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
