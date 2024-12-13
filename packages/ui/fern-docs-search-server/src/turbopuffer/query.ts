import { Turbopuffer } from "@turbopuffer/turbopuffer";
import { FernTurbopufferRecord } from "./types";

interface SemanticSearchOptions {
    vectorizer: (text: string) => Promise<number[]>;
    namespace: string;
    apiKey: string;
    topK: number;
}

export async function semanticSearch(query: string, opts: SemanticSearchOptions): Promise<FernTurbopufferRecord[]> {
    const tpuf = new Turbopuffer({ apiKey: opts.apiKey });
    const ns = tpuf.namespace(opts.namespace);

    const vector = await opts.vectorizer(query);

    const results = await ns.query({
        vector,
        distance_metric: "cosine_distance",
        top_k: opts.topK,
        include_attributes: true,
    });

    return results as unknown as FernTurbopufferRecord[];
}
