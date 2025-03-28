"use client";

import { BookOpenIcon } from "@heroicons/react/24/outline";

import { constructDocsUrlParam } from "@/utils/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";
import { useMyDocsSites } from "@/utils/useMyDocsSites";

import { DocsNavbarSubItems } from "./DocsNavbarSubItems";
import { ICON_SIZE, NavbarItem } from "./NavbarItem";

export function DocsNavbarItems() {
  const docsSites = useMyDocsSites();
  const firstDocsSite =
    docsSites.type === "loaded" ? docsSites.value[0] : undefined;

  return (
    <>
      <NavbarItem
        title="Docs"
        icon={<BookOpenIcon className={ICON_SIZE} />}
        href="/docs"
        hrefForActualLinking={
          firstDocsSite != null
            ? `/docs/${constructDocsUrlParam(getDocsSiteUrl(firstDocsSite))}`
            : undefined
        }
      />
      <DocsNavbarSubItems />
    </>
  );
}
