export interface SiteConfig {
  name: string;
  nameUrdu: string;
  tagline: string;
  taglineUrdu: string;
  description: string;
  contact: {
    email: string;
    phone: string;
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
    accountTitle: string;
    easypaisa: {
      number: string;
      title: string;
    };
    jazzcash: {
      number: string;
      title: string;
    };
    bank: {
      name: string;
      accountTitle: string;
      accountNumber: string;
      iban: string;
      branchCode: string;
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
    email: "tameerekhta@gmail.com",
    phone: "0312-3456789",
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
    { name: "WhatsApp", href: "https://wa.me/923123456789", icon: "MessageCircle" },
  ],
  donation: {
    accountTitle: "Ta'meer-e-Rekhta Welfare Fund",
    easypaisa: {
      number: "0312-3456789",
      title: "Ta'meer-e-Rekhta",
    },
    jazzcash: {
      number: "0312-3456789",
      title: "Ta'meer-e-Rekhta",
    },
    bank: {
      name: "Meezan Bank Ltd",
      accountTitle: "Ta'meer-e-Rekhta Welfare Society",
      accountNumber: "0102-0105829103",
      iban: "PK72MEZN0001020105829103",
      branchCode: "0102",
    },
  },
};
