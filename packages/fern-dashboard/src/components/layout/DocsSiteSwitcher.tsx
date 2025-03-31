"use client";

import { useParams } from "next/navigation";

import { useMyDocsSites } from "@/state/useMyDocsSites";
import { parseDocsUrlParam } from "@/utils/parseDocsUrlParam";

import { DocsSiteSelect } from "./DocsSiteSelect";

export function DocsSiteSwitcher() {
  const docsSites = useMyDocsSites();

  const params = useParams<{ docsUrl?: string }>();
  if (params.docsUrl == null) {
    return null;
  }

  return (
    <DocsSiteSelect
      docsSites={docsSites.type === "loaded" ? docsSites.value : []}
      currentDocsUrl={
        params.docsUrl != null
          ? parseDocsUrlParam({ docsUrl: params.docsUrl })
          : undefined
      }
    />
  );
}
