"use client";

import * as RadixSlider from "@radix-ui/react-slider";
import { cn } from "@/utils/cn";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 0.01,
  className,
  disabled,
}: SliderProps) {
  return (
    <RadixSlider.Root
      className={cn("relative flex touch-none select-none items-center", className)}
      value={[value]}
      onValueChange={([v]) => onValueChange(v)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <RadixSlider.Track className="relative h-1.5 w-full grow rounded-full bg-[#e5e5e5]">
        <RadixSlider.Range className="absolute h-full rounded-full bg-[#e05a2b]" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block h-4 w-4 rounded-full border-2 border-[#e05a2b] bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/30 disabled:pointer-events-none" />
    </RadixSlider.Root>
  );
}
