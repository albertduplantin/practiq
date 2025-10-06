"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SheetProps {
  trigger: ReactNode; // élément qui ouvre le sheet
  children: ReactNode; // contenu du sheet
  side?: "left" | "right" | "bottom" | "top";
  className?: string;
}

export function Sheet({ trigger, children, side = "left", className }: SheetProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className={cn(
            "fixed z-50 bg-background w-3/4 max-w-xs h-full p-4 shadow-lg focus:outline-none",
            side === "left" && "left-0 top-0 animate-slideInLeft",
            side === "right" && "right-0 top-0 animate-slideInRight",
            side === "bottom" && "bottom-0 left-0 w-full max-h-80 animate-slideInUp",
            side === "top" && "top-0 left-0 w-full max-h-80 animate-slideInDown",
            className
          )}
        >
          <Dialog.Close className="absolute top-4 right-4 text-foreground hover:text-primary">
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Tailwind keyframes (add via @layer utilities)
// In globals.css or tailwind config, ensure these animations exist for smooth slide.
