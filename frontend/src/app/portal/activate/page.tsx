"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Sparkles, UserCheck, ShieldAlert } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface TokenInfo {
  name: string;
  email: string;
  department: string | null;
  departmentCode: string | null;
  role: string;
  designation?: string | null;
}

function ActivateAccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [verifyingToken, setVerifyingToken] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    }
  }, [searchParams]);

  const verifyToken = async (rawToken: string) => {
    setVerifyingToken(true);
    setTokenError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-activation-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken.trim() }),
      });
      const data = await res.json();
      setVerifyingToken(false);
      if (res.ok && data.valid) {
        setTokenInfo({
          name: data.name,
          email: data.email,
          department: data.department,
          departmentCode: data.departmentCode,
          role: data.role,
          designation: data.designation,
        });
      } else {
        setTokenError(data.error || "Activation link is invalid or has expired.");
      }
    } catch {
      setVerifyingToken(false);
      // If verification endpoint is offline, allow user to attempt submission directly
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError("Activation token is missing. Please use the complete activation link provided by the Super Admin.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: cleanToken, password }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/portal/login");
        }, 2500);
      } else {
        setError(data.error || "Failed to activate account. The invitation link may have expired or already been used.");
      }
    } catch {
      setSubmitting(false);
      setError("Unable to connect to the authentication server. Please try again.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-brand-mint/20 via-brand-cream/60 to-white">
      <div className="max-w-md w-full space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
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

          <div className="mt-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-mint/60 text-brand-dark">
              <Sparkles className="w-3 h-3 text-brand-emerald" />
              Organizational Account Activation
            </span>
            <h2 className="mt-2 text-2xl font-bold font-heading text-brand-pitch">
              Set Your Password
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
              Welcome to Ta&apos;meer-e-Rekhta. Activate your official workspace account.
            </p>
          </div>
        </div>

        {/* Recipient verification banner */}
        {tokenInfo && !tokenError && !success && (
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-gray-900">{tokenInfo.name}</p>
              <p className="text-2xs text-gray-600 font-mono">{tokenInfo.email}</p>
              {tokenInfo.department && (
                <p className="text-2xs text-emerald-700 font-medium mt-0.5">
                  Department: {tokenInfo.department} {tokenInfo.designation ? `(${tokenInfo.designation.replace(/_/g, " ")})` : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Token Error Banner */}
        {tokenError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-red-900">Activation Link Invalid or Expired</h3>
            <p className="text-xs text-red-700 leading-relaxed">{tokenError}</p>
            <div className="pt-2">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-emerald hover:text-brand-pitch"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
              </Link>
            </div>
          </div>
        )}

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
              <h3 className="text-base font-semibold text-gray-900">Account Activated Successfully!</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Your portal workspace is now ready. Redirecting to login...
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-emerald hover:text-brand-pitch"
              >
                Sign In Now →
              </Link>
            </div>
          </div>
        ) : !tokenError && (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            {!searchParams.get("token") && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Activation Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value);
                      if (e.target.value.length === 64) verifyToken(e.target.value);
                    }}
                    required
                    placeholder="Enter your single-use activation token"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 characters (letters & numbers)"
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
              <p className="mt-1 text-2xs text-gray-500">
                Must be at least 8 characters with at least one letter and one number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
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
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || verifyingToken}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-emerald hover:bg-brand-pitch focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald shadow-md disabled:opacity-60 transition-all duration-200"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Activating Account...
                </span>
              ) : (
                <span>Activate Account & Proceed to Sign In</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/portal/login"
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-emerald font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Already have an active password? Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-sm text-gray-500">Loading activation form...</div>}>
      <ActivateAccountForm />
    </Suspense>
  );
}
