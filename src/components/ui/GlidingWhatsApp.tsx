"use client";

import React, { useState } from "react";
import { siteConfig } from "@/data/site";

export const GlidingWhatsApp: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  // Extract digits for wa.me format (e.g., "923701972002")
  const rawNumber = siteConfig.contact.whatsapp.replace(/[^0-9]/g, "") || "923701972002";
  const defaultMessage = encodeURIComponent(
    "Assalam-o-Alaikum! I would like to get in touch with Ta'meer-e-Rekhta."
  );
  const whatsappUrl = `https://wa.me/${rawNumber}?text=${defaultMessage}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gliding tooltip pill */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`hidden sm:inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white text-gray-800 text-xs font-semibold shadow-xl border border-emerald-100 transition-all duration-300 transform hover:shadow-2xl hover:border-emerald-300 ${
          isHovered
            ? "opacity-100 translate-x-0 scale-100"
            : "opacity-90 -translate-x-1 hover:translate-x-0"
        }`}
        aria-label="Chat on WhatsApp"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-gray-700 font-semibold tracking-wide">
          Chat with us on WhatsApp
        </span>
      </a>

      {/* Floating Gliding Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Ta'meer-e-Rekhta on WhatsApp"
        className="relative group flex items-center justify-center w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#20bd5a] to-[#25D366] text-white shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:from-[#1eb856] hover:to-[#22c75e] transition-all duration-300 transform hover:scale-110 active:scale-95 animate-glide"
        style={{
          boxShadow: "0 10px 25px -4px rgba(37, 211, 102, 0.5), 0 4px 10px -2px rgba(37, 211, 102, 0.3)",
        }}
      >
        {/* Radar wave pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping opacity-60 pointer-events-none" />

        {/* Clean Official WhatsApp SVG Logo */}
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white relative z-10 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM17.63 15.68C17.4 16.33 16.32 16.92 15.78 17C15.29 17.07 14.67 17.1 12.54 16.22C9.82 15.09 8.06 12.33 7.92 12.15C7.79 11.97 6.8 10.65 6.8 9.29C6.8 7.93 7.49 7.27 7.77 6.98C7.99 6.75 8.35 6.65 8.67 6.65C8.77 6.65 8.87 6.65 8.95 6.66C9.21 6.67 9.34 6.69 9.51 7.1C9.72 7.61 10.23 8.86 10.29 8.99C10.36 9.12 10.41 9.29 10.32 9.47C10.24 9.65 10.18 9.73 10.05 9.88C9.92 10.03 9.8 10.14 9.66 10.31C9.51 10.47 9.36 10.64 9.53 10.93C9.7 11.21 10.29 12.17 11.15 12.94C12.26 13.93 13.17 14.25 13.49 14.38C13.74 14.48 14.03 14.46 14.21 14.27C14.44 14.02 14.73 13.61 15.02 13.2C15.22 12.91 15.48 12.87 15.74 12.97C16.01 13.06 17.44 13.77 17.73 13.92C18.03 14.06 18.22 14.14 18.29 14.26C18.36 14.38 18.36 14.94 17.63 15.68Z"
            fill="currentColor"
          />
        </svg>
      </a>
    </div>
  );
};
