"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";

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
    | "dept_content"
    | "hr"
    | "finance"
    | "member";
  department?: string | null;
  departmentCode?: string | null;
  designation?: string | null;
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
    case "dept_content":
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
        }

        setLoading(false);
        return { success: true, user: authenticatedUser };
      } catch (err: unknown) {
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
      }
      setUser(null);
      router.push("/portal/login");
    }
  }, [router]);

  const clearError = useCallback(() => setError(null), []);

  const getDashboardRoute = useCallback((role?: string) => {
    return getDashboardForRole(role || user?.role);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
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
