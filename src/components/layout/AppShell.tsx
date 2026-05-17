"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Printer, Layers, ShoppingBag, PackageOpen, History, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/printers", label: "Printers", icon: Printer },
  { href: "/filaments", label: "Filaments", icon: Layers },
  { href: "/supplies", label: "Supplies", icon: PackageOpen },
  { href: "/marketplaces", label: "Marketplaces", icon: ShoppingBag },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <header className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e05a2b]">
              <Printer className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a]">
              Maple Designs Creations
            </span>
          </div>
        </div>
        <nav className="mx-auto max-w-screen-2xl px-4">
          <ul className="flex gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "border-[#e05a2b] text-[#e05a2b]"
                        : "border-transparent text-[#6b7280] hover:text-[#1a1a1a]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
