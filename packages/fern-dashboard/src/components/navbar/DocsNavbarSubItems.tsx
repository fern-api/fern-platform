"use client";

import { useMyDocsSites } from "@/state/useMyDocsSites";
import { constructDocsUrlParam } from "@/utils/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";

import { NavbarSubItem } from "./NavbarSubItem";

export function DocsNavbarSubItems() {
  const docsSites = useMyDocsSites();

  if (docsSites.type !== "loaded") {
    return null;
  }

  return (
    <>
      {docsSites.value.docsSites.map((docsSite) => {
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
