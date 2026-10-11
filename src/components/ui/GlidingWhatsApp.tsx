"use client";

import React, { useState } from "react";
import { siteConfig } from "@/data/site";

export const GlidingWhatsApp: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const whatsappNumber = siteConfig.donation.jazzcash.rawNumber; // 03075615688
  const internationalNumber = "92" + whatsappNumber.replace(/^0/, "");
  const defaultMessage = encodeURIComponent(
    "Assalam-o-Alaikum! I would like to get in touch with Ta'meer-e-Rekhta."
  );
  const whatsappUrl = `https://wa.me/${internationalNumber}?text=${defaultMessage}`;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gliding tooltip pill */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white text-gray-800 text-xs font-semibold shadow-lg border border-emerald-100 transition-all duration-300 transform ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-90 -translate-x-1 hover:translate-x-0"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Chat with us on WhatsApp</span>
      </a>

      {/* Floating Gliding Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Ta'meer-e-Rekhta on WhatsApp"
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:bg-[#20bd5a] transition-all duration-300 transform hover:scale-110 active:scale-95 animate-[glide_3s_ease-in-out_infinite]"
        style={{
          boxShadow: "0 10px 25px -5px rgba(37, 211, 102, 0.45)",
        }}
      >
        {/* Radar wave pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        {/* Official WhatsApp SVG Logo */}
        <svg
          className="w-7 h-7 fill-current relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.507 14.307l-.009.075c-2.399-1.2-2.882-1.352-3.32-1.298-.43.053-.941.597-1.157.843-.215.247-.43.275-.788.106-.358-.17-1.512-.558-2.879-1.777-1.065-.95-1.785-2.126-1.996-2.485-.212-.359-.022-.553.157-.731.162-.16.358-.415.538-.623.18-.208.24-.356.359-.594.119-.239.06-.447-.03-.624-.089-.178-.797-1.921-1.093-2.632-.288-.693-.58-.598-.797-.609-.206-.01-.443-.012-.68-.012-.238 0-.623.089-.95.446-.326.357-1.248 1.22-1.248 2.975 0 1.755 1.277 3.45 1.456 3.69.179.239 2.513 3.839 6.089 5.383.851.368 1.516.588 2.034.752.855.271 1.633.233 2.248.141.686-.103 2.11-.862 2.408-1.695.297-.833.297-1.547.208-1.696-.088-.148-.327-.238-.685-.417zM12.012 21.84c-1.786 0-3.535-.48-5.067-1.39l-.364-.216-3.763.987 1.004-3.666-.237-.377A9.799 9.799 0 0 1 2.2 12.04c0-5.424 4.41-9.835 9.833-9.835 2.628 0 5.099 1.025 6.957 2.884 1.858 1.86 2.88 4.33 2.878 6.96-.002 5.425-4.414 9.791-9.856 9.791zm0-18.34C6.54 3.5 2.054 7.986 2.054 13.457c0 1.95.566 3.767 1.547 5.305l-1.601 5.85 5.986-1.571a9.88 9.88 0 0 0 4.026.859c5.472 0 9.957-4.485 9.957-9.956 0-2.66-1.036-5.16-2.918-7.042C17.168 4.02 14.672 3.5 12.012 3.5z" />
        </svg>
      </a>
    </div>
  );
};
