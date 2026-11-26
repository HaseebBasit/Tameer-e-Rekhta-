"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { EmergencyAccessBanner } from "@/components/portal/EmergencyAccessBanner";

const PUBLIC_PORTAL_ROUTES = [
  "/portal/login",
  "/portal/forgot-password",
  "/portal/reset-password",
  "/portal/activate",
  "/portal/unauthorized",
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isPublicAuthPage = PUBLIC_PORTAL_ROUTES.includes(pathname);

  // Authentication check for protected portal pages
  useEffect(() => {
    if (!loading && !user && !isPublicAuthPage) {
      router.push("/portal/login");
    }
  }, [user, loading, isPublicAuthPage, router]);

  // If visiting a public auth page (login, forgot-password, etc.), render directly
  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#800F35] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#17243A]">Loading Tameer-e-Rekhta Portal...</p>
        </div>
      </div>
    );
  }

  // Fallback if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#F6F7FA]">
      {/* Pinned Desktop Sidebar & Mobile Slide-in Drawer */}
      <PortalSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area with Header and Scrollable Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <EmergencyAccessBanner />
        <PortalHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
