"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getApiBaseUrl, setSessionToken } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface TargetUserPreview {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  departmentCode?: string | null;
  designation?: string | null;
  memberships?: any[];
}

export default function EmergencyAccessPage() {
  const router = useRouter();
  const { getDashboardRoute } = useAuth();

  // Stage: "credentials" -> "mfa"
  const [stage, setStage] = useState<"credentials" | "mfa">("credentials");

  // Form State
  const [targetEmail, setTargetEmail] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [reason, setReason] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);

  // Session State
  const [emergencyToken, setEmergencyToken] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<TargetUserPreview | null>(null);

  // Feedback State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Submit Emergency Key, Target Email, and Reason
  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailTrimmed = targetEmail.trim().toLowerCase();
    const reasonTrimmed = reason.trim();

    if (!emailTrimmed) {
      setError("Please enter the target user's organizational email address.");
      return;
    }
    if (!accessKey) {
      setError("Please enter the Emergency Access Key.");
      return;
    }
    if (!reasonTrimmed || reasonTrimmed.length < 10) {
      setError("A technical justification of at least 10 characters is mandatory for emergency access.");
      return;
    }

    setSubmitting(true);
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/emergency/verify-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({
          targetEmail: emailTrimmed,
          accessKey,
          reason: reasonTrimmed,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(
          data?.error ||
          (res.status === 403
            ? "Emergency access to this account is prohibited by organizational security policies."
            : res.status === 401
            ? "Invalid Emergency Access Key. Please check the credential and retry."
            : res.status === 404
            ? `Target account '${emailTrimmed}' does not exist in the organizational roster.`
            : `Authentication failed (HTTP ${res.status}).`)
        );
        setSubmitting(false);
        return;
      }

      if (data.requireMfa && data.emergencyToken) {
        setEmergencyToken(data.emergencyToken);
        setTargetUser(data.targetUser || null);
        setStage("mfa");
        setTotpCode("");
      } else {
        setError("Unexpected response from authentication gateway.");
      }
    } catch {
      setError("Unable to connect to the authentication server. Please verify network connectivity.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Submit Emergency Operator MFA TOTP
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!totpCode.trim() || !emergencyToken) {
      setError(
        isRecoveryCode
          ? "Please enter a valid emergency backup recovery code."
          : "Please enter the 6-digit verification code from your authenticator app."
      );
      return;
    }

    setSubmitting(true);
    const baseUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${baseUrl}/emergency/verify-mfa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "include",
        body: JSON.stringify({
          emergencyToken,
          code: isRecoveryCode ? undefined : totpCode.trim(),
          recoveryCode: isRecoveryCode ? totpCode.trim() : undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(
          data?.error ||
          (res.status === 401
            ? "Invalid MFA code. Please check your authenticator app or backup recovery code."
            : `MFA verification failed (HTTP ${res.status}).`)
        );
        setSubmitting(false);
        return;
      }

      // Establish session
      if (data.token) {
        setSessionToken(data.token);
      }

      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("rekhta_user", JSON.stringify(data.user));
        if (data.user.activeDepartment) {
          localStorage.setItem("rekhta_active_dept", data.user.activeDepartment);
        }
      }

      // Route to target user's appropriate workspace
      const targetRole = data.user?.role;
      const targetPath = getDashboardRoute(targetRole);

      // Force page navigation so layout re-hydrates with emergency banner
      window.location.href = targetPath;
    } catch {
      setError("Unable to finalize emergency session. Please check your network connection.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1525] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Graphic Accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-950/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-amber-950/20 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 p-0.5 shadow-xl shadow-red-900/30 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#131B2E] rounded-[14px] flex items-center justify-center">
              <span className="text-2xl font-black text-amber-300">TR</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-center">
            Independent Emergency Access
          </h1>
          <p className="mt-1 text-sm text-gray-400 text-center font-medium">
            Ta&apos;meer-e-Rekhta Management Portal &bull; System Governance
          </p>
        </div>

        {/* Security Notice Banner */}
        <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
          <span className="text-lg leading-none mt-0.5 shrink-0">🛡️</span>
          <div>
            <span className="font-bold text-amber-300">Audited Operator Gateway:</span> This interface allows authorized system owners to establish a time-limited (15-minute) diagnostic session for an organizational user. All activities are cryptographically signed and recorded in immutable audit logs.
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#17233B]/90 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl border border-gray-700/60 shadow-2xl">
          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <span className="text-base leading-none mt-0.5 shrink-0">⚠️</span>
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* STAGE 1: Key, Target, and Reason */}
          {stage === "credentials" && (
            <form onSubmit={handleKeySubmit} className="space-y-5">
              <div>
                <label htmlFor="targetEmail" className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Target Organizational Email
                </label>
                <input
                  id="targetEmail"
                  type="email"
                  required
                  placeholder="e.g. member@rekhta.org"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F1829] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm transition-all"
                  autoComplete="off"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Must be an active departmental member or team lead account.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="accessKey" className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Emergency Access Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    {showKey ? "Hide Key" : "Show Key"}
                  </button>
                </div>
                <input
                  id="accessKey"
                  type={showKey ? "text" : "password"}
                  required
                  placeholder="Enter high-entropy emergency operator key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F1829] border border-gray-700 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  autoComplete="off"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="reason" className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Mandatory Technical Reason
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      reason.trim().length >= 10 ? "text-emerald-400" : "text-gray-400"
                    }`}
                  >
                    {reason.trim().length}/10 min chars
                  </span>
                </div>
                <textarea
                  id="reason"
                  required
                  rows={3}
                  placeholder="Detail the technical support, outage investigation, or urgent governance reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0F1829] border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-gray-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Verifying Emergency Credentials..." : "Continue to Operator MFA Challenge →"}
              </button>
            </form>
          )}

          {/* STAGE 2: Operator MFA TOTP Verification */}
          {stage === "mfa" && (
            <form onSubmit={handleMfaSubmit} className="space-y-5">
              {/* Target User Summary Card */}
              {targetUser && (
                <div className="p-4 rounded-xl bg-[#0F1829] border border-gray-700/80 mb-2">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400 mb-2">
                    Verified Target Persona
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">{targetUser.name}</div>
                      <div className="text-xs text-gray-400">{targetUser.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
                        {targetUser.role.replace("dept_", "")}
                      </span>
                      <div className="text-[11px] text-gray-300 mt-0.5">{targetUser.department || "No Department"}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="totpCode" className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    {isRecoveryCode ? "Backup Recovery Code" : "Operator 6-Digit Verification Code"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryCode(!isRecoveryCode);
                      setTotpCode("");
                      setError(null);
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    {isRecoveryCode ? "Use Authenticator App" : "Use Backup Code"}
                  </button>
                </div>

                <input
                  id="totpCode"
                  type="text"
                  required
                  autoFocus
                  maxLength={isRecoveryCode ? 12 : 6}
                  placeholder={isRecoveryCode ? "e.g. 2187-E1A2" : "• • • • • •"}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F1829] border border-gray-700 rounded-xl text-white text-center font-mono text-xl tracking-widest placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  autoComplete="one-time-code"
                />
                <p className="mt-1.5 text-[11px] text-gray-400 text-center">
                  {isRecoveryCode
                    ? "Enter an unused single-use emergency recovery code from the handoff record."
                    : "Enter the code generated by your Authenticator app for the Emergency Operator."}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStage("credentials");
                    setError(null);
                  }}
                  className="w-1/3 py-3 px-4 rounded-xl font-bold text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3 px-4 rounded-xl font-bold text-sm text-gray-950 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Establishing Session..." : "Authorize 15-Min Access"}
                </button>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <Link href="/portal/login" className="hover:text-gray-200 transition-colors">
              ← Return to Standard Portal Login
            </Link>
            <span className="text-gray-500 font-mono text-[11px]">Strict 15-Minute Expiry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
