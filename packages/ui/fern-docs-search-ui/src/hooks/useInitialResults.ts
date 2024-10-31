import { InitialResultsResponse } from "@/server/browse-results";
import useSWR from "swr";

const DEFAULT_INITIAL_RESULTS = { tabs: [], products: [], versions: [] };

export function useInitialResults(domain: string): {
    initialResults: InitialResultsResponse;
    isLoading: boolean;
} {
    const { data: initialResults, isLoading } = useSWR(
        [domain, "initial-results"],
        (): Promise<InitialResultsResponse> => fetch(`/api/initial-result?domain=${domain}`).then((res) => res.json()),
    );
    return { initialResults: initialResults ?? DEFAULT_INITIAL_RESULTS, isLoading };
}
