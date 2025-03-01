"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";

import { X } from "lucide-react";

import { FernButton } from "@fern-docs/components";
import { tunnel } from "@fern-ui/react-commons";

import { FernLinkButton } from "../FernLinkButton";

export const closeButton = tunnel();

export function PlaygroundCloseButton() {
  const pathname = usePathname();
  return (
    <closeButton.In>
      <FernLinkButton
        icon={<X />}
        size="large"
        rounded
        variant="outlined"
        href={pathname.replace("/~explorer", "")}
        replace
        scroll={false}
      />
    </closeButton.In>
  );
}

export function InterceptedPlaygroundCloseButton() {
  const router = useRouter();
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [router]);
  return (
    <closeButton.In>
      <FernButton
        icon={<X />}
        size="large"
        rounded
        variant="outlined"
        onClick={() => {
          router.back();
        }}
      />
    </closeButton.In>
  );
}
