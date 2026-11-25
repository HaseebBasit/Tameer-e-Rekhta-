"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { getDesignationDisplayName } from "@/lib/authorization";
import {
  LayoutDashboard,
  Building2,
  CheckSquare,
  Users,
  Briefcase,
  DollarSign,
  Award,
  ScrollText,
  FileText,
  Calendar,
  LogOut,
  ExternalLink,
  X,
  ClipboardList,
  UserPlus,
  Download,
  Megaphone,
  Receipt,
  CreditCard,
  PiggyBank,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  confidential?: boolean;
  isExternal?: boolean;
}

interface PortalSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function PortalSidebar({ mobileOpen, onCloseMobile }: PortalSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!user) return null;

  const role = user.role;
  const isSuperAdmin = role === "super_admin";
  const isDeptLead = role.startsWith("dept_");
  const isHR = role === "hr";
  const isFinance = role === "finance";
  const isMember = role === "member";

  // Build role-specific navigation items exactly matching REKHTA PORTAL 2
  const getNavItems = (): NavItem[] => {
    if (isSuperAdmin) {
      return [
        { label: "Executive Dashboard", href: "/portal/super-admin", icon: LayoutDashboard },
        { label: "User Directory", href: "/portal/super-admin?tab=users", icon: Users },
        { label: "Departments", href: "/portal/super-admin?tab=departments", icon: Building2 },
        { label: "Organization Tasks", href: "/portal/super-admin?tab=tasks", icon: CheckSquare },
        { label: "Leave Management", href: "/portal/super-admin?tab=leaves", icon: Calendar },
        { label: "HR Management", href: "/portal/hr", icon: Briefcase },
        { label: "Finance & Accounts", href: "/portal/finance", icon: DollarSign },
        { label: "Confidential Grading", href: "/portal/super-admin?tab=assessments", icon: Award, confidential: true },
        { label: "System Audit Logs", href: "/portal/super-admin?tab=audit", icon: ScrollText },
        { label: "Public Website", href: "/", icon: ExternalLink, isExternal: true },
      ];
    }

    if (isHR) {
      return [
        { label: "HR Overview", href: "/portal/hr", icon: LayoutDashboard },
        { label: "Account Provisioning", href: "/portal/hr?tab=accounts", icon: UserPlus },
        { label: "Candidate Pipeline", href: "/portal/hr?tab=recruitment", icon: ClipboardList },
        { label: "Campaigns & Openings", href: "/portal/hr?tab=campaigns", icon: Briefcase },
        { label: "Staff Directory", href: "/portal/hr?tab=employees", icon: Users },
        { label: "Leave Management", href: "/portal/hr?tab=leaves", icon: Calendar },
        { label: "Export HR Data", href: "/portal/hr?tab=export", icon: Download },
        { label: "Announcements", href: "/portal/hr?tab=announcements", icon: Megaphone },
        { label: "Public Website", href: "/", icon: ExternalLink, isExternal: true },
      ];
    }

    if (isFinance) {
      return [
        { label: "Finance Overview", href: "/portal/finance", icon: LayoutDashboard },
        { label: "Income & Donations", href: "/portal/finance?tab=income", icon: Receipt },
        { label: "Expense Claims", href: "/portal/finance?tab=expenses", icon: CreditCard },
        { label: "Department Budgets", href: "/portal/finance?tab=budgets", icon: PiggyBank },
        { label: "Financial Reports", href: "/portal/finance?tab=reports", icon: FileText },
        { label: "Public Website", href: "/", icon: ExternalLink, isExternal: true },
      ];
    }

    if (isDeptLead) {
      return [
        { label: "Department Overview", href: "/portal/department", icon: LayoutDashboard },
        { label: "Task Management", href: "/portal/department?tab=tasks", icon: CheckSquare },
        { label: "Team Members", href: "/portal/department?tab=members", icon: Users },
        { label: "Review Submissions", href: "/portal/department?tab=submissions", icon: ClipboardList },
        { label: "Department Leaves", href: "/portal/department?tab=leaves", icon: Calendar },
        { label: "Blind Assessment", href: "/portal/department?tab=assessment", icon: Award, confidential: true },
        { label: "Announcements", href: "/portal/department?tab=announcements", icon: Megaphone },
        { label: "Public Website", href: "/", icon: ExternalLink, isExternal: true },
      ];
    }

    // Default Member Navigation
    return [
      { label: "My Workspace", href: "/portal/member", icon: LayoutDashboard },
      { label: "Assigned Tasks", href: "/portal/member?tab=tasks", icon: CheckSquare },
      { label: "Leave Requests", href: "/portal/member?tab=leaves", icon: Calendar },
      { label: "Announcements", href: "/portal/member?tab=announcements", icon: Megaphone },
      { label: "Public Website", href: "/", icon: ExternalLink, isExternal: true },
    ];
  };

  const navItems = getNavItems();
  const currentTab = searchParams.get("tab");

  // Determine active item
  const isItemActive = (itemHref: string) => {
    if (itemHref === "/") return false;
    const [path, queryString] = itemHref.split("?");
    if (path !== pathname) return false;

    if (!queryString) {
      return !currentTab || currentTab === "overview";
    }

    const itemParams = new URLSearchParams(queryString);
    const itemTab = itemParams.get("tab");
    return itemTab === currentTab;
  };

  const roleDisplayName = (() => {
    if (isSuperAdmin) return "Super Admin";
    if (isHR) return "HR Portal";
    if (isFinance) return "Finance Officer";
    if (isDeptLead) return `${user.department || "Dept"} Head`;
    return "Member";
  })();

  const designationDisplay = getDesignationDisplayName(user.designation, user.role);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to end your portal session?")) {
      await logout();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#17243A] text-white border-r border-[#202B38] select-none">
      {/* Brand & Calligraphy Logo Header */}
      <div className="p-4 sm:p-5 border-b border-[#233550] flex flex-col items-center text-center relative shrink-0">
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#20314C] transition active:scale-95"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-14 h-14 rounded-full bg-white/10 p-1.5 mb-2 border border-[#D7A84B]/50 shadow-md flex items-center justify-center">
          <Image
            src="/images/logo-mark.png"
            alt="Ta'meer-e-Rekhta Logo"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>

        <div className="font-urdu text-2xl font-bold tracking-wider text-[#D7A84B] mb-0.5 leading-snug">
          تعمیرِ ریختہ
        </div>
        <div className="text-sm font-bold tracking-wide text-white">
          Tameer-e-Rekhta
        </div>
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5 font-medium">
          Literature • Culture • Community
        </div>

        {/* Role Pill */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-[#800F35] text-white border border-[#9F1239] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D7A84B]"></span>
          <span>{roleDisplayName}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

          if (item.isExternal) {
            return (
              <Link
                key={item.label}
                href={item.href}
                target="_blank"
                onClick={onCloseMobile}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:bg-[#20314C] hover:text-white transition-all duration-150"
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="flex-1 truncate">{item.label}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              scroll={false}
              onClick={onCloseMobile}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#800F35] text-white shadow-md shadow-[#800F35]/30 font-semibold ring-1 ring-[#D7A84B]/40"
                  : "text-slate-300 hover:bg-[#20314C] hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                  isActive ? "text-[#D7A84B]" : "text-slate-400"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.confidential && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-[#D7A84B] border border-amber-500/30">
                  LOCKED
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card at bottom */}
      <div className="p-3 border-t border-[#233550] bg-[#131E30] shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#17243A]/80 border border-[#233550]">
          <div className="w-9 h-9 rounded-full bg-[#800F35] text-white border border-[#D7A84B] flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{designationDisplay}</p>
          </div>
          <Link
            href="/"
            target="_blank"
            title="Public Website"
            className="p-1.5 text-slate-400 hover:text-[#D7A84B] hover:bg-[#20314C] rounded transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            title="Sign Out Session"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Pinned Sidebar */}
      <aside className="hidden md:flex w-64 h-full shrink-0 flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-in Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
