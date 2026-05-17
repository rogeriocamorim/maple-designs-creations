"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  className,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white shadow-xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#e5e5e5] px-6 py-4">
            <div>
              <RadixDialog.Title className="text-base font-semibold text-[#1a1a1a]">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-0.5 text-sm text-[#6b7280]">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close className="rounded p-1 hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#e05a2b]/20">
              <X className="h-4 w-4 text-[#6b7280]" />
            </RadixDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          {footer && (
            <div className="flex flex-shrink-0 justify-end gap-3 border-t border-[#e5e5e5] px-6 py-4">
              {footer}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
