import React from "react";
import Link from "next/link";
import { Sprout, ArrowLeft, Home } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-20 sm:py-32 flex items-center justify-center">
      <Container size="narrow">
        <div className="card-soft rounded-3xl p-8 sm:p-14 text-center space-y-6 bg-white border border-gray-100 max-w-lg mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-full bg-brand-mint text-brand-emerald mx-auto flex items-center justify-center">
            <Sprout className="w-8 h-8" />
          </div>

          <span className="font-heading font-black text-6xl sm:text-7xl text-brand-emerald block leading-none">
            404
          </span>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
            Page Not Found
          </h1>

          <p className="urdu-text text-xl text-brand-green">
            معذرت، مطلوبہ صفحہ دستیاب نہیں ہے
          </p>

          <p className="text-gray-600 text-sm leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              href="/"
              variant="primary"
              size="md"
              icon={<Home className="w-4 h-4" />}
              iconPosition="left"
            >
              Back to Home
            </Button>
            <Button
              href="/our-work"
              variant="outline"
              size="md"
            >
              Explore Our Work
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
