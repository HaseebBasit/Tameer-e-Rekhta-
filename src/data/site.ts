export interface SiteConfig {
  name: string;
  nameUrdu: string;
  tagline: string;
  taglineUrdu: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    city: string;
    country: string;
    instagramHandle: string;
    instagramUrl: string;
  };
  socialLinks: {
    name: string;
    href: string;
    icon: string;
  }[];
  donation: {
    jazzcash: {
      number: string;
      rawNumber: string;
      title: string;
    };
    easypaisa: {
      number: string;
      rawNumber: string;
      title: string;
    };
  };
}

export const siteConfig: SiteConfig = {
  name: "Ta'meer-e-Rekhta",
  nameUrdu: "تعمیرِ ریختہ",
  tagline: "Urdu Revival • Youth Leadership • Humanity",
  taglineUrdu: "آوازِ نو - رسمِ کہن",
  description:
    "Ta'meer-e-Rekhta is a passionate youth-led organization working for Urdu Revival, Youth Leadership Events & Welfare of Mankind in Pakistan. We believe in preserving our cultural identity while serving humanity with compassion.",
  contact: {
    email: "taameer.e.rekhta@gmail.com",
    phone: "+92 370 1972002",
    whatsapp: "+92 370 1972002",
    address: "Karachi, Pakistan",
    city: "Karachi",
    country: "Pakistan",
    instagramHandle: "@tameer_e_rekhta",
    instagramUrl: "https://instagram.com/tameer_e_rekhta",
  },
  socialLinks: [
    { name: "Instagram", href: "https://instagram.com/tameer_e_rekhta", icon: "Instagram" },
    { name: "Facebook", href: "https://facebook.com", icon: "Facebook" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "Linkedin" },
    { name: "WhatsApp", href: "https://wa.me/923701972002", icon: "MessageCircle" },
  ],
  donation: {
    jazzcash: {
      number: "0307-5615688",
      rawNumber: "03075615688",
      title: "Muhammad Ahmad",
    },
    easypaisa: {
      number: "0325-2790731",
      rawNumber: "03252790731",
      title: "Muhammad Ahmad",
    },
  },
};
