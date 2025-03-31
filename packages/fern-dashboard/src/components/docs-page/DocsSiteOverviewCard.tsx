"use client";

import { unwrapLoadable } from "@/utils/Loadable";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";
import { DocsUrl } from "@/utils/types";
import { useDocsSite } from "@/utils/useMyDocsSites";

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
