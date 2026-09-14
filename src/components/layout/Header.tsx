"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { Container } from "@/components/ui/Container";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Work", href: "/our-work" },
  { name: "Events", href: "/events" },
  { name: "Volunteer", href: "/volunteer" },
  { name: "Donate", href: "/donate" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100/60 py-4"
      }`}
    >
      <Container size="wide">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-full bg-brand-mint text-brand-emerald flex items-center justify-center transition-colors group-hover:bg-brand-emerald group-hover:text-white shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-brand-pitch text-lg sm:text-xl tracking-tight leading-none">
                Ta&apos;meer e Rekhta
              </span>
              <span className="urdu-text text-sm text-brand-green font-bold leading-tight mt-0.5">
                تعمیرِ ریختہ
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? "text-brand-emerald font-semibold"
                      : "text-gray-700 hover:text-brand-pitch hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-emerald rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              href="/volunteer"
              variant="primary"
              size="sm"
              className="px-5 py-2 text-xs font-semibold shadow-xs"
            >
              Join Us
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              href="/volunteer"
              variant="primary"
              size="sm"
              className="px-3.5 py-1.5 text-xs font-semibold"
            >
              Join Us
            </Button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-700 hover:text-brand-pitch hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={NAV_LINKS}
      />
    </header>
  );
};
