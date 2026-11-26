"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Server,
  Database,
  Users,
  ShieldAlert,
  Clock,
  RefreshCw,
  Terminal,
  Cpu,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";

interface DiagnosticsData {
  system: {
    nodeVersion: string;
    platform: string;
    uptimeSeconds: number;
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
    };
  };
  database: {
    status: string;
    host: string;
    name: string;
    metrics: {
      users: number;
      departments: number;
      tasks: number;
    };
  };
  environment: string;
  timestamp: string;
}

export default function DeveloperDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const initialTab = searchParams.get("tab") || "diagnostics";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);

  // Impersonation State
  const [targetEmail, setTargetEmail] = useState("");
  const [impersonationReason, setImpersonationReason] = useState("");
  const [submittingImp, setSubmittingImp] = useState(false);
  const [impResult, setImpResult] = useState<any>(null);
  const [impError, setImpError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Enforce Developer role authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/portal/login");
      } else if (user.role !== "developer") {
        router.push("/portal/unauthorized");
      }
    }
  }, [user, authLoading, router]);

  const loadDiagnostics = useCallback(async () => {
    setLoadingDiag(true);
    setDiagError(null);
    try {
      const res = await fetchWithAuth("/developer/diagnostics");
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setDiagError(err.error || `Failed to fetch diagnostics (HTTP ${res.status})`);
      }
    } catch {
      setDiagError("Unable to connect to diagnostics service.");
    } finally {
      setLoadingDiag(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "developer" && activeTab === "diagnostics") {
      loadDiagnostics();
    }
  }, [user, activeTab, loadDiagnostics]);

  const handleImpersonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImpError(null);
    setImpResult(null);

    if (!targetEmail.trim()) {
      setImpError("Target user email is required.");
      return;
    }

    if (!impersonationReason.trim() || impersonationReason.trim().length < 10) {
      setImpError("Audited reason is mandatory and must be at least 10 characters long.");
      return;
    }

    setSubmittingImp(true);
    try {
      const res = await fetchWithAuth("/developer/impersonate", {
        method: "POST",
        body: JSON.stringify({
          targetEmail: targetEmail.trim().toLowerCase(),
          reason: impersonationReason.trim(),
        }),
      });

      const data = await res.json();
      setSubmittingImp(false);

      if (res.ok && data.success) {
        setImpResult(data);
      } else {
        setImpError(data.error || `Impersonation rejected (HTTP ${res.status}).`);
      }
    } catch {
      setSubmittingImp(false);
      setImpError("Failed to dispatch impersonation request. Please check connection.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (authLoading || !user || user.role !== "developer") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 font-medium">
          <div className="w-5 h-5 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
          Verifying Developer Credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Developer Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Terminal className="w-3.5 h-3.5" />
                DEDICATED DEVELOPER MASTER ACCESS
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                ROLE: {user.role.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Engineering Console &amp; System Telemetry
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Account: <span className="text-slate-200 font-mono">{user.email}</span> • Designation: <span className="text-emerald-400 font-semibold">System Lead</span> • Department: <span className="text-slate-200">Engineering (ENG)</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab("diagnostics");
                loadDiagnostics();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDiag ? "animate-spin" : ""}`} />
              Refresh Telemetry
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "diagnostics"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            <Activity className="w-4 h-4" />
            System Observability &amp; Diagnostics
          </button>
          <button
            onClick={() => setActiveTab("impersonate")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === "impersonate"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-300 hover:bg-slate-800/80"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Audited User Impersonation (RFC 8693)
          </button>
        </div>
      </div>

      {/* TAB 1: SYSTEM OBSERVABILITY & DIAGNOSTICS */}
      {activeTab === "diagnostics" && (
        <div className="space-y-6">
          {diagError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{diagError}</span>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Database Status</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-heading text-gray-900">
                {diagnostics?.database.status.toUpperCase() || "CONNECTING..."}
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Host: {diagnostics?.database.host || "MongoDB Atlas Cluster"}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Users in DB</span>
                <Users className="w-4 h-4 text-brand-emerald" />
              </div>
              <div className="text-2xl font-bold font-heading text-gray-900">
                {diagnostics?.database.metrics.users ?? "..."}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active Organizational Directory
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Departments</span>
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-heading text-gray-900">
                {diagnostics?.database.metrics.departments ?? "..."}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                6 Official Departments Configured
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Process Uptime</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold font-heading text-gray-900">
                {diagnostics?.system.uptimeSeconds
                  ? `${Math.floor(diagnostics.system.uptimeSeconds / 60)}m ${diagnostics.system.uptimeSeconds % 60}s`
                  : "..."}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Node.js: {diagnostics?.system.nodeVersion || "v20+"}
              </p>
            </div>
          </div>

          {/* Deep Diagnostics Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Runtime Memory &amp; Server Health
              </h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Heap Used</span>
                  <span className="font-semibold text-gray-900">{diagnostics?.system.memory.heapUsedMb ?? 0} MB</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Heap Total</span>
                  <span className="font-semibold text-gray-900">{diagnostics?.system.memory.heapTotalMb ?? 0} MB</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Resident Set Size (RSS)</span>
                  <span className="font-semibold text-gray-900">{diagnostics?.system.memory.rssMb ?? 0} MB</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Platform</span>
                  <span className="font-semibold text-gray-900">{diagnostics?.system.platform || "linux"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Environment</span>
                  <span className="font-semibold text-emerald-700 uppercase">{diagnostics?.environment || "production"}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                MongoDB Atlas Production Telemetry
              </h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Database Name</span>
                  <span className="font-semibold text-gray-900">{diagnostics?.database.name || "tameer_rekhta"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Cluster Connection</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    CONNECTED (ONLINE)
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Active Tasks in DB</span>
                  <span className="font-semibold text-gray-900">{diagnostics?.database.metrics.tasks ?? 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Telemetry Timestamp</span>
                  <span className="font-semibold text-gray-700">{diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleTimeString() : "..."}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Audit Provenance</span>
                  <span className="text-emerald-700 font-semibold">Immutable Append-Only Log</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITED USER IMPERSONATION */}
      {activeTab === "impersonate" && (
        <div className="space-y-6">
          {/* Security Policy Notice */}
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              RFC 8693 Impersonation Governance &amp; Security Boundaries
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-900/90 text-xs">
              <li><strong>Time-Limited:</strong> Impersonation tokens expire strictly after 15 minutes.</li>
              <li><strong>Audited Dual-Subject:</strong> Every action performed during impersonation is logged with both your Developer ID and the target user ID.</li>
              <li><strong>Mandatory Reason:</strong> A detailed technical rationale (at least 10 characters) is required.</li>
              <li><strong className="text-red-700">Hard Super Admin Lockout:</strong> Impersonating the Super Administrator is strictly prohibited by backend security filters and triggers an immediate security alert.</li>
            </ul>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm max-w-2xl">
            <h2 className="text-lg font-bold font-heading text-gray-900 mb-1">
              Initiate Audited User Impersonation
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Use this tool strictly for diagnosing operational issues, inspecting department dashboards, or reproducing verified bugs.
            </p>

            {impError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{impError}</span>
              </div>
            )}

            <form onSubmit={handleImpersonationSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Target Account Email Address
                </label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  required
                  placeholder="e.g. lit.head@rekhta.org or aishatariq@rekhta.org"
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Technical Justification Reason (min. 10 chars)
                </label>
                <textarea
                  rows={3}
                  value={impersonationReason}
                  onChange={(e) => setImpersonationReason(e.target.value)}
                  required
                  minLength={10}
                  placeholder="Explain why this impersonation session is required for engineering diagnosis..."
                  className="w-full px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <button
                type="submit"
                disabled={submittingImp}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-md"
              >
                {submittingImp ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Issuing Impersonation Token...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    Authorize Impersonation Session (15m)
                  </span>
                )}
              </button>
            </form>

            {/* Impersonation Result Box */}
            {impResult && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  Impersonation Session Active for {impResult.targetUser.name} ({impResult.targetUser.email})
                </div>
                <p className="text-xs text-emerald-800">
                  Target Role: <strong className="font-mono">{impResult.targetUser.role}</strong> • Expiration: <strong>15 Minutes</strong>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(impResult.impersonationToken)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 transition-colors"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedToken ? "Token Copied!" : "Copy Bearer Token"}
                  </button>
                  <a
                    href={`/portal/department`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Open Workspace <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
