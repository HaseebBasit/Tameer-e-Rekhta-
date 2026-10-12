import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { galleryItems } from "@/data/gallery";

export const HomeGallery: React.FC = () => {
  // Show 6 authentic showcase photos
  const showcasePhotos = galleryItems.slice(0, 6);

  return (
    <section className="py-12 sm:py-20 bg-white border-b border-gray-100">
      <Container size="wide">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-brand-forest text-xs font-semibold mb-3">
              <Images className="w-3.5 h-3.5" />
              <span>Real Field Moments & Photos</span>
            </div>
            <SectionHeading
              title="Photo Highlights From Our Drives"
              description="Visual glimpses of our food drives, orphanage visits, literary stages, and youth activities across Pakistan."
              align="left"
              className="mb-0"
            />
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-forest hover:text-brand-emerald transition-colors shrink-0 group self-start md:self-end"
          >
            <span>Explore Full Gallery ({galleryItems.length}+ Photos)</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 6-Photo Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcasePhotos.map((item) => (
            <Link
              key={item.id}
              href="/gallery"
              className="group card-soft rounded-2xl overflow-hidden relative w-full h-60 sm:h-auto aspect-4/3 bg-gray-100 block transition-all duration-300 hover:shadow-xl"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient & details */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-pitch/85 via-brand-pitch/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-bold text-brand-lime uppercase tracking-wider">
                  {item.categoryLabel}
                </span>
                <h3 className="font-heading font-bold text-sm sm:text-base text-white mt-1 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-brand-lime shrink-0" />
                  <span>{item.location} • {item.date}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-forest hover:text-brand-emerald"
          >
            <span>View All {galleryItems.length} Photos in Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
};
