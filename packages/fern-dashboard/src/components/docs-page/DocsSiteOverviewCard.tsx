"use client";

import { getLoadableValue } from "@fern-ui/loadable";

import { useDocsSite } from "@/state/useMyDocsSites";
import { DocsUrl } from "@/utils/types";

import { DocsSiteImage } from "./DocsSiteImage";
import { DocsSiteInfo } from "./DocsSiteInfo";

export declare namespace DocsSiteOverviewCard {
  export interface Props {
    docsUrl: DocsUrl;
  }
}

export function DocsSiteOverviewCard({ docsUrl }: DocsSiteOverviewCard.Props) {
  const docsSite = getLoadableValue(useDocsSite(docsUrl));

  return (
    <div className="dark:bg-gray-1200 flex flex-1 gap-6 rounded-xl border border-gray-500 bg-gray-100 p-6 dark:border-gray-900">
      <DocsSiteImage docsUrl={docsUrl} />
      {docsSite != null && <DocsSiteInfo docsSite={docsSite} />}
    </div>
  );
}
