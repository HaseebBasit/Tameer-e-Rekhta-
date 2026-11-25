import React from "react";
import { Sprout } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-brand-mint border-t-brand-emerald animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-brand-emerald">
          <Sprout className="w-6 h-6 animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-heading">
        Loading Ta&apos;meer-e-Rekhta...
      </p>
    </div>
  );
}
