import React from "react";
import Link from "next/link";
import {
  Sprout,
  Utensils,
  HeartHandshake,
  GraduationCap,
  Users,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
  Heart,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/site";

export const Footer: React.FC = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Work", href: "/our-work" },
    { name: "Events", href: "/events" },
    { name: "Volunteer", href: "/volunteer" },
    { name: "Gallery", href: "/gallery" },
    { name: "Donate / Support", href: "/donate" },
    { name: "Contact", href: "/contact" },
  ];

  const initiatives = [
    { name: "Food Drives", href: "/our-work", icon: Utensils },
    { name: "Orphanage Visits", href: "/our-work", icon: HeartHandshake },
    { name: "Youth Leadership", href: "/our-work", icon: GraduationCap },
    { name: "Community Welfare", href: "/our-work", icon: Users },
  ];

  return (
    <footer className="bg-brand-pitch text-white pt-16 pb-12 border-t border-brand-charcoal">
      <Container size="wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-emerald/20 border border-brand-emerald/40 text-brand-lime flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-white text-xl tracking-tight leading-none">
                  Ta&apos;meer e Rekhta
                </span>
                <span className="urdu-text text-sm text-brand-lime font-bold leading-tight mt-0.5">
                  تعمیرِ ریختہ
                </span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              An organization for Urdu Revival, Youth Leadership Events & Welfare of Mankind in Pakistan.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-emerald hover:border-brand-emerald transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-emerald hover:border-brand-emerald transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-emerald hover:border-brand-emerald transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/923123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-emerald hover:border-brand-emerald transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-brand-lime transition-colors inline-block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Initiatives */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200">
              Our Initiatives
            </h4>
            <ul className="space-y-3 text-sm">
              {initiatives.map((init) => {
                const IconComponent = init.icon;
                return (
                  <li key={init.name}>
                    <Link
                      href={init.href}
                      className="group flex items-center gap-2.5 text-gray-400 hover:text-brand-lime transition-colors"
                    >
                      <span className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-brand-emerald group-hover:text-brand-lime group-hover:bg-brand-emerald/20 transition-all">
                        <IconComponent className="w-3.5 h-3.5" />
                      </span>
                      <span>{init.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-gray-400">
                Contact: <span className="text-gray-300">{siteConfig.contact.email}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Location: <span className="text-gray-300">{siteConfig.contact.address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; 2026 Ta&apos;meer-e-Rekhta, All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Designed by</span>
            <span>Haseeb Basit</span>
          </p>
        </div>
      </Container>
    </footer>
  );
};
