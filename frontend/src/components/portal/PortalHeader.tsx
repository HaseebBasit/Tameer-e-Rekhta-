"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDesignationDisplayName } from "@/lib/authorization";
import { API_BASE } from "@/lib/api";
import {
  Search,
  Bell,
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  CheckSquare,
  Users,
  DollarSign,
  Award,
  ScrollText,
  Calendar,
  FileText,
  Briefcase,
  Check,
} from "lucide-react";

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

interface SearchShortcut {
  title: string;
  category: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const SEARCH_SHORTCUTS: SearchShortcut[] = [
  { title: "Executive Overview", category: "Administration", href: "/portal/super-admin", icon: LayoutDashboard, roles: ["super_admin"] },
  { title: "User Directory", category: "Administration", href: "/portal/super-admin?tab=users", icon: Users, roles: ["super_admin"] },
  { title: "Organization Tasks", category: "Administration", href: "/portal/super-admin?tab=tasks", icon: CheckSquare, roles: ["super_admin"] },
  { title: "Confidential Grading", category: "Administration", href: "/portal/super-admin?tab=assessments", icon: Award, roles: ["super_admin"] },
  { title: "System Audit Logs", category: "Administration", href: "/portal/super-admin?tab=audit", icon: ScrollText, roles: ["super_admin"] },
  { title: "HR Dashboard", category: "Human Resources", href: "/portal/hr", icon: LayoutDashboard, roles: ["hr", "super_admin"] },
  { title: "Candidate Pipeline", category: "Human Resources", href: "/portal/hr?tab=recruitment", icon: Users, roles: ["hr", "super_admin"] },
  { title: "Recruitment Campaigns", category: "Human Resources", href: "/portal/hr?tab=campaigns", icon: Briefcase, roles: ["hr", "super_admin"] },
  { title: "Staff Directory", category: "Human Resources", href: "/portal/hr?tab=employees", icon: Users, roles: ["hr", "super_admin"] },
  { title: "Leave Approvals", category: "Human Resources", href: "/portal/hr?tab=leaves", icon: Calendar, roles: ["hr", "super_admin"] },
  { title: "Finance & Accounts", category: "Finance", href: "/portal/finance", icon: DollarSign, roles: ["finance", "super_admin"] },
  { title: "Income & Donations", category: "Finance", href: "/portal/finance?tab=income", icon: DollarSign, roles: ["finance", "super_admin"] },
  { title: "Expense Claims", category: "Finance", href: "/portal/finance?tab=expenses", icon: CheckSquare, roles: ["finance", "super_admin"] },
  { title: "Department Budgets", category: "Finance", href: "/portal/finance?tab=budgets", icon: DollarSign, roles: ["finance", "super_admin"] },
  { title: "Department Workspace", category: "Department", href: "/portal/department", icon: LayoutDashboard },
  { title: "Department Tasks", category: "Department", href: "/portal/department?tab=tasks", icon: CheckSquare },
  { title: "Team Members", category: "Department", href: "/portal/department?tab=members", icon: Users },
  { title: "Review Submissions", category: "Department", href: "/portal/department?tab=submissions", icon: FileText },
  { title: "My Workspace", category: "Member Workspace", href: "/portal/member", icon: LayoutDashboard },
  { title: "Assigned Deliverables", category: "Member Workspace", href: "/portal/member?tab=tasks", icon: CheckSquare },
  { title: "Request Leave of Absence", category: "Member Workspace", href: "/portal/member?tab=leaves", icon: Calendar },
];

export function PortalHeader({ onOpenMobileSidebar }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState<number>(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: "GET",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount ?? data.notifications.filter((n: any) => !n.read).length);
        }
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: "PATCH",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const markSingleRead = async (id: string, link?: string) => {
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        credentials: "include",
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        setShowDropdown(false);
        router.push(link);
      }
    } catch {}
  };

  // Filter searchable items
  const filteredShortcuts = SEARCH_SHORTCUTS.filter((s) => {
    if (s.roles && user?.role && !s.roles.includes(user.role)) return false;
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(query) || s.category.toLowerCase().includes(query);
  }).slice(0, 8);

  const handleSelectShortcut = (href: string) => {
    router.push(href);
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev + 1) % (filteredShortcuts.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev <= 0 ? filteredShortcuts.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredShortcuts[activeSearchIndex]) {
        handleSelectShortcut(filteredShortcuts[activeSearchIndex].href);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const designationDisplay = getDesignationDisplayName(user?.designation, user?.role);

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)] shrink-0">
      {/* Left side: Mobile Hamburger Button & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg min-w-0" ref={searchContainerRef}>
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-[#800F35] hover:bg-slate-100 rounded-lg transition active:scale-95"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Bar with live search dropdown */}
        <div className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search portal, actions, pages..."
            value={searchTerm}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
              setActiveSearchIndex(0);
            }}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-[#F8F9FA] border border-slate-200 rounded-lg focus:outline-none focus:border-[#800F35] focus:bg-white focus:ring-1 focus:ring-[#800F35]/20 transition placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Live Search Quick Actions Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden animate-in fade-in duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                <span>Quick Navigation</span>
                <span className="text-[10px] text-slate-400 font-normal">Press Enter ↵ to open</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
                {filteredShortcuts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No portal section found matching &ldquo;{searchTerm}&rdquo;
                  </div>
                ) : (
                  filteredShortcuts.map((s, idx) => {
                    const Icon = s.icon;
                    const isSelected = idx === activeSearchIndex;
                    return (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => handleSelectShortcut(s.href)}
                        onMouseEnter={() => setActiveSearchIndex(idx)}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition ${
                          isSelected ? "bg-[#FDF2F4] text-[#800F35]" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                              isSelected ? "bg-[#800F35] text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{s.title}</p>
                            <span className="text-[10px] text-slate-400 block">{s.category}</span>
                          </div>
                        </div>
                        <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#800F35]" : "text-slate-300"}`} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Department Name Indicator */}
        {user?.department && (
          <span className="hidden xl:inline-flex text-xs px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#17243A] font-semibold border border-slate-200">
            {user.department}
          </span>
        )}

        {/* Notifications Bell */}
        <div className="relative" ref={notificationContainerRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-slate-600 hover:text-[#800F35] hover:bg-slate-100 rounded-lg transition active:scale-95"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#800F35] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#800F35] text-white font-bold">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#800F35] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => {
                    const notifId = n._id || n.id;
                    const isRead = Boolean(n.read || n.isRead);
                    return (
                      <div
                        key={notifId}
                        onClick={() => markSingleRead(notifId, n.link)}
                        className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer ${
                          !isRead ? "bg-[#FDF2F4]/60 border-l-2 border-[#800F35]" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-semibold ${!isRead ? "text-[#800F35]" : "text-slate-800"}`}>
                            {n.title}
                          </p>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#800F35] shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Profile */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 rounded-lg p-1">
          <div className="w-8 h-8 rounded-full bg-[#800F35] text-white flex items-center justify-center text-xs font-bold uppercase border border-[#D7A84B] shadow-xs shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block text-left max-w-[120px] lg:max-w-[160px]">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight truncate">{designationDisplay}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
