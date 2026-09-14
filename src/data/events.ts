export interface EventItem {
  id: string;
  slug: string;
  day: string;
  month: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  venue: string;
  time: string;
  category: "Welfare" | "Literature" | "Social" | "Leadership";
  image: string;
  isUpcoming: boolean;
  registrationOpen: boolean;
}

export const eventsData: EventItem[] = [
  {
    id: "event-1",
    slug: "food-drive-aug-25",
    day: "25",
    month: "AUG",
    year: "2026",
    title: "Food Drive",
    subtitle: "Let's feed the hungry and bring smiles.",
    description:
      "Join our volunteers as we distribute over 500 packed nutritious meals and clean drinking water to daily wage earners and families in need.",
    location: "Karachi",
    venue: "District East & Central Karachi",
    time: "4:00 PM – 7:30 PM",
    category: "Welfare",
    image: "/images/food_drive.jpg",
    isUpcoming: true,
    registrationOpen: true,
  },
  {
    id: "event-2",
    slug: "urdu-literature-session-sep-10",
    day: "10",
    month: "SEP",
    year: "2026",
    title: "Urdu Literature Session",
    subtitle: "A session to promote Urdu literature and poetry.",
    description:
      "An enchanting evening exploring classic Urdu prose, modern ghazal recitation, and open mic for young writers and poets celebrating our linguistic heritage.",
    location: "Karachi",
    venue: "Arts Council & Rekhta Youth Hall, Karachi",
    time: "5:00 PM – 8:00 PM",
    category: "Literature",
    image: "/images/hero_sprout.jpg",
    isUpcoming: true,
    registrationOpen: true,
  },
  {
    id: "event-3",
    slug: "orphanage-visit-sep-20",
    day: "20",
    month: "SEP",
    year: "2026",
    title: "Orphanage Visit",
    subtitle: "Spending quality time with children.",
    description:
      "A joyful day filled with storytelling, painting workshops, stationary kit distribution, and indoor sports with the children of Anis Shelter Home.",
    location: "Karachi",
    venue: "Anis Children Shelter, Gulshan, Karachi",
    time: "10:00 AM – 2:00 PM",
    category: "Social",
    image: "/images/orphanage.jpg",
    isUpcoming: true,
    registrationOpen: true,
  },
  {
    id: "event-4",
    slug: "youth-leadership-workshop-oct-05",
    day: "05",
    month: "OCT",
    year: "2026",
    title: "Youth Leadership Workshop",
    subtitle: "Empowering youth for a better tomorrow.",
    description:
      "Interactive youth leadership seminar covering emotional intelligence, collaborative teamwork, public discourse, and ethical social activism.",
    location: "Karachi",
    venue: "Youth Civic Auditorium, Karachi",
    time: "2:00 PM – 6:00 PM",
    category: "Leadership",
    image: "/images/youth_lead.jpg",
    isUpcoming: true,
    registrationOpen: true,
  },
];
