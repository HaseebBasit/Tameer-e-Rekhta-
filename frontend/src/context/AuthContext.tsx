"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

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
  switchDepartment: (departmentNameOrCode: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: PortalUser }>;
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
    case "dept_media":
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

        // Validate session with backend using HTTP-only cookie in background
        const res = await fetch(`${API_BASE}/auth/me`, {
          method: "GET",
          headers: { "X-Requested-With": "XMLHttpRequest" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user && isMounted) {
            setUser(data.user);
            if (typeof window !== "undefined") {
              localStorage.setItem("rekhta_user", JSON.stringify(data.user));
            }
          }
        } else if (res.status === 401) {
          // Token expired or invalid
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
        const res = await fetch(`${API_BASE}/auth/switch-department`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({ department: departmentNameOrCode }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          return {
            success: false,
            error: data?.error || "Failed to switch department context. Authorization denied.",
          };
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
    async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: PortalUser }> => {
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data?.error || "Login failed. Please check your credentials.";
          setError(errMsg);
          setLoading(false);
          return { success: false, error: errMsg };
        }

        const authenticatedUser = data.user as PortalUser;
        setUser(authenticatedUser);

        // Store only user display profile in localStorage (tokens remain in HTTP-only cookies)
        if (typeof window !== "undefined") {
          localStorage.setItem("rekhta_user", JSON.stringify(authenticatedUser));
          if (authenticatedUser.activeDepartment) {
            localStorage.setItem("rekhta_active_dept", authenticatedUser.activeDepartment);
          }
        }

        setLoading(false);
        return { success: true, user: authenticatedUser };
      } catch {
        const networkError = "Unable to connect to the authentication server. Please verify the backend is running.";
        setError(networkError);
        setLoading(false);
        return { success: false, error: networkError };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
    } catch {
      // Ignore network errors during logout
    } finally {
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
        switchDepartment,
        login,
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
