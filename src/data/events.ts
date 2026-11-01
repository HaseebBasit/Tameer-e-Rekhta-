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
  category: "Welfare" | "Literature" | "Social" | "Leadership" | "Mushaira & Qawwali Night";
  image: string;
  isUpcoming: boolean;
  registrationOpen: boolean;
  badge?: string;
}

export const eventsData: EventItem[] = [
  {
    id: "event-1",
    slug: "naqsh-e-khiyaal-mushaira-and-qawwali-night",
    day: "12",
    month: "OCT",
    year: "2024",
    title: "نقشِ خیال: مشاعرہ و قوالی نائٹ",
    subtitle: "Naqsh-e-Khiyaal — Mushaira & Qawwali Night",
    description:
      "A landmark cultural evening held on 12 October in Bahawalpur, uniting celebrated poets, young writers, and literature enthusiasts for an enchanting session of Urdu poetry, ghazal recitations, and traditional Sufi Qawwali.",
    location: "Bahawalpur",
    venue: "Main Open-Air Auditorium",
    time: "Evening Mushaira & Qawwali Session",
    category: "Mushaira & Qawwali Night",
    image: "/images/events/naqsh-e-khiyaal.jpg",
    isUpcoming: false,
    registrationOpen: false,
    badge: "Mushaira & Qawwali Night • 12 October",
  },
  {
    id: "event-2",
    slug: "community-food-drive-ramadan-campaign",
    day: "",
    month: "RAMADAN",
    year: "2024",
    title: "کمیونٹی فوڈ ڈرائیو مہم (رمضان المبارک)",
    subtitle: "Community Food Drive — Ramadan Campaign",
    description:
      "A compassionate humanitarian initiative organized during the holy month of Ramadan, providing freshly cooked hot meals, Iftar distributions, and nutrition packages to underprivileged daily-wage earners and families in need.",
    location: "Bahawalpur & Sindh",
    venue: "Community Distribution Hubs",
    time: "Ramadan Food Distribution",
    category: "Welfare",
    image: "/images/events/food-drive.jpg",
    isUpcoming: false,
    registrationOpen: false,
    badge: "Ramadan Welfare Campaign",
  },
  {
    id: "event-3",
    slug: "children-shelter-home-and-orphanage-care-visit",
    day: "12",
    month: "APR",
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
