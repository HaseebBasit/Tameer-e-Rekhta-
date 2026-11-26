"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, getApiBaseUrl, fetchWithAuth, setSessionToken, clearSessionToken } from "@/lib/api";

export interface DepartmentMembership {
  department: string;
  departmentCode: string;
  departmentId?: string;
  role: string;
  designation?: string | null;
  region?: "Punjab" | "Sindh" | "National" | null;
  isPrimary?: boolean;
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role:
    | "super_admin"
    | "dept_literature"
    | "dept_media"
    | "dept_marketing"
    | "dept_outreach"
    | "dept_oam"
    | "dept_content"
    | "dept_welfare"
    | "hr"
    | "finance"
    | "developer"
    | "member";
  department?: string | null;
  departmentCode?: string | null;
  designation?: string | null;
  memberships?: DepartmentMembership[];
  emailAliases?: string[];
  city?: string | null;
  region?: "Punjab" | "Sindh" | "National" | null;
  activeDepartment?: string | null;
  activeDepartmentCode?: string | null;
  activeRole?: string | null;
  activeDesignation?: string | null;
  activeRegion?: string | null;
  isPrivilegedHR?: boolean;
  status?: string;
  isTester?: boolean;
  isModerator?: boolean;
  capabilities?: string[];
  isEmergencyAccess?: boolean;
  emergencySession?: {
    operatorId: string;
    operatorName?: string;
    operatorEmail?: string;
    keyId?: string;
    reason: string;
    initiatedAt?: string;
    expiresAt: number;
  };
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: PortalUser;
  requireMfa?: boolean;
  mfaToken?: string;
  requirePasswordChange?: boolean;
  tempToken?: string;
}

interface AuthContextType {
  user: PortalUser | null;
  loading: boolean;
  error: string | null;
  activeDepartment: string | null;
  activeDepartmentCode: string | null;
  activeRole: string | null;
  activeDesignation: string | null;
  memberships: DepartmentMembership[];
  isEmergencyAccess: boolean;
  emergencySession: {
    operatorId: string;
    operatorName?: string;
    operatorEmail?: string;
    keyId?: string;
    reason: string;
    initiatedAt?: string;
    expiresAt: number;
  } | null;
  endEmergencyAccess: () => Promise<void>;
  switchDepartment: (departmentNameOrCode: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyMfa: (mfaToken: string, code?: string, recoveryCode?: string) => Promise<LoginResult>;
  changeInitialPassword: (tempToken: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  getDashboardRoute: (role?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDashboardForRole = (role?: string): string => {
  switch (role) {
    case "super_admin":
      return "/portal/super-admin";
    case "dept_literature":
      return "/portal/department";
    case "dept_media":
      return "/portal/media";
    case "dept_marketing":
    case "dept_outreach":
    case "dept_oam":
    case "dept_content":
    case "dept_welfare":
      return "/portal/department";
    case "hr":
      return "/portal/hr";
    case "finance":
      return "/portal/finance";
    case "developer":
      return "/portal/developer";
    case "member":
      return "/portal/member";
    default:
      return "/portal/login";
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Attempt to restore user session on mount via HTTP-only cookie
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const savedUser = typeof window !== "undefined" ? localStorage.getItem("rekhta_user") : null;
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (isMounted) {
              setUser(parsed);
              setLoading(false); // Immediate unblock: instant navigation without full-page spinner
            }
          } catch {}
        }

        // Validate session with backend using bearer token and HTTP-only cookie
        const res = await fetchWithAuth("/auth/me");

        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            setSessionToken(data.token);
          }
          if (data?.user && isMounted) {
            setUser(data.user);
            if (typeof window !== "undefined") {
              localStorage.setItem("rekhta_user", JSON.stringify(data.user));
            }
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          clearSessionToken();
          if (typeof window !== "undefined") {
            localStorage.removeItem("rekhta_user");
            localStorage.removeItem("rekhta_active_dept");
          }
          if (isMounted) {
            setUser(null);
          }
        }
      } catch {
        // Controlled offline mode or network error: preserve cached session for UI
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const switchDepartment = useCallback(
    async (departmentNameOrCode: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetchWithAuth("/auth/switch-department", {
          method: "POST",
          body: JSON.stringify({ department: departmentNameOrCode }),
        });

        let data: any = null;
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : null;
        } catch {}

        if (!res.ok || !data?.success) {
          return {
            success: false,
            error: data?.error || (res.status === 403 ? "Department context switch unauthorized." : "Failed to switch department context."),
          };
        }

        if (data.token) {
          setSessionToken(data.token);
        }

        if (data.user) {
          setUser(data.user);
          if (typeof window !== "undefined") {
            localStorage.setItem("rekhta_user", JSON.stringify(data.user));
            localStorage.setItem("rekhta_active_dept", data.activeDepartment || "");
          }
        } else {
          setUser((prev) => {
            if (!prev) return null;
            const updated: PortalUser = {
              ...prev,
              activeDepartment: data.activeDepartment,
              activeDepartmentCode: data.activeDepartmentCode,
              activeRole: data.activeRole,
              activeDesignation: data.activeDesignation,
              activeRegion: data.activeRegion,
            };
            if (typeof window !== "undefined") {
              localStorage.setItem("rekhta_user", JSON.stringify(updated));
              localStorage.setItem("rekhta_active_dept", data.activeDepartment || "");
            }
            return updated;
          });
        }

        return { success: true };
      } catch {
        return { success: false, error: "Network error while switching department." };
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      setError(null);
      setLoading(true);

      const baseUrl = getApiBaseUrl();
      let res: Response;

      try {
        res = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        });
      } catch {
        // True network failure / unreachable backend
        const networkError = "Unable to connect to the authentication server. Please verify the backend is running and your connection is active.";
        setError(networkError);
        setLoading(false);
        return { success: false, error: networkError };
      }

      // Safe JSON / text extraction (never throw SyntaxError on non-JSON gateway responses)
      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      // Accurate HTTP status error classification (Phase 10J Section 2)
      if (!res.ok || !data?.success) {
        let errMsg: string;

        if (res.status === 401) {
          // HTTP 401 during login: invalid credentials or appropriate authentication rejection
          errMsg = data?.error || "Invalid credentials. Please verify your email and password.";
        } else if (res.status === 403) {
          // HTTP 403: permission, suspended account, or CSRF rejection with accurate explanation
          errMsg = data?.error || "Access forbidden. Your account may be suspended or lacks required permissions.";
        } else if (res.status === 429) {
          // HTTP 429: rate limit message
          errMsg = data?.error || "Too many login attempts from this IP address. Please try again after 15 minutes.";
        } else if (res.status >= 500 && res.status < 600) {
          // HTTP 5xx: server-side error
          errMsg = data?.error || `Authentication server error (HTTP ${res.status}). Please try again in a moment.`;
        } else if (data?.error) {
          errMsg = data.error;
        } else {
          // Unexpected response: generic authentication error
          errMsg = `Authentication error (HTTP ${res.status}). Please check your credentials and try again.`;
        }

        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }

      // Handle MFA requirement (TOTP verification pending)
      if (data.requireMfa) {
        setLoading(false);
        return {
          success: false,
          requireMfa: true,
          mfaToken: data.mfaToken,
        };
      }

      // Handle forced password change on initial login
      if (data.requirePasswordChange) {
        setLoading(false);
        return {
          success: false,
          requirePasswordChange: true,
          tempToken: data.tempToken,
        };
      }

      const authenticatedUser = data.user as PortalUser;
      setUser(authenticatedUser);

      if (data.token) {
        setSessionToken(data.token);
      }

      // Store user display profile in localStorage (session token kept strictly in-memory)
      if (typeof window !== "undefined") {
        localStorage.setItem("rekhta_user", JSON.stringify(authenticatedUser));
        if (authenticatedUser.activeDepartment) {
          localStorage.setItem("rekhta_active_dept", authenticatedUser.activeDepartment);
        }
      }

      setLoading(false);
      return { success: true, user: authenticatedUser };
    },
    []
  );

  const verifyMfa = useCallback(
    async (mfaToken: string, code?: string, recoveryCode?: string): Promise<LoginResult> => {
      setError(null);
      setLoading(true);

      const baseUrl = getApiBaseUrl();
      let res: Response;

      try {
        res = await fetch(`${baseUrl}/auth/mfa/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({ mfaToken, code, recoveryCode }),
        });
      } catch {
        const netErr = "Unable to connect to the authentication server. Please check your connection.";
        setError(netErr);
        setLoading(false);
        return { success: false, error: netErr };
      }

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        const errMsg =
          data?.error ||
          (res.status === 401
            ? "Invalid authentication code. Please check your authenticator app or backup code."
            : `MFA verification failed (HTTP ${res.status}).`);
        setError(errMsg);
        setLoading(false);
        return { success: false, error: errMsg };
      }

      // If initial password change is required
      if (data.requirePasswordChange) {
        setLoading(false);
        return {
          success: false,
          requirePasswordChange: true,
          tempToken: data.tempToken,
        };
      }

      // Successful MFA login with session tokens
      const authenticatedUser = data.user as PortalUser;
      setUser(authenticatedUser);

      if (data.token) {
        setSessionToken(data.token);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("rekhta_user", JSON.stringify(authenticatedUser));
        if (authenticatedUser.activeDepartment) {
          localStorage.setItem("rekhta_active_dept", authenticatedUser.activeDepartment);
        }
      }

      setLoading(false);
      return { success: true, user: authenticatedUser };
    },
    []
  );

  const changeInitialPassword = useCallback(
    async (tempToken: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
      setError(null);
      setLoading(true);

      const baseUrl = getApiBaseUrl();
      let res: Response;

      try {
        res = await fetch(`${baseUrl}/auth/change-initial-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({ tempToken, newPassword }),
        });
      } catch {
        const netErr = "Unable to connect to the authentication server. Please check your connection.";
        setError(netErr);
        setLoading(false);
        return { success: false, error: netErr };
      }

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      setLoading(false);

      if (!res.ok || !data?.success) {
        const errMsg =
          data?.error ||
          "Failed to update initial password. Ensure it meets complexity requirements (at least 10 characters).";
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      return { success: true };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetchWithAuth("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors during logout
    } finally {
      clearSessionToken();
      if (typeof window !== "undefined") {
        localStorage.removeItem("rekhta_user");
        localStorage.removeItem("rekhta_active_dept");
      }
      setUser(null);
      router.push("/portal/login");
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  const getDashboardRoute = useCallback((role?: string) => {
    return getDashboardForRole(role || user?.activeRole || user?.role);
  }, [user]);

  const memberships = useMemo(() => {
    return user?.memberships || [];
  }, [user]);

  const activeDepartment = useMemo(() => {
    return user?.activeDepartment || user?.department || (user?.memberships?.[0]?.department) || null;
  }, [user]);

  const activeDepartmentCode = useMemo(() => {
    return user?.activeDepartmentCode || user?.departmentCode || (user?.memberships?.[0]?.departmentCode) || null;
  }, [user]);

  const activeRole = useMemo(() => {
    return user?.activeRole || user?.role || (user?.memberships?.[0]?.role) || null;
  }, [user]);

  const activeDesignation = useMemo(() => {
    return user?.activeDesignation || user?.designation || (user?.memberships?.[0]?.designation) || null;
  }, [user]);

  const isEmergencyAccess = Boolean(user?.isEmergencyAccess);
  const emergencySession = user?.emergencySession || null;

  const endEmergencyAccess = useCallback(async () => {
    const baseUrl = getApiBaseUrl();
    try {
      await fetch(`${baseUrl}/emergency/end-session`, {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
    } catch {}

    clearSessionToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("rekhta_user");
      localStorage.removeItem("rekhta_active_dept");
      document.cookie = "rekhta_emergency_mode=; path=/; max-age=0";
    }
    setUser(null);
    router.push("/emergency-access");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        activeDepartment,
        activeDepartmentCode,
        activeRole,
        activeDesignation,
        memberships,
        isEmergencyAccess,
        emergencySession,
        endEmergencyAccess,
        switchDepartment,
        login,
        verifyMfa,
        changeInitialPassword,
        logout,
        clearError,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
