"use client";

import { constructDocsUrlParam } from "@/utils/constructDocsUrlParam";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";
import { useMyDocsSites } from "@/utils/useMyDocsSites";

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
