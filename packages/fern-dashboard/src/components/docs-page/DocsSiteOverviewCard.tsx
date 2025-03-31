"use client";

import { getLoadableValue } from "@fern-ui/loadable";

import { useDocsSite } from "@/state/useMyDocsSites";
import { getDocsSiteUrl } from "@/utils/getDocsSiteUrl";
import { DocsUrl } from "@/utils/types";

export declare namespace DocsSiteOverviewCard {
  export interface Props {
    docsUrl: DocsUrl;
  }
}

export function DocsSiteOverviewCard({ docsUrl }: DocsSiteOverviewCard.Props) {
  const docsSite = getLoadableValue(useDocsSite(docsUrl));

  return (
    <div className="dark:bg-gray-1200 flex flex-1 rounded-xl border border-gray-500 bg-gray-100 p-6">
      {docsSite != null ? getDocsSiteUrl(docsSite) : "..."}
    </div>
  );
}
