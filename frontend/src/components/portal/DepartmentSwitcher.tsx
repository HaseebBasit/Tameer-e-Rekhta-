"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, ChevronDown, Check, Loader2 } from "lucide-react";

export function DepartmentSwitcher() {
  const { user, activeDepartment, memberships, switchDepartment } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSuperAdmin = user?.role === "super_admin";
  const hasMultipleMemberships = memberships && memberships.length > 1;

  // Only render switcher if user has multiple memberships or is Super Admin
  if (!isSuperAdmin && !hasMultipleMemberships) {
    return null;
  }

  // Super Admin can switch between any of the 6 official departments
  const superAdminOptions: Array<{
    department: string;
    departmentCode: string;
    designation: string;
    region?: "Punjab" | "Sindh" | "National" | null;
  }> = [
    { department: "Literature", departmentCode: "LIT", designation: "System Administration", region: null },
    { department: "Content Creation", departmentCode: "CON", designation: "System Administration", region: null },
    { department: "Outreach and Marketing", departmentCode: "OAM", designation: "System Administration", region: null },
    { department: "Media", departmentCode: "MED", designation: "System Administration", region: null },
    { department: "HR", departmentCode: "HR", designation: "System Administration", region: null },
    { department: "Welfare", departmentCode: "WEL", designation: "System Administration", region: null },
  ];

  const availableOptions = isSuperAdmin ? superAdminOptions : memberships;

  const currentDeptName = activeDepartment || user?.department || availableOptions[0]?.department || "Department";

  const handleSelect = async (deptName: string) => {
    if (deptName === currentDeptName) {
      setIsOpen(false);
      return;
    }

    try {
      setSwitching(true);
      setErrorMsg(null);
      const res = await switchDepartment(deptName);
      if (!res.success) {
        setErrorMsg(res.error || "Context switch denied.");
      } else {
        setIsOpen(false);
      }
    } catch {
      setErrorMsg("Failed to switch context.");
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition border border-slate-200 shadow-2xs disabled:opacity-50"
        title="Switch Department Context"
      >
        <Building2 className="w-3.5 h-3.5 text-[#800F35]" />
        <span className="max-w-[120px] sm:max-w-[160px] truncate">{currentDeptName}</span>
        {switching ? (
          <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Select Active Department
          </div>

          {errorMsg && (
            <div className="px-3 py-1 text-xs text-rose-600 bg-rose-50 border-b border-rose-100">
              {errorMsg}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto py-1">
            {availableOptions.map((opt) => {
              const isSelected = (opt.department || "").toLowerCase() === currentDeptName.toLowerCase();
              return (
                <button
                  key={opt.department}
                  type="button"
                  onClick={() => handleSelect(opt.department)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                    isSelected ? "bg-[#FDF2F4] text-[#800F35] font-bold" : "text-slate-700"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{opt.department}</span>
                    {opt.designation && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        {opt.designation} {opt.region ? `(${opt.region})` : ""}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#800F35] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
