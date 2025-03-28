"use client";

import { DocsUrl } from "@/utils/types";
import { useDocsSite } from "@/utils/useMyDocsSites";

import { Page404 } from "../Page404";
import { PageHeader } from "../layout/PageHeader";
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
      <PageHeader
        title={docsUrl}
        titleRightContent={
          <div className="flex items-center gap-2 rounded-full bg-green-300 px-3 py-2">
            <div className="bg-green-1100 size-2 rounded-full" />
            <div className="text-green-1100 mb-0.5 text-sm leading-none">
              Live
            </div>
          </div>
        }
      />
      <div className="flex flex-col gap-4">
        <DocsSiteNavBar />
        <div className="flex">{children}</div>
      </div>
    </div>
  );
}
