"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Shield,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PortalLoginPage() {
  const router = useRouter();
  const {
    user,
    login,
    verifyMfa,
    changeInitialPassword,
    loading,
    error,
    clearError,
    getDashboardRoute,
  } = useAuth();

  // Multi-Stage State
  const [stage, setStage] = useState<"credentials" | "mfa" | "change_password">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // MFA State
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);

  // Password Change State
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback State
  const [localError, setLocalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (user && !loading) {
      const targetRoute = getDashboardRoute(user.role);
      router.push(targetRoute);
    }
  }, [user, loading, router, getDashboardRoute]);

  // Stage 1: Primary Credentials Submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.requireMfa && result.mfaToken) {
      setMfaToken(result.mfaToken);
      setStage("mfa");
      setTotpCode("");
      setLocalError(null);
      return;
    }

    if (result.success && result.user) {
      const targetRoute = getDashboardRoute(result.user.role);
      router.push(targetRoute);
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  // Stage 2: Multi-Factor Authentication Submission (TOTP / Recovery Code)
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);
    clearError();

    if (!totpCode.trim() || !mfaToken) {
      setLocalError(
        isRecoveryCode
          ? "Please enter your backup recovery code."
          : "Please enter the 6-digit verification code from your authenticator app."
      );
      return;
    }

    setSubmitting(true);
    const result = await verifyMfa(
      mfaToken,
      isRecoveryCode ? undefined : totpCode.trim(),
      isRecoveryCode ? totpCode.trim() : undefined
    );
    setSubmitting(false);

    if (result.requirePasswordChange && result.tempToken) {
      setTempToken(result.tempToken);
      setStage("change_password");
      setNewPassword("");
      setConfirmNewPassword("");
      setLocalError(null);
      return;
    }

    if (result.success && result.user) {
      const targetRoute = getDashboardRoute(result.user.role);
      router.push(targetRoute);
    } else if (result.error) {
      setLocalError(result.error);
    }
  };

  // Stage 3: Initial Password Change Submission
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessNotice(null);
    clearError();

    if (!newPassword || newPassword.length < 10) {
      setLocalError("New password must be at least 10 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setLocalError("Passwords do not match. Please verify and re-enter.");
      return;
    }

    if (!tempToken) {
      setLocalError("Password change session expired. Please sign in again.");
      setStage("credentials");
      return;
    }

    setSubmitting(true);
    const result = await changeInitialPassword(tempToken, newPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessNotice("Password established successfully! Please sign in with your new permanent password.");
      setStage("credentials");
      setPassword("");
      setTempToken(null);
      setMfaToken(null);
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
            <div className="w-14 h-14 rounded-full overflow-hidden bg-brand-mint/50 border border-brand-emerald/20 flex items-center justify-center p-1.5 shadow-sm group-hover:border-brand-emerald transition-colors">
              <Image
                src="/images/logo-mark.png"
                alt="Ta'meer-e-Rekhta Logo"
                width={56}
                height={56}
                className="object-contain p-1"
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
            {stage === "credentials" && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-mint/60 text-brand-dark border border-brand-emerald/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                  Official Management Portal
                </span>
                <h2 className="mt-3 text-2xl font-bold font-heading text-brand-pitch">
                  Sign In to Your Workspace
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
                  Authorized access for Super Admin, Developer, Department Heads, HR, Finance & Members
                </p>
              </>
            )}

            {stage === "mfa" && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Multi-Factor Authentication
                </span>
                <h2 className="mt-3 text-2xl font-bold font-heading text-brand-pitch">
                  Two-Factor Verification
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
                  {isRecoveryCode
                    ? "Enter an unused backup recovery code to access your account."
                    : "Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, or 1Password)."}
                </p>
              </>
            )}

            {stage === "change_password" && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  Security Governance Requirement
                </span>
                <h2 className="mt-3 text-2xl font-bold font-heading text-brand-pitch">
                  Set Permanent Password
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
                  First-time login requires establishing a new permanent password (minimum 10 characters).
                </p>
              </>
            )}
          </div>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs sm:text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 font-medium">{successNotice}</div>
          </div>
        )}

        {/* Error Alert */}
        {displayError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">{displayError}</p>
            </div>
          </div>
        )}

        {/* STAGE 1: CREDENTIALS FORM */}
        {stage === "credentials" && (
          <form className="mt-6 space-y-5" onSubmit={handleCredentialsSubmit}>
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
        )}

        {/* STAGE 2: MFA VERIFICATION FORM */}
        {stage === "mfa" && (
          <form className="mt-6 space-y-5" onSubmit={handleMfaSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                {isRecoveryCode ? "Backup Recovery Code" : "6-Digit Authenticator Code"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  required
                  autoFocus
                  maxLength={isRecoveryCode ? 10 : 6}
                  placeholder={isRecoveryCode ? "XXXX-XXXX" : "123456"}
                  autoComplete="one-time-code"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm font-mono tracking-widest text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryCode(!isRecoveryCode);
                  setTotpCode("");
                  setLocalError(null);
                }}
                className="font-medium text-brand-emerald hover:text-brand-pitch hover:underline"
              >
                {isRecoveryCode ? "← Use Authenticator App (TOTP)" : "Use Backup Recovery Code"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("credentials");
                  setMfaToken(null);
                  setTotpCode("");
                  setLocalError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-emerald hover:bg-brand-pitch focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-200"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying Code...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Verify & Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        )}

        {/* STAGE 3: INITIAL PASSWORD CHANGE FORM */}
        {stage === "change_password" && (
          <form className="mt-6 space-y-5" onSubmit={handleChangePasswordSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                New Permanent Password (min. 10 chars)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={10}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Permanent Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={10}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-emerald hover:bg-brand-pitch focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-emerald shadow-md hover:shadow-lg disabled:opacity-60 transition-all duration-200"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving Password...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Establish Password & Continue
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>
        )}

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
