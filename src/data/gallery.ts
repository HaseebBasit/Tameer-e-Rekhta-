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
    title: "نقشِ خیال | Annual Urdu Mushaira Stage & Assembly",
    category: "events",
    categoryLabel: "Events",
    image: "/images/gallery/naqsh-stage.jpg",
    date: "Flagship Edition",
    location: "Bahawalpur",
  },
  {
    id: "gal-2",
    title: "Community Food Drive Volunteers with Official Banner",
    category: "food",
    categoryLabel: "Food Drives",
    image: "/images/gallery/food-team.jpg",
    date: "Welfare Campaign",
    location: "Bahawalpur",
  },
  {
    id: "gal-3",
    title: "Fresh Fruit & Nutrition Preparation for Shelter Home Children",
    category: "orphanage",
    categoryLabel: "Orphanage Visits",
    image: "/images/gallery/orphanage-care.jpg",
    date: "Compassion Visit",
    location: "Bahawalpur",
  },
  {
    id: "gal-4",
    title: "Youth Audience and Literature Lovers at Naqsh-e-Khiyaal",
    category: "events",
    categoryLabel: "Events",
    image: "/images/gallery/naqsh-audience.jpg",
    date: "Annual Festival",
    location: "Bahawalpur",
  },
  {
    id: "gal-5",
    title: "Shelter Home Caring and Mentorship Distribution Camp",
    category: "orphanage",
    categoryLabel: "Orphanage Visits",
    image: "/images/gallery/orphanage-team.jpg",
    date: "Shelter Outreach",
    location: "Bahawalpur",
  },
  {
    id: "gal-6",
    title: "Cyber Crime Awareness Appreciation Shields Presentation",
    category: "others",
    categoryLabel: "Others",
    image: "/images/gallery/cyber-awards.jpg",
    date: "Leadership Awards",
    location: "Central Chapter",
  },
  {
    id: "gal-7",
    title: "Sutlej River Flood Relief Emergency Shelter Setup",
    category: "others",
    categoryLabel: "Others",
    image: "/images/gallery/flood-relief.jpg",
    date: "Flood Relief",
    location: "Sutlej River Belt",
  },
  {
    id: "gal-8",
    title: "Summer Heatwave Chilled Drinking Water Distribution",
    category: "food",
    categoryLabel: "Food Drives",
    image: "/images/gallery/water-distribution.jpg",
    date: "Water Relief",
    location: "Bahawalpur",
  },
  {
    id: "gal-9",
    title: "Flood Relief Operations and Volunteer Field Camp",
    category: "others",
    categoryLabel: "Others",
    image: "/images/gallery/flood-camp.jpg",
    date: "Emergency Support",
    location: "Sutlej Region",
  },
  {
    id: "gal-10",
    title: "Rural Sindh Food Distribution and Ration Care Outreach",
    category: "food",
    categoryLabel: "Food Drives",
    image: "/images/gallery/sindh-ration.jpg",
    date: "Ration Drive",
    location: "Sindh",
  },
  {
    id: "gal-11",
    title: "بیادِ اقبال | Allama Iqbal National Literary Tribute",
    category: "events",
    categoryLabel: "Events",
    image: "/images/gallery/iqbal-tribute.jpg",
    date: "Literary Tribute",
    location: "Nationwide",
  },
  {
    id: "gal-12",
    title: "آوازِ نو، رسمِ کہن — Youth Leadership & Literature Manifesto",
    category: "others",
    categoryLabel: "Others",
    image: "/images/gallery/youth-manifesto.jpg",
    date: "Official Creed",
    location: "Ta'meer-e-Rekhta",
  },
];
