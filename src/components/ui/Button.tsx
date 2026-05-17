"use client";

import { cn } from "@/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            primary:
              "bg-[#e05a2b] text-white hover:bg-[#c94d22] focus-visible:outline-[#e05a2b]",
            secondary:
              "border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#f5f5f5] focus-visible:outline-[#e05a2b]",
            ghost: "text-[#1a1a1a] hover:bg-[#f5f5f5] focus-visible:outline-[#e05a2b]",
            danger:
              "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:outline-red-500",
          }[variant],
          {
            sm: "h-7 px-3 text-xs",
            md: "h-9 px-4 text-sm",
            lg: "h-11 px-6 text-base",
          }[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
