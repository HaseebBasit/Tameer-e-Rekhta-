export interface Pillar {
  id: string;
  title: string;
  urduTitle: string;
  description: string;
  iconName: string;
}

export interface Initiative {
  id: string;
  title: string;
  category: "food" | "orphanage" | "leadership" | "welfare" | "urdu";
  categoryLabel: string;
  description: string;
  fullDetails: string;
  image: string;
  schedule: string;
  location: string;
  impactMetrics: string;
}

export const corePillars: Pillar[] = [
  {
    id: "revive-urdu",
    title: "Revive Urdu",
    urduTitle: "احیاءِ اردو",
    description: "Promoting the beauty of Urdu language and literature among the new generation through creative writing, poetry circles, and cultural gatherings.",
    iconName: "BookOpen",
  },
  {
    id: "empower-youth",
    title: "Empower Youth",
    urduTitle: "تعمیرِ نوجوان",
    description: "Creating meaningful opportunities for young people to cultivate ethical leadership, public speaking, teamwork, and social responsibility.",
    iconName: "GraduationCap",
  },
  {
    id: "serve-humanity",
    title: "Serve Humanity",
    urduTitle: "خدمتِ خلق",
    description: "Working selflessly for the welfare and betterment of communities in need across Pakistan through ration drives, orphanage care, and relief aid.",
    iconName: "HandHeart",
  },
];

export const initiatives: Initiative[] = [
  {
    id: "food-drives",
    title: "Food Drives",
    category: "food",
    categoryLabel: "Food Distribution",
    description: "Providing meals to those in need and spreading smiles across underprivileged communities.",
    fullDetails: "Organizing regular cooked meal distributions and dry ration packs for daily-wage laborers, needy families, and street children across urban centers.",
    image: "/images/food_drive.jpg",
    schedule: "Monthly Drives",
    location: "Karachi & Lahore",
    impactMetrics: "1,000+ Warm Meals Served",
  },
  {
    id: "orphanage-visits",
    title: "Orphanage Visits",
    category: "orphanage",
    categoryLabel: "Child Welfare",
    description: "Spending time with orphans and supporting their education and holistic wellbeing.",
    fullDetails: "Volunteers spend valuable time with shelter home children, delivering storybook sessions, art and stationery kits, recreational games, and emotional mentorship.",
    image: "/images/orphanage.jpg",
    schedule: "Bi-Weekly Visits",
    location: "Karachi & Hyderabad",
    impactMetrics: "15+ Shelter Home Visits",
  },
  {
    id: "youth-leadership",
    title: "Youth Leadership",
    category: "leadership",
    categoryLabel: "Capacity Building",
    description: "Organizing events and sessions to develop leadership skills and strong moral character.",
    fullDetails: "Conducting interactive youth bootcamps, debate forums, and leadership seminars that teach collaboration, problem solving, and civic awareness.",
    image: "/images/youth_lead.jpg",
    schedule: "Quarterly Workshops",
    location: "Nationwide",
    impactMetrics: "500+ Youth Trained",
  },
  {
    id: "community-welfare",
    title: "Community Welfare",
    category: "welfare",
    categoryLabel: "Social Support",
    description: "Working for the welfare of communities in Pakistan and responding to urgent civic needs.",
    fullDetails: "Mobilizing swift volunteer rescue and relief during monsoon emergencies, winter clothing drives, medical assistance camps, and local neighborhood clean-ups.",
    image: "/images/volunteers.jpg",
    schedule: "Ongoing Action",
    location: "Sindh & Punjab",
    impactMetrics: "Active Volunteer Network",
  },
];
