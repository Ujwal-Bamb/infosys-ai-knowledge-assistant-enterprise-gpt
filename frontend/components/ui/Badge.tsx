import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "info" | "warning" | "danger" | "neutral" | "brand";
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    info: "bg-sky-50 text-sky-700 border border-sky-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    brand: "bg-blue-50 text-[#1E60FF] border border-blue-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
