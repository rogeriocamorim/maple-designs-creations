"use client";

import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  disabled?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  disabled,
}: ConfirmDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixAlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <RadixAlertDialog.Title className="text-base font-semibold text-[#1a1a1a]">
            {title}
          </RadixAlertDialog.Title>
          <RadixAlertDialog.Description className="mt-2 text-sm text-[#6b7280]">
            {description}
          </RadixAlertDialog.Description>
          <div className="mt-6 flex justify-end gap-3">
            <RadixAlertDialog.Cancel
              className="inline-flex h-9 items-center justify-center rounded-md border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-[#1a1a1a] hover:bg-[#f5f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e05a2b]"
            >
              {cancelLabel}
            </RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action
              disabled={disabled}
              onClick={onConfirm}
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variant === "danger"
                  ? "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500"
                  : "bg-[#e05a2b] text-white hover:bg-[#c94d22] focus-visible:outline-[#e05a2b]"
              )}
            >
              {confirmLabel}
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  okLabel?: string;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  okLabel = "OK",
}: AlertDialogProps) {
  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixAlertDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
        >
          <RadixAlertDialog.Title className="text-base font-semibold text-[#1a1a1a]">
            {title}
          </RadixAlertDialog.Title>
          <RadixAlertDialog.Description className="mt-2 text-sm text-[#6b7280]">
            {description}
          </RadixAlertDialog.Description>
          <div className="mt-6 flex justify-end">
            <RadixAlertDialog.Action
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#e05a2b] px-4 text-sm font-medium text-white hover:bg-[#c94d22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e05a2b]"
            >
              {okLabel}
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
