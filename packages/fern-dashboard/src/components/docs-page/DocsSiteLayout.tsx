"use client";

import { DocsUrl } from "@/utils/types";
import { useDocsSite } from "@/utils/useMyDocsSites";

import { Page404 } from "../Page404";
import { DocsSiteNavBar } from "./DocsSiteNavBar";

export declare namespace DocsSiteLayout {
  export interface Props {
    docsUrl: DocsUrl;
    children: React.JSX.Element;
  }
}

export function DocsSiteLayout({ docsUrl, children }: DocsSiteLayout.Props) {
  const docsSite = useDocsSite(docsUrl);

  if (docsSite.type === "loaded" && docsSite.value == null) {
    return <Page404 />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-3">
        <div className="text-gray-1200 mb-1 text-xl font-bold dark:text-gray-200">
          {docsUrl}
        </div>
        <div className="flex items-center gap-2 rounded-full bg-green-300 px-3 py-2">
          <div className="bg-green-1100 size-2 rounded-full" />
          <div className="text-green-1100 mb-0.5 text-sm leading-none">
            Live
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4">
        <DocsSiteNavBar />
        <div className="flex">{children}</div>
      </div>
    </div>
  );
}
