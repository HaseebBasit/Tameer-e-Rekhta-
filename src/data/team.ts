export interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: "founder" | "president" | "core";
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
  phone?: string;
}

export const founderMember: TeamMember = {
  id: "founder",
  name: "Zoraiz Ali",
  role: "Founder",
  category: "founder",
  bio: "Visionary founder of Ta'meer-e-Rekhta, dedicated to reviving the Urdu language, nurturing youth leadership, and driving humanitarian welfare across Pakistan.",
  image: "/images/team/zoraiz-ali.jpg",
  email: "taameer.e.rekhta@gmail.com",
};

export const presidentMember: TeamMember = {
  id: "president",
  name: "Hafsa Arif",
  role: "President",
  category: "president",
  bio: "Leading executive operations and organizational strategy, championing youth empowerment initiatives, community welfare drives, and cultural enrichment.",
  image: "/images/team/hafsa-arif.jpg",
  email: "taameer.e.rekhta@gmail.com",
};

export const coreTeamMembers: TeamMember[] = [
  {
    id: "finance-head",
    name: "Ahmad Maqsood",
    role: "Head of Finance",
    category: "core",
    bio: "Overseeing financial transparency, resource allocation, and budget stewardship for all welfare and youth campaigns.",
    image: "/images/team/ahmad-maqsood.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
  {
    id: "marketing-head",
    name: "Ahmad Raza Waseem",
    role: "Head of Marketing Department",
    category: "core",
    bio: "Directing outreach strategies, brand communication, digital storytelling, and public awareness campaigns.",
    image: "/images/team/ahmad-raza-waseem.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
  {
    id: "welfare-punjab-head",
    name: "Asfand Yar Karimi",
    role: "Head of Welfare Department (Punjab)",
    category: "core",
    bio: "Spearheading grassroots humanitarian operations, emergency relief, and community welfare programs across Punjab.",
    image: "/images/team/asfand-yar-karimi.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
  {
    id: "welfare-sindh-head",
    name: "Daniyal Asim",
    role: "Head of Welfare Department (Sindh)",
    category: "core",
    bio: "Leading food ration distribution, educational support, and rapid relief initiatives throughout Sindh province.",
    image: "/images/team/daniyal-asim.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
  {
    id: "literature-head",
    name: "Noor-ul-Huda",
    role: "Head of Literature Department",
    category: "core",
    bio: "Curating Urdu literary circles, mushairas, youth writing workshops, and cultural preservation sessions.",
    image: "/images/team/noor-ul-huda.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
  {
    id: "coordination-incharge",
    name: "Saima Fatima",
    role: "Co-ordination In-Charge",
    category: "core",
    bio: "Managing cross-departmental alignment, volunteer mobilization, and internal team synchronization.",
    image: "/images/team/saima-fatima.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
  {
    id: "media-head",
    name: "Salman Mallana",
    role: "Head of Media",
    category: "core",
    bio: "Leading creative visual media, event photography, multimedia content, and digital broadcasting.",
    image: "/images/team/salman-mallana.jpg",
    email: "taameer.e.rekhta@gmail.com",
  },
];

// Combined list for general usage
export const teamMembers: TeamMember[] = [
  founderMember,
  presidentMember,
  ...coreTeamMembers,
];
