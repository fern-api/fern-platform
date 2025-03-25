"use client";

import { unwrapLoadable } from "@/lib/Loadable";
import { getDocsSiteUrl } from "@/lib/getDocsSiteUrl";
import { DocsUrl } from "@/lib/types";
import { useDocsSite } from "@/lib/useMyDocsSites";

export declare namespace DocsSiteOverviewCard {
  export interface Props {
    docsUrl: DocsUrl;
  }
}

export function DocsSiteOverviewCard({ docsUrl }: DocsSiteOverviewCard.Props) {
  const docsSite = unwrapLoadable(useDocsSite(docsUrl));

  return (
    <div className="flex flex-1 rounded-xl border border-gray-500 bg-gray-100 p-6">
      {docsSite != null ? getDocsSiteUrl(docsSite) : "..."}
    </div>
  );
}
