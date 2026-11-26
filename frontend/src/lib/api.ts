/**
 * Ta'meer-e-Rekhta Management Portal — Centralized API Base URL & Authenticated Client
 *
 * Security Architecture (Strict In-Memory JWT Access Token Storage):
 * 1. In-Memory Access Token: JWT access tokens are stored EXCLUSIVELY in JavaScript runtime memory.
 *    Access tokens are NEVER written to localStorage, sessionStorage, or client-side storage.
 * 2. Secure HTTP-Only Cookies: Persistent refresh token (rekhta_refresh_token) and access cookie
 *    (rekhta_access_token) are managed by the backend as HTTP-only, SameSite cookies.
 * 3. Automatic Silent Refresh: If an access token expires or is absent on page reload,
 *    fetchWithAuth and AuthContext perform silent refresh against /api/auth/refresh (or /api/auth/me)
 *    using the secure HTTP-only cookie, repopulating the in-memory access token seamlessly.
 * 4. Dual-Channel Defense:
 *    - Primary: Authorization: Bearer <in_memory_token>
 *    - Secondary / Fallback: credentials: "include" for HTTP-only cookie transmission
 * 5. CSRF Defense: Every state-changing request automatically carries X-Requested-With: XMLHttpRequest.
 */

// In-Memory Access Token (NEVER persisted to localStorage / sessionStorage)
let inMemoryAccessToken: string | null = null;

// Mutex lock to prevent duplicate concurrent refresh requests
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

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

/**
 * In-Memory Session Token Accessors (Zero LocalStorage / SessionStorage Persistence)
 */
export function getSessionToken(): string | null {
  return inMemoryAccessToken;
}

export function setSessionToken(token: string | null): void {
  inMemoryAccessToken = token || null;
}

export function clearSessionToken(): void {
  inMemoryAccessToken = null;
}

/**
 * Execute silent token refresh via HTTP-only refresh cookie
 */
async function executeSilentRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.token && typeof data.token === "string") {
          setSessionToken(data.token);
          return data.token;
        }
      }
      clearSessionToken();
      return null;
    } catch {
      clearSessionToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Shared Authenticated API Helper (fetchWithAuth)
 *
 * Guarantees that:
 * 1. Bearer session token is attached to Authorization header from IN-MEMORY storage.
 * 2. credentials: "include" is always enabled for HTTP-only cookie support.
 * 3. X-Requested-With: "XMLHttpRequest" is included for CSRF validation.
 * 4. X-Department-Context header is attached when an active department context exists.
 * 5. Relative endpoints (e.g. '/tasks' or `${API_BASE}/tasks`) are cleanly resolved.
 * 6. On 401 Unauthorized (token expired), transparently attempts silent refresh and retries once.
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  let url = endpoint;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    if (url.startsWith("/api/")) {
      url = url.replace(/^\/api/, baseUrl);
    } else if (url.startsWith("/api")) {
      url = baseUrl;
    } else {
      url = `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    }
  }

  const token = getSessionToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("X-Requested-With")) {
    headers.set("X-Requested-With", "XMLHttpRequest");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("X-Department-Context") && typeof window !== "undefined") {
    try {
      const activeDept = localStorage.getItem("rekhta_active_dept");
      if (activeDept) {
        headers.set("X-Department-Context", activeDept);
      }
    } catch {}
  }

  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  // If 401 received and request was not already a refresh or login call, attempt silent refresh
  if (
    response.status === 401 &&
    !url.includes("/auth/refresh") &&
    !url.includes("/auth/login") &&
    typeof window !== "undefined"
  ) {
    const newToken = await executeSilentRefresh();
    if (newToken) {
      // Clone headers and retry request with the fresh in-memory access token
      const retryHeaders = new Headers(options.headers || {});
      if (!retryHeaders.has("Content-Type") && options.body && typeof options.body === "string") {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("X-Requested-With", "XMLHttpRequest");
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      if (!retryHeaders.has("X-Department-Context")) {
        try {
          const activeDept = localStorage.getItem("rekhta_active_dept");
          if (activeDept) retryHeaders.set("X-Department-Context", activeDept);
        } catch {}
      }

      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: retryHeaders,
      });
    }
  }

  return response;
}
