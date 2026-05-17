"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function Select({
  label,
  placeholder = "Select...",
  options,
  value,
  onValueChange,
  disabled,
  className,
  error,
}: SelectProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
          {label}
        </label>
      )}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-[#e5e5e5] bg-white px-3 text-sm text-[#1a1a1a] focus:border-[#e05a2b] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20 disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#6b7280]",
            error && "border-red-400 focus:border-red-400 focus:ring-red-200"
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="h-4 w-4 text-[#6b7280]" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            className="z-50 max-h-64 min-w-[8rem] overflow-hidden rounded-md border border-[#e5e5e5] bg-white shadow-lg"
            position="popper"
            sideOffset={4}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded px-3 py-2 pl-8 text-sm text-[#1a1a1a] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] focus:outline-none"
                >
                  <RadixSelect.ItemIndicator className="absolute left-2">
                    <Check className="h-4 w-4 text-[#e05a2b]" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
