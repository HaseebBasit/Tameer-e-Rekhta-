"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-20 sm:py-32 flex items-center justify-center">
      <Container size="narrow">
        <div className="card-soft rounded-3xl p-8 sm:p-14 text-center space-y-6 bg-white border border-gray-100 max-w-lg mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-brand-pitch">
            Something went wrong!
          </h2>

          <p className="text-gray-600 text-sm leading-relaxed">
            An unexpected error occurred while loading this page. Please try refreshing or return to the homepage.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => reset()}
              variant="primary"
              size="md"
              icon={<RotateCcw className="w-4 h-4" />}
              iconPosition="left"
            >
              Try Again
            </Button>
            <Button
              href="/"
              variant="outline"
              size="md"
              icon={<Home className="w-4 h-4" />}
              iconPosition="left"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
