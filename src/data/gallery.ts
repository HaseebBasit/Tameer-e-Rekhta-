export interface GalleryItem {
  id: string;
  title: string;
  category: "food" | "orphanage" | "events" | "others";
  categoryLabel: string;
  image: string;
  date: string;
  location: string;
}

export const galleryCategories = [
  { id: "all", label: "All" },
  { id: "food", label: "Food Drives" },
  { id: "orphanage", label: "Orphanage Visits" },
  { id: "events", label: "Events" },
  { id: "others", label: "Others" },
] as const;

export const galleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Community Food Distribution Drive",
    category: "food",
    categoryLabel: "Food Drives",
    image: "/images/food_drive.jpg",
    date: "August 2026",
    location: "Karachi",
  },
  {
    id: "gal-2",
    title: "Shelter Home Smiles & Education Kit Distribution",
    category: "orphanage",
    categoryLabel: "Orphanage Visits",
    image: "/images/orphanage.jpg",
    date: "July 2026",
    location: "Karachi",
  },
  {
    id: "gal-3",
    title: "Youth Leadership Bootcamp & Conference",
    category: "events",
    categoryLabel: "Events",
    image: "/images/youth_lead.jpg",
    date: "June 2026",
    location: "Karachi",
  },
  {
    id: "gal-4",
    title: "Volunteer Team Gathering & Community Outreach",
    category: "others",
    categoryLabel: "Others",
    image: "/images/volunteers.jpg",
    date: "May 2026",
    location: "Karachi",
  },
  {
    id: "gal-5",
    title: "Urdu Poetry & Rekhta Heritage Evening",
    category: "events",
    categoryLabel: "Events",
    image: "/images/hero_sprout.jpg",
    date: "April 2026",
    location: "Lahore",
  },
  {
    id: "gal-6",
    title: "Warm Meal Preparation and Packing Camp",
    category: "food",
    categoryLabel: "Food Drives",
    image: "/images/food_drive.jpg",
    date: "March 2026",
    location: "Karachi",
  },
  {
    id: "gal-7",
    title: "Interactive Children's Art Workshop at Orphanage",
    category: "orphanage",
    categoryLabel: "Orphanage Visits",
    image: "/images/orphanage.jpg",
    date: "February 2026",
    location: "Hyderabad",
  },
  {
    id: "gal-8",
    title: "Youth Orientation & Civic Welfare Forum",
    category: "others",
    categoryLabel: "Others",
    image: "/images/volunteers.jpg",
    date: "January 2026",
    location: "Karachi",
  },
  {
    id: "gal-9",
    title: "Panel Discussion on Urdu Literature & Modern Youth",
    category: "events",
    categoryLabel: "Events",
    image: "/images/youth_lead.jpg",
    date: "December 2025",
    location: "Karachi",
  },
];
