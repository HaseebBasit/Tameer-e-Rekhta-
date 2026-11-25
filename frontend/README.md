# Ta'meer-e-Rekhta (تعمیرِ ریختہ)

> **Urdu Revival • Youth Leadership • Humanity**  
> Official production-ready web platform for Ta'meer-e-Rekhta, a youth-led humanitarian and cultural NGO in Pakistan.

---

## About
Ta'meer-e-Rekhta is an organization dedicated to Urdu Revival, Youth Leadership Events, and Welfare of Mankind in Pakistan. Founded by passionate young leaders, the organization preserves cultural and literary identity while mobilizing grassroots community service:
1. **Urdu Revival**: Revitalizing appreciation for Urdu literature, poetry, and arts among youth.
2. **Youth Leadership**: Cultivating public speaking, teamwork, and ethical leadership capacity.
3. **Serving Humanity**: Organizing food drives, orphanage care, and civic assistance.

---

## Features
- **Faithful Visual Architecture**: Pixel-matched to the official visual reference guide.
- **9 Core Routes**: Home, About Us, Our Work, Events, Photo Gallery, Volunteer, Donate / Support, Contact, and Team.
- **Bilingual Cultural Touch**: Integrated Urdu typography (`Noto Nastaliq Urdu` & `Amiri`) with RTL rendering alongside modern English typography (`Outfit` & `Inter`).
- **Interactive Lightbox Modal**: Image zoom and gallery preview with keyboard arrow and ESC dismissal.
- **Controlled & Validated Forms**: Interactive Volunteer application and Contact messaging with live field validation and feedback states.
- **One-Click Payment Copy**: Instant clipboard copying for EasyPaisa, JazzCash, and Meezan Bank coordinates.
- **Dynamic SEO & Metadata**: Next.js App Router metadata, Open Graph cards, Twitter cards, dynamic `sitemap.xml`, and `robots.txt`.
- **Accessible & Fully Responsive**: Tested across desktop, laptop, tablet, and mobile with zero horizontal overflow and mobile slide-in drawer.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 3.4 & Custom CSS Design Tokens
- **Icons**: Lucide React
- **Fonts**: Google Fonts (`Inter`, `Outfit`, `Amiri`, `Noto Nastaliq Urdu`)
- **Package Manager**: npm

---

## Routes
| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Dark hero with Urdu subtitle, 3 core pillars, 4 recent activities, and stats strip. |
| `/about` | About Us | Narrative overview, "Our Vision" dark showcase, "Our Values" 5 interactive cards, and pledge banner. |
| `/our-work` | Our Work | 2x2 initiative grid (Food Drives, Orphanage Visits, Youth Leadership, Community Welfare) + CTA. |
| `/events` | Events | Upcoming event timeline with date badges (25 AUG, 10 SEP, 20 SEP, 05 OCT) and locations. |
| `/gallery` | Photo Gallery | Category filter tabs (All, Food Drives, Orphanage Visits, Events, Others) with full-screen Lightbox. |
| `/volunteer` | Volunteer | Split hero, benefits checkmarks, 3-step "How to Join?", and controlled application form. |
| `/donate` | Donate / Support | 3 transparency pillars, EasyPaisa, JazzCash, and Bank transfer details with copy buttons. |
| `/contact` | Contact Us | 2-column contact cards + validated contact form + Karachi headquarters map showcase. |
| `/team` | Team | Leadership grid with circular portraits and designations + shared vision quote banner. |
| `/sitemap.xml` | Dynamic Sitemap | Search engine XML index for all pages. |
| `/robots.txt` | Robots File | Search engine crawler rules. |

---

## Folder Structure
```
tameer_e_rekhta/
├── public/
│   └── images/              # Authentic event, team, and initiative photos
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout, fonts, header, footer, SEO metadata
│   │   ├── globals.css      # Custom CSS variables, fonts, utility classes
│   │   ├── not-found.tsx    # Branded 404 error page
│   │   ├── error.tsx        # Next.js error boundary
│   │   ├── loading.tsx      # Rotating seedling loading spinner
│   │   ├── sitemap.ts       # Dynamic sitemap generator
│   │   ├── robots.ts        # Dynamic robots.txt
│   │   ├── page.tsx         # Home page
│   │   ├── about/page.tsx   # About page
│   │   ├── our-work/page.tsx # Our Work page
│   │   ├── events/page.tsx  # Events page
│   │   ├── gallery/page.tsx # Gallery page
│   │   ├── volunteer/page.tsx # Volunteer page
│   │   ├── donate/page.tsx  # Donate page
│   │   ├── contact/page.tsx # Contact page
│   │   └── team/page.tsx    # Team page
│   ├── components/
│   │   ├── layout/          # Header, Footer, MobileMenu
│   │   ├── ui/              # Button, Container, SectionHeading, Badge
│   │   ├── home/            # Hero, MissionCards, RecentActivities, Stats
│   │   ├── work/            # WorkCard
│   │   ├── events/          # EventCard
│   │   ├── gallery/         # GalleryGrid, Lightbox
│   │   ├── volunteer/       # VolunteerForm
│   │   ├── contact/         # ContactForm
│   │   └── team/            # TeamCard
│   ├── data/
│   │   ├── site.ts          # Central site metadata, contacts, social links, accounts
│   │   ├── initiatives.ts   # Pillars and initiative descriptions
│   │   ├── events.ts        # Upcoming and past events
│   │   ├── gallery.ts       # Photo gallery assets and categories
│   │   └── team.ts          # Team leadership and heads
│   └── lib/
│       └── utils.ts         # Class name merging utility (cn)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── PROJECT_CHANGELOG.md
└── README.md
```

---

## Components
- **Layout**:
  - `Header.tsx`: Sticky navigation with responsive logo, desktop links, "Join Us" CTA, and hamburger trigger.
  - `MobileMenu.tsx`: Slide-in drawer with body scroll lock and keyboard ESC accessibility.
  - `Footer.tsx`: Universal dark footer with quick links, initiatives, contact info, and heart signature.
- **UI Primitives**:
  - `Button.tsx`: Accessible button supporting variants (`primary`, `secondary`, `outline`, `ghost`, `dark`), sizes, and Next.js `Link` routing.
  - `Container.tsx`: Standardized responsive constraints (`narrow`, `default`, `wide`).
  - `SectionHeading.tsx`: Header primitive with badge pill, title, and Urdu subtitle.
  - `Badge.tsx`: Tag pill component with color variants.
- **Feature Components**:
  - `Hero.tsx`: High-impact landing showcase.
  - `MissionCards.tsx`: 3 core pillars.
  - `RecentActivities.tsx`: 4 activity cards with badges and locations.
  - `Stats.tsx`: Deep-forest green statistics strip.
  - `WorkCard.tsx`: Initiative showcase card.
  - `EventCard.tsx`: Timeline event row with calendar date badge.
  - `GalleryGrid.tsx`: Filterable photo grid.
  - `Lightbox.tsx`: Full-screen accessible image modal.
  - `VolunteerForm.tsx`: Volunteer application form with live validation.
  - `ContactForm.tsx`: Contact message form with feedback states.
  - `TeamCard.tsx`: Leadership member card with circular portrait and social links.

---

## Data Files
All dynamic content is organized in TypeScript data files in `src/data/`:
- `data/site.ts`: Primary contact emails, phone numbers, addresses, social accounts, and payment account numbers.
- `data/initiatives.ts`: Core mission pillars and detailed initiative descriptions.
- `data/events.ts`: Event dates, locations, categories, and cover images.
- `data/gallery.ts`: Photographic moments categorized under Food Drives, Orphanage Visits, Events, and Others.
- `data/team.ts`: Team member names, titles, and image paths.

---

## Environment Variables
The application runs out-of-the-box without required environment variables for static rendering. If backend email dispatch or external payment webhooks are added, configure:
```bash
# Optional: Email Service (Resend / SendGrid)
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_RECIPIENT_EMAIL=tameerekhta@gmail.com

# Optional: Next.js Public App URL
NEXT_PUBLIC_SITE_URL=https://tameererekhta.org
```

---

## Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Production Build
```bash
# 1. Run ESLint verification
npm run lint

# 2. Build optimized production bundle
npm run build

# 3. Start local production server
npm run start
```

---

## Deployment
Recommended deployment options:
1. **Vercel (Recommended)**: Connect the GitHub repository (`HaseebBasit/Tameer-Rekhta-Demo`) to Vercel. Next.js App Router will be detected automatically with instant static edge delivery.
2. **Node.js Hosting (VPS / Cloud)**: Build via `npm run build` and run `npm start` under a process manager like PM2 behind an NGINX reverse proxy with SSL.
3. **Static HTML Export**: If static hosting is required (GitHub Pages / Netlify static), configure `output: 'export'` in `next.config.mjs`.

---

## Forms
- **Volunteer Registration Form** (`/volunteer`): Fully implemented with client-side state, live error checking (Name, Email formatting, Phone, City, Interest selection), and application received confirmation card. Form is currently frontend-only; integrate with a server action or API route when a database/email provider is selected.
- **Contact Form** (`/contact`): Fully implemented with field validation, simulated network submission, and success state. Frontend-only by design until SMTP/Resend keys are provisioned.

---

## Donation
- Automated online card payment processing is **not configured** by default to maintain transparency.
- The `/donate` page provides explicit details for **EasyPaisa**, **JazzCash**, and **Bank Transfer (Meezan Bank Ltd)** with single-click clipboard copying.
- Clear instructions are provided for donors to send transfer screenshots to the organization's WhatsApp (`0312-3456789`) or email (`tameerekhta@gmail.com`) for formal receipts.

---

## Image Management
All images are hosted locally inside `public/images/`:
- `hero_sprout.jpg`: High-resolution hands holding seedling sprout.
- `food_drive.jpg`: Authentic community meal distribution photo.
- `orphanage.jpg`: Authentic orphanage mentorship and care photo.
- `volunteers.jpg`: Authentic group photo of young volunteers.
- `youth_lead.jpg`: Authentic youth leadership seminar photo.

All images are served via Next.js `<Image />` component with automatic responsive sizing, webp optimization, lazy loading, and priority flags on above-the-fold banners.

---

## Future Improvements
1. **Full Bilingual Toggle**: English / Urdu UI switcher with complete RTL text flipping.
2. **Headless CMS Integration**: Sanity or Strapi CMS for live event posting and blog announcements.
3. **Direct Email Dispatch**: Integration with Resend or SendGrid for instant volunteer confirmations.
4. **Online Payment Gateway**: Integration with certified local gateways (KuickPay, PayMob, JazzCash Merchant API) once non-profit regulatory compliance documentation is finalized.
