import { FacetName } from "@/utils/facet-display";

export interface FacetFilter {
    facet: FacetName;
    value: string;
}

export interface FacetOpts {
    filters: readonly FacetFilter[];
}
