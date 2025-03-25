"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";

import { useMyDocsSites } from "@/lib/useMyDocsSites";

import { DocsNavbarSubItems } from "./DocsNavbarSubItems";
import { ICON_SIZE, NavbarItem } from "./NavbarItem";

export function DocsNavbarItems() {
  const docsSites = useMyDocsSites();
  const firstDocsUrl =
    docsSites.type === "loaded" ? docsSites.value[0]?.mainUrl : undefined;

  return (
    <>
      <NavbarItem
        title="Docs"
        icon={<BookOpenIcon className={ICON_SIZE} />}
        href="/docs"
        hrefForActualLinking={
          firstDocsUrl != null ? `/docs/${firstDocsUrl}` : undefined
        }
      />
      <DocsNavbarSubItems />
    </>
  );
}
