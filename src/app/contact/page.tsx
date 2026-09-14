import React from "react";
import { Metadata } from "next";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact Us | Ta'meer-e-Rekhta",
  description:
    "Get in touch with Ta'meer-e-Rekhta. Reach out for volunteering inquiries, partnerships, event collaborations, or media coverage.",
};

export default function ContactPage() {
  const contactDetails = [
    {
      label: "Email",
      value: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      icon: Mail,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Phone",
      value: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phone}`,
      icon: Phone,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Location",
      value: siteConfig.contact.address,
      href: "#location-map",
      icon: MapPin,
      color: "text-teal-700 bg-teal-50 border-teal-200",
    },
    {
      label: "Instagram",
      value: siteConfig.contact.instagramHandle,
      href: siteConfig.contact.instagramUrl,
      icon: Instagram,
      color: "text-pink-700 bg-pink-50 border-pink-200",
    },
  ];

  return (
    <div className="py-10 sm:py-16 space-y-16">
      <Container size="wide">
        {/* Header matching visual guide */}
        <SectionHeading
          title="Get in Touch"
          description="We'd love to hear from you!"
          align="center"
        />

        {/* 2-Column Desktop Layout matching visual guide */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start max-w-5xl mx-auto">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-4">
              {contactDetails.map((item) => {
                const IconComponent = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="card-soft rounded-2xl p-4 sm:p-5 flex items-center gap-4 border border-gray-100 group transition-all"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.color}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {item.label}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-brand-pitch group-hover:text-brand-emerald transition-colors">
                        {item.value}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Quick summary note */}
            <div className="p-5 rounded-2xl bg-brand-mint/40 border border-brand-green/20 text-xs text-brand-dark leading-relaxed">
              <span className="font-bold block mb-1">Quick Response Guarantee</span>
              Our volunteer coordinators typically respond to inquiries and collaboration requests within 24 hours.
            </div>
          </div>

          {/* Right Column: Contact Form matching visual guide */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>

      {/* Dark Map / Location section matching visual guide */}
      <section id="location-map" className="bg-brand-pitch text-white py-16 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="wide">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 mx-auto flex items-center justify-center text-brand-lime shadow-lg">
              <MapPin className="w-7 h-7" />
            </div>

            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Karachi, Pakistan
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              Headquartered in Karachi with expanding volunteer outreach, food ration distribution, and youth chapters across Lahore, Hyderabad, and surrounding regions.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
