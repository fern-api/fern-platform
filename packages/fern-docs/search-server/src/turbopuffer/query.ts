import { isNonNullish } from "@fern-api/ui-core-utils";
import { EVERYONE_ROLE } from "@fern-docs/utils";
import {
    FilterCondition,
    QueryResults,
    Turbopuffer,
} from "@turbopuffer/turbopuffer";
import { createRoleFacet } from "../shared/roles/create-role-facet";
import { createPermutations } from "../shared/roles/role-utils";
import { FernTurbopufferRecord } from "./types";

interface SemanticSearchOptions {
    vectorizer: (text: string) => Promise<number[]>;
    namespace: string;
    apiKey: string;
    topK: number;

    /**
     * The search mode to use.
     * @default "semantic"
     */
    mode?: "semantic" | "bm25" | "hybrid";

    authed?: boolean;
    roles?: string[];
}

export async function queryTurbopuffer(
    query: string,
    {
        vectorizer,
        namespace,
        apiKey,
        topK,
        mode = "semantic",
        authed = false,
        roles = [],
    }: SemanticSearchOptions
): Promise<FernTurbopufferRecord[]> {
    const tpuf = new Turbopuffer({
        apiKey,
        baseUrl: "https://gcp-us-east4.turbopuffer.com",
    });
    const ns = tpuf.namespace(namespace);

    const vector = await vectorizer(query);

    const authFilter: FilterCondition = authed
        ? ([
              "visible_by",
              "In",
              [
                  createRoleFacet([EVERYONE_ROLE]),
                  ...createPermutations(
                      roles.filter((r) => r !== EVERYONE_ROLE)
                  ).map((perms) => createRoleFacet(perms)),
              ],
          ] as const)
        : ["authed", "NotEq", true];

    const semanticResults =
        mode !== "bm25"
            ? await ns.query({
                  vector,
                  distance_metric: "cosine_distance",
                  top_k: topK,
                  include_attributes: true,
                  filters: authFilter,
              })
            : [];

    const bm25Results =
        mode !== "semantic"
            ? await ns.query({
                  top_k: topK,
                  include_attributes: true,
                  filters: authFilter,
                  rank_by: [
                      "Sum",
                      [
                          ["chunk", "BM25", query],
                          ["title", "BM25", query],
                          ["keywords", "BM25", query],
                          ["endpoint_path", "BM25", query],
                          ["endpoint_path_alternates", "BM25", query],
                      ],
                  ],
              })
            : [];

    return reciprocalRankFusion(
        semanticResults,
        bm25Results
    ) as unknown as FernTurbopufferRecord[];
}

type ResultItem = QueryResults[number];

function resultsToRanks(results: ResultItem[]): Record<string, number> {
    return results.reduce(
        (acc, item, index) => {
            acc[item.id] = index + 1;
            return acc;
        },
        {} as Record<string, number>
    );
}

function reciprocalRankFusion(
    bm25: ResultItem[],
    vector: ResultItem[],
    k: number = 60
): ResultItem[] {
    const resultsById: Record<string | number, ResultItem> = {};
    bm25.forEach((item) => (resultsById[item.id] = item));
    vector.forEach((item) => (resultsById[item.id] = item));

    const bm25Ranks = resultsToRanks(bm25);
    const vectorRanks = resultsToRanks(vector);

    const scores: Record<string, number> = {};

    const allDocIds = new Set([
        ...Object.keys(bm25Ranks),
        ...Object.keys(vectorRanks),
    ]);

    allDocIds.forEach((docId) => {
        const bm25Rank = bm25Ranks[docId] ?? Infinity;
        const vectorRank = vectorRanks[docId] ?? Infinity;
        scores[docId] = 1.0 / (k + bm25Rank) + 1.0 / (k + vectorRank);
    });

    return Object.entries(scores)
        .map(([docId, score]) => ({ id: docId, score }))
        .sort((a, b) => b.score - a.score)
        .map(({ id }) => resultsById[id])
        .filter(isNonNullish);
}
