"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  hint?: string;
}

export function Checkbox({
  label,
  checked,
  onCheckedChange,
  disabled,
  className,
  hint,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 select-none",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <RadixCheckbox.Root
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        disabled={disabled}
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#e5e5e5] bg-white transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20",
          checked && "border-[#e05a2b] bg-[#e05a2b]"
        )}
      >
        <RadixCheckbox.Indicator>
          <Check className="h-3 w-3 text-white" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <div>
        <span className="text-sm text-[#1a1a1a]">{label}</span>
        {hint && <span className="ml-1 text-xs text-[#9ca3af]">{hint}</span>}
      </div>
    </label>
  );
}
