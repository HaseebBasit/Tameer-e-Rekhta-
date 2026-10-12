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
  badge?: string;
}

export const eventsData: EventItem[] = [
  {
    id: "event-1",
    slug: "naqsh-e-khiyaal-annual-literary-festival",
    day: "01",
    month: "LITERATURE",
    year: "2024",
    title: "نقشِ خیال: سالانہ مشاعرہ و ادبی کانفرنس",
    subtitle: "Naqsh-e-Khiyaal — Grand Annual Urdu Mushaira & Literary Assembly",
    description:
      "A premier flagship cultural gathering uniting celebrated poets, young writers, and literature enthusiasts on a grand open-air stage to celebrate Urdu poetry, ghazal recitation, and artistic heritage.",
    location: "Bahawalpur & Regional Centers",
    venue: "Main Open-Air Auditorium",
    time: "Evening Mushaira Session",
    category: "Literature",
    image: "/images/events/naqsh-e-khiyaal.jpg",
    isUpcoming: false,
    registrationOpen: false,
    badge: "Flagship Literary Event",
  },
  {
    id: "event-2",
    slug: "community-food-and-ration-distribution-campaign",
    day: "02",
    month: "WELFARE",
    year: "2024",
    title: "کمیونٹی فوڈ و راشن ڈسٹری بیوشن ڈرائیو",
    subtitle: "Community Food Drive & Emergency Dry Ration Distribution",
    description:
      "A compassionate humanitarian campaign providing freshly prepared hot meals and month-long dry ration packages to underprivileged daily-wage earners and deserving families across local communities.",
    location: "Bahawalpur & Sindh",
    venue: "Community Distribution Hubs",
    time: "Full-day Welfare Drive",
    category: "Welfare",
    image: "/images/events/food-drive.jpg",
    isUpcoming: false,
    registrationOpen: false,
    badge: "Flagship Welfare Drive",
  },
  {
    id: "event-3",
    slug: "children-shelter-home-and-orphanage-care-visit",
    day: "03",
    month: "SOCIAL",
    year: "2024",
    title: "بچوں کے شیلٹر ہوم کا دورہ و افطار مہم",
    subtitle: "Children Shelter Home & Orphanage Compassion Visit",
    description:
      "A heartwarming outreach initiative where volunteers spent dedicated time with orphan children, preparing and distributing fresh fruit nutrition boxes, educational kits, and sharing joy and companionship.",
    location: "Bahawalpur",
    venue: "Child Protection & Shelter Home Center",
    time: "Afternoon & Iftar Gathering",
    category: "Social",
    image: "/images/events/orphanage-visit.jpg",
    isUpcoming: false,
    registrationOpen: false,
    badge: "Flagship Social Care",
  },
];
