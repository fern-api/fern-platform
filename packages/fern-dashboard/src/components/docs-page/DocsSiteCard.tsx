import { DocsSite } from "@fern-platform/fdr";

export declare namespace DocsSiteCard {
  export interface Props {
    docsSite: DocsSite;
  }
}

export const DocsSiteCard = ({ docsSite }: DocsSiteCard.Props) => {
  return <div className="flex flex-col">{docsSite.domain}</div>;
};
