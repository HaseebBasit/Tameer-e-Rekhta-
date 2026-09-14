"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: { name: string; href: string }[];
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navLinks,
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Portals need a browser document, so only render after mount (avoids SSR mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-mint text-brand-emerald flex items-center justify-center font-bold text-lg">
              🌱
            </span>
            <div>
              <span className="font-heading font-bold text-brand-pitch text-sm block">
                Ta&apos;meer-e-Rekhta
              </span>
              <span className="urdu-text text-xs text-brand-green leading-none block">
                تعمیرِ ریختہ
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-emerald"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-mint text-brand-dark font-semibold shadow-xs"
                    : "text-gray-700 hover:bg-gray-50 hover:text-brand-dark"
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-gray-100 space-y-3 bg-gray-50/50">
          <Button
            href="/volunteer"
            variant="primary"
            size="md"
            className="w-full justify-center"
            icon={<Heart className="w-4 h-4" />}
            iconPosition="left"
            onClick={onClose}
          >
            Join Us
          </Button>

          <Button
            href="/donate"
            variant="secondary"
            size="md"
            className="w-full justify-center text-xs"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onClose}
          >
            Support Our Mission
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};