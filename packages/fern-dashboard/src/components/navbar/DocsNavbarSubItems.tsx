import { Suspense } from "react";

import { DocsSite } from "@fern-platform/fdr";

import { NavbarSubItem } from "./NavbarSubItem";

export declare namespace DocsNavbarSubItems {
  export interface Props {
    docsSites: DocsSite[];
  }
}

export async function DocsNavbarSubItems({
  docsSites,
}: DocsNavbarSubItems.Props) {
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
