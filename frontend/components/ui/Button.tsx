import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#1E60FF] text-white hover:bg-[#1551E5] focus:ring-[#1E60FF] shadow-sm",
      secondary:
        "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm focus:ring-slate-300",
      outline:
        "bg-transparent text-[#1E60FF] border border-[#1E60FF] hover:bg-blue-50 focus:ring-[#1E60FF]",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-semibold gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
