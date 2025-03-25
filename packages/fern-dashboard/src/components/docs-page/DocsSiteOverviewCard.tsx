"use client";

import { useMyDocsSites } from "@/lib/useMyDocsSites";

export declare namespace DocsSiteOverviewCard {
  export interface Props {
    domain: string;
  }
}

export function DocsSiteOverviewCard({ domain }: DocsSiteOverviewCard.Props) {
  const docsSites = useMyDocsSites();
  const docsSite = docsSites?.find(
    (docsSite) => docsSite.titleDomain === domain
  );

  if (docsSites != null && docsSite == null) {
    return <div>404</div>;
  }

  return (
    <div className="flex flex-1 rounded-xl border border-gray-500 bg-gray-100 p-6">
      {docsSite?.titleDomain}
    </div>
  );
}
