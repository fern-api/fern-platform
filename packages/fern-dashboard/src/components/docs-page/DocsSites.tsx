import { DocsSite } from "@fern-platform/fdr";

import { DocsSiteCard } from "./DocsSiteCard";

export declare namespace DocsSites {
  export interface Props {
    docsSites: DocsSite[];
  }
}

export const DocsSites = ({ docsSites }: DocsSites.Props) => {
  return (
    <div className="flex flex-col gap-8">
      {docsSites.map((docsSite) => (
        <DocsSiteCard key={docsSite.domain} docsSite={docsSite} />
      ))}
    </div>
  );
};
