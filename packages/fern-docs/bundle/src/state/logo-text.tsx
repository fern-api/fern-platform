"use client";

import { atom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { cn } from "@fern-docs/components";

const logoTextAtom = atom<string | undefined>(undefined);

export function SetLogoText({ text }: { text: string | undefined }) {
  useHydrateAtoms([[logoTextAtom, text]], { dangerouslyForceHydrate: true });
  return null;
}

export function useLogoText() {
  return useAtomValue(logoTextAtom);
}

export function LogoText({ className }: { className?: string }) {
  const logoText = useLogoText();
  if (logoText == null) {
    return null;
  }

  return (
    <span
      className={cn(
        "font-heading text-(color:--accent) text-[1.5rem] font-light lowercase",
        className
      )}
    >
      {logoText}
    </span>
  );
}
