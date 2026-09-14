import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const viewport: Viewport = {
  themeColor: "#143022",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tameererekhta.org"),
  title: "Ta'meer-e-Rekhta | Reviving Urdu, Empowering Youth, Serving Humanity",
  description:
    "Ta'meer-e-Rekhta is a passionate youth-led organization working for Urdu Revival, Youth Leadership Events & Welfare of Mankind in Pakistan.",
  keywords: [
    "Ta'meer e Rekhta",
    "Urdu Revival",
    "Youth Leadership Pakistan",
    "Serving Humanity",
    "NGO Pakistan",
    "Food Drives Karachi",
    "Orphanage Support Pakistan",
  ],
  authors: [{ name: "Ta'meer-e-Rekhta" }],
  openGraph: {
    title: "Ta'meer-e-Rekhta | Reviving Urdu, Empowering Youth, Serving Humanity",
    description:
      "A youth-led organization for Urdu Revival, Youth Leadership & Welfare of Mankind in Pakistan.",
    url: "https://tameererekhta.org",
    siteName: "Ta'meer-e-Rekhta",
    images: [
      {
        url: "/images/hero_sprout.jpg",
        width: 1200,
        height: 630,
        alt: "Ta'meer-e-Rekhta - Plant seedling sprouting in caring hands",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ta'meer-e-Rekhta | Urdu Revival • Youth Leadership • Humanity",
    description:
      "A youth-led organization for Urdu Revival, Youth Leadership & Welfare of Mankind in Pakistan.",
    images: ["/images/hero_sprout.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-brand-cream text-gray-900 flex flex-col min-h-screen antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
