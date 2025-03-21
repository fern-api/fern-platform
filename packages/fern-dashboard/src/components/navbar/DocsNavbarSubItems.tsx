import { Suspense } from "react";

import { getMyDocsSites } from "@/app/actions/getMyDocsSites";

import { NavbarSubItem } from "./NavbarSubItem";

export async function DocsNavbarSubItems() {
  const { docsSites } = await getMyDocsSites();

  return (
    <Suspense fallback={null}>
      {docsSites.map((docsSite) => (
        <NavbarSubItem
          key={docsSite.domain}
          title={docsSite.domain}
          href={`/docs/${docsSite.domain}`}
        />
      ))}
    </Suspense>
  );
}
