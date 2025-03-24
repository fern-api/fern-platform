"use client";

import { useMyDocsSites } from "@/lib/useMyDocsSites";

import { DocsSiteSelect } from "./DocsSiteSelect";

export declare namespace DocsSiteSwitcher {
  export interface Props {
    currentDomain: string;
  }
}

export function DocsSiteSwitcher({ currentDomain }: DocsSiteSwitcher.Props) {
  const { docsSites } = useMyDocsSites();

  return (
    <DocsSiteSelect docsSites={docsSites ?? []} currentDomain={currentDomain} />
  );
}
