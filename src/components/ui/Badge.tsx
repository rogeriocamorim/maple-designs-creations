import { cn } from "@/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "brand" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          default: "bg-[#f5f5f5] text-[#1a1a1a]",
          success: "bg-green-50 text-green-700",
          warning: "bg-amber-50 text-amber-700",
          danger: "bg-red-50 text-red-700",
          brand: "bg-[#fff0ec] text-[#e05a2b]",
          muted: "bg-[#f5f5f5] text-[#6b7280]",
        }[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
