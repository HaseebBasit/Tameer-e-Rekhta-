import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "mint" | "dark" | "outline" | "gold";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  icon,
  variant = "mint",
  className,
}) => {
  const variantStyles = {
    mint: "bg-brand-mint/80 text-brand-dark border border-brand-green/20",
    dark: "bg-white/10 text-white/90 border border-white/15 backdrop-blur-sm",
    outline: "border border-brand-emerald/40 text-brand-forest bg-transparent",
    gold: "bg-amber-50 text-amber-900 border border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase",
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
