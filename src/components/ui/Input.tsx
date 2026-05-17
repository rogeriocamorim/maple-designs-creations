"use client";

import { cn } from "@/utils/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wide text-[#6b7280]"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-9 w-full items-center rounded-md border border-[#e5e5e5] bg-white text-sm focus-within:border-[#e05a2b] focus-within:ring-2 focus-within:ring-[#e05a2b]/20",
            error && "border-red-400 focus-within:border-red-400 focus-within:ring-red-200"
          )}
        >
          {prefix && (
            <span className="flex-shrink-0 select-none pl-3 pr-1 text-[#6b7280]">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-full min-w-0 flex-1 bg-transparent text-[#1a1a1a] placeholder:text-[#9ca3af] focus:outline-none disabled:cursor-not-allowed disabled:text-[#6b7280]",
              prefix ? "pl-0 pr-3" : "px-3",
              suffix && "pr-0",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="flex-shrink-0 select-none pl-1 pr-3 text-[#6b7280]">{suffix}</span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
