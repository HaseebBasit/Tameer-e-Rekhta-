import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  urduSubtitle?: string;
  description?: string;
  align?: "center" | "left";
  theme?: "light" | "dark";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  badgeIcon,
  title,
  urduSubtitle,
  description,
  align = "center",
  theme = "light",
  className,
}) => {
  const isCenter = align === "center";
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "mb-10 sm:mb-12",
        isCenter ? "text-center mx-auto max-w-2xl" : "text-left max-w-2xl",
        className
      )}
    >
      {badge && (
        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3",
          isDark 
            ? "bg-white/10 text-brand-lime border border-white/15" 
            : "bg-brand-mint text-brand-dark border border-brand-green/20"
        )}>
          {badgeIcon && <span>{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      <h2
        className={cn(
          "text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading",
          isDark ? "text-white" : "text-brand-pitch"
        )}
      >
        {title}
      </h2>

      {urduSubtitle && (
        <p className={cn("urdu-text text-xl sm:text-2xl mt-2 block", isDark ? "text-emerald-300" : "text-brand-green")}>
          {urduSubtitle}
        </p>
      )}

      {description && (
        <p
          className={cn(
            "mt-3 text-sm sm:text-base leading-relaxed",
            isDark ? "text-gray-300" : "text-gray-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};
