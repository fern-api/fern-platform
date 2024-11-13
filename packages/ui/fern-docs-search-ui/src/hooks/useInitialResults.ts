import { FacetsResponse } from "@/server/browse-results";
import useSWR from "swr";

const DEFAULT_INITIAL_RESULTS = { tabs: [], products: [], versions: [] };

export function useInitialResults(domain: string): {
    facets: FacetsResponse;
    isLoading: boolean;
} {
    const { data: facets, isLoading } = useSWR(
        [domain, "initial-results"],
        (): Promise<FacetsResponse> => fetch(`/api/initial-result?domain=${domain}`).then((res) => res.json()),
    );
    return { facets: facets ?? DEFAULT_INITIAL_RESULTS, isLoading };
}
