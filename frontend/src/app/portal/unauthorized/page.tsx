"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
  const { user, getDashboardRoute } = useAuth();
  const userRole = user?.role || "guest";
  const dashboardRoute = user ? getDashboardRoute(userRole) : "/portal/login";

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-red-50/30 via-brand-cream/50 to-white">
      <div className="max-w-md w-full text-center space-y-6 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-xl border border-red-100">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100/80 text-red-800 uppercase tracking-wider">
            HTTP 403 Forbidden
          </span>
          <h1 className="mt-3 text-2xl font-bold font-heading text-brand-pitch">
            Access Restricted
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            You do not possess the required authorization or department scope to view this management portal resource.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-1">
          <p className="text-gray-500 font-medium">Session Identity:</p>
          <p className="text-gray-800 font-semibold font-mono">
            {user ? `${user.name} (${user.email})` : "Unauthenticated"}
          </p>
          <p className="text-gray-500">
            Assigned Role: <span className="font-semibold text-brand-pitch capitalize">{userRole.replace(/_/g, " ")}</span>
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {user ? (
            <Link
              href={dashboardRoute}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-emerald hover:bg-brand-pitch transition-all"
            >
              Return to My Authorized Dashboard
            </Link>
          ) : (
            <Link
              href="/portal/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-emerald hover:bg-brand-pitch transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Authorized Account
            </Link>
          )}

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Back to Public Website
          </Link>
        </div>

        <p className="text-2xs text-gray-400">
          If you believe this is an administrative scoping error, please contact the Super Admin or Portal Lead.
        </p>
      </div>
    </div>
  );
}
