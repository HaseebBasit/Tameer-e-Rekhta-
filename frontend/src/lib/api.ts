/**
 * Ta'meer-e-Rekhta Management Portal — Centralized API Base URL Configuration
 *
 * Browser-side requests ALWAYS use the same-origin '/api' path.
 * This guarantees that all authentication cookies (rekhta_access_token, rekhta_refresh_token)
 * are set and transmitted as 100% First-Party cookies, bypassing third-party cookie restrictions
 * (Safari ITP, Chrome Privacy Sandbox, Firefox Total Cookie Protection).
 * Requests are then transparently proxied to the Render backend via Next.js edge rewrites.
 *
 * Server-side calls (SSR, API route proxies) resolve BACKEND_API_URL, NEXT_PUBLIC_API_URL,
 * or default to the live Render backend URL.
 */

export function getApiBaseUrl(): string {
  // 1. Browser runtime: ALWAYS use same-origin /api path
  if (typeof window !== "undefined") {
    return "/api";
  }

  // 2. Server-side runtime (SSR / API routes): direct backend connection
  const envUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }

  return "https://tmr-backend-6smd.onrender.com/api";
}

export const API_BASE = getApiBaseUrl();
