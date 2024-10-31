import { Algoliasearch } from "algoliasearch";
import { DISTINCT_FACET_ATTRIBUTES, SEARCHABLE_ATTRIBUTES } from "./types";

export async function setIndexSettings(
    client: Algoliasearch,
    indexName: string,
): Promise<{ taskID: number; updatedAt: string }> {
    return client.setSettings({
        indexName,
        indexSettings: {
            searchableAttributes: [...SEARCHABLE_ATTRIBUTES],
            attributesForFaceting: DISTINCT_FACET_ATTRIBUTES.map(
                (attribute) => `afterDistinct(filterOnly(${attribute}))`,
            ),
            unretrievableAttributes: ["org_id", "visible_by", "authed"],
            attributeForDistinct: "pathname",
            enableRules: true,
        },
    });
}
