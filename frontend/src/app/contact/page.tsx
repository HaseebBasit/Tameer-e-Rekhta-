import React from "react";
import { Metadata } from "next";
import { Mail, Phone, MessageCircle, Instagram, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/data/site";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Ta'meer-e-Rekhta",
  description:
    "Get in touch with Ta'meer-e-Rekhta for inquiries, volunteer partnerships, literary event collaborations, or humanitarian initiatives across Pakistan.",
};

export default function ContactPage() {
  const contactMethods = [
    {
      title: "Email Inquiries",
      value: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      icon: Mail,
      sublabel: "Our team typically responds within 24-48 hours",
    },
    {
      title: "Direct Calling",
      value: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, "")}`,
      icon: Phone,
      sublabel: "Available Monday - Saturday, 10am - 6pm PKT",
    },
    {
      title: "WhatsApp Helpline",
      value: siteConfig.contact.whatsapp,
      href: `https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`,
      icon: MessageCircle,
      sublabel: "Fastest response for volunteer & general queries",
    },
    {
      title: "Instagram",
      value: siteConfig.contact.instagramHandle,
      href: siteConfig.contact.instagramUrl,
      icon: Instagram,
      sublabel: "Follow daily campaign highlights and updates",
    },
  ];

  return (
    <div className="py-10 sm:py-16 space-y-16">
      <Container size="wide">
        {/* Header Section */}
        <SectionHeading
          title="Get in Touch"
          description="Have questions or want to collaborate? We'd love to hear from you."
          align="center"
        />

        {/* 2-Column Section matching visual guide */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Column: Direct Contact Info */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-heading font-extrabold text-xl text-brand-pitch mb-4">
              Contact Information
            </h3>

            <div className="space-y-4">
              {contactMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="card-soft rounded-2xl p-5 flex items-start gap-4 group block hover:border-brand-emerald/30 transition-all border border-gray-100"
                  >
                    <div className="w-12 h-12 rounded-xl bg-brand-mint text-brand-emerald flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-emerald group-hover:text-white">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {method.title}
                      </h4>
                      <p className="text-sm font-bold text-brand-pitch mt-0.5 group-hover:text-brand-emerald transition-colors">
                        {method.value}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {method.sublabel}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>

      {/* Dark Map / Location section */}
      <section id="location-map" className="bg-brand-pitch text-white py-16 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="wide">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 mx-auto flex items-center justify-center text-brand-lime shadow-lg">
              <MapPin className="w-7 h-7" />
            </div>

            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Karachi &amp; Bahawalpur, Pakistan
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              Headquartered in Karachi with dedicated volunteer teams, community food drives, and youth chapters active across Karachi, Bahawalpur, Lahore, and Islamabad.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
