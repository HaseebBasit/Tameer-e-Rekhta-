"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function EmergencyAccessBanner() {
  const { user, isEmergencyAccess, emergencySession, endEmergencyAccess } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>("15:00");
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!isEmergencyAccess || !emergencySession?.expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = emergencySession.expiresAt - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        endEmergencyAccess();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isEmergencyAccess, emergencySession, endEmergencyAccess]);

  if (!isEmergencyAccess) {
    return null;
  }

  const handleEnd = async () => {
    setEnding(true);
    await endEmergencyAccess();
  };

  return (
    <div
      role="alert"
      className="bg-gradient-to-r from-red-700 via-red-800 to-amber-900 text-white px-4 py-2.5 shadow-md border-b-2 border-red-500 z-50 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
        </span>
        <div className="font-bold uppercase tracking-wider text-amber-200 shrink-0">
          Emergency Access Mode
        </div>
        <div className="hidden sm:inline-block text-gray-300">|</div>
        <div className="truncate text-gray-100">
          Target: <span className="font-semibold text-white">{user?.name}</span> ({user?.email}) &bull;{" "}
          <span className="text-amber-200 capitalize">{user?.role?.replace("dept_", "")}</span> &bull;{" "}
          <span className="text-gray-200">{user?.department || "General"}</span>
        </div>
        {emergencySession?.reason && (
          <div className="hidden md:inline-block text-xs text-red-200 truncate max-w-xs" title={emergencySession.reason}>
            &bull; Reason: &quot;{emergencySession.reason}&quot;
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="bg-black/40 px-2.5 py-1 rounded font-mono font-bold text-amber-300 tracking-wider">
          ⏳ {timeLeft}
        </div>
        <button
          onClick={handleEnd}
          disabled={ending}
          className="bg-white hover:bg-red-50 text-red-800 font-bold px-3 py-1 rounded text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {ending ? "Ending..." : "End Emergency Access"}
        </button>
      </div>
    </div>
  );
}
