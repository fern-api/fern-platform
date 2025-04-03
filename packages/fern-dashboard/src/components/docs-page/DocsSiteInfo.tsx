"use client";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { DocsSiteLink } from "./DocsSiteLink";

export declare namespace DocsSiteInfo {
  export interface Props {
    docsSite: FdrAPI.dashboard.DocsSite;
  }
}

export function DocsSiteInfo({ docsSite }: DocsSiteInfo.Props) {
  console.log({ docsSite });
  return (
    <div className="flex flex-col">
      <div className="mb-2 text-gray-900 dark:text-gray-800">Domains</div>
      <div className="flex flex-col items-start gap-1">
        {docsSite.urls.map((url) => (
          <DocsSiteLink key={`${url.domain}${url.path}`} docsSiteUrl={url} />
        ))}
      </div>
    </div>
  );
}
