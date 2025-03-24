"use client";

import { useMyDocsSites } from "@/lib/useMyDocsSites";

import { NavbarSubItem } from "./NavbarSubItem";

export function DocsNavbarSubItems() {
  const { docsSites } = useMyDocsSites();

  if (docsSites == null) {
    return null;
  }

  return (
    <>
      {docsSites.map((docsSite) => (
        <NavbarSubItem
          key={docsSite.domain}
          title={docsSite.domain}
          href={`/docs/${docsSite.domain}`}
        />
      ))}
    </>
  );
}
