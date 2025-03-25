"use client";

import { constructDocsUrlParam } from "@/lib/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/lib/getDocsSiteUrl";
import { useMyDocsSites } from "@/lib/useMyDocsSites";

import { NavbarSubItem } from "./NavbarSubItem";

export function DocsNavbarSubItems() {
  const docsSites = useMyDocsSites();

  if (docsSites.type !== "loaded") {
    return null;
  }

  return (
    <>
      {docsSites.value.map((docsSite) => {
        const url = getDocsSiteUrl(docsSite);
        return (
          <NavbarSubItem
            key={url}
            title={url}
            href={`/docs/${constructDocsUrlParam(url)}`}
          />
        );
      })}
    </>
  );
}
