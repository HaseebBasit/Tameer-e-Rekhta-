export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "founder",
    name: "Haseeb Basit",
    role: "Founder",
    bio: "Passionate about youth mobilization, cultural preservation, and grassroots humanitarian welfare in Pakistan.",
    image: "/images/volunteers.jpg",
    linkedin: "https://linkedin.com",
    email: "tameerekhta@gmail.com",
  },
  {
    id: "co-founder",
    name: "Hamza Ahmed",
    role: "Co-Founder",
    bio: "Dedicated organizer spearheading youth leadership programs and educational mentorship workshops.",
    image: "/images/youth_lead.jpg",
    linkedin: "https://linkedin.com",
    email: "tameerekhta@gmail.com",
  },
  {
    id: "general-secretary",
    name: "Zainab Fatima",
    role: "General Secretary",
    bio: "Managing organizational operations, inter-city chapters, and community volunteer engagement.",
    image: "/images/volunteers.jpg",
    linkedin: "https://linkedin.com",
    email: "tameerekhta@gmail.com",
  },
  {
    id: "media-head",
    name: "Bilal Tariq",
    role: "Media Head",
    bio: "Leading creative storytelling, Urdu cultural content creation, photography, and digital campaigns.",
    image: "/images/food_drive.jpg",
    linkedin: "https://linkedin.com",
    email: "tameerekhta@gmail.com",
  },
  {
    id: "event-head",
    name: "Usman Raza",
    role: "Event Head",
    bio: "Coordinating logistical operations for food drives, mushairas, and youth leadership summits.",
    image: "/images/orphanage.jpg",
    linkedin: "https://linkedin.com",
    email: "tameerekhta@gmail.com",
  },
  {
    id: "volunteer-head",
    name: "Ayesha Noor",
    role: "Volunteer Head",
    bio: "Welcoming, interviewing, and mentoring passionate young volunteers joining our humanitarian mission.",
    image: "/images/volunteers.jpg",
    linkedin: "https://linkedin.com",
    email: "tameerekhta@gmail.com",
  },
];
