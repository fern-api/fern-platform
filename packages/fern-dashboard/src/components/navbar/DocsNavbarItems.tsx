"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";

import { useMyDocsSites } from "@/lib/useMyDocsSites";

import { DocsNavbarSubItems } from "./DocsNavbarSubItems";
import { ICON_SIZE, NavbarItem } from "./NavbarItem";

export function DocsNavbarItems() {
  const { docsSites } = useMyDocsSites();
  const firstDocsDomain = docsSites?.[0]?.domain;

  return (
    <>
      <NavbarItem
        title="Docs"
        icon={<BookOpenIcon className={ICON_SIZE} />}
        href="/docs"
        hrefForActualLinking={
          firstDocsDomain != null ? `/docs/${firstDocsDomain}` : undefined
        }
      />
      <DocsNavbarSubItems />
    </>
  );
}
