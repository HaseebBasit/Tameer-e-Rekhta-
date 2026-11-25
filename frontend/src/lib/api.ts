/**
 * Ta'meer-e-Rekhta Management Portal — Centralized API Base URL Configuration
 *
 * Resolves the backend API base URL from process.env.NEXT_PUBLIC_API_URL.
 * Normalizes trailing slashes and guarantees the '/api' prefix without duplication.
 * Defaults to the live production Render backend service.
 */

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    const trimmed = envUrl.trim().replace(/\/+$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }
  return "https://tmr-backend-6smd.onrender.com/api";
}

export const API_BASE = getApiBaseUrl();
