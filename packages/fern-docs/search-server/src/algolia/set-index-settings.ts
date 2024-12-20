import { Algoliasearch } from "algoliasearch";
import {
  FILTERABLE_FACET_ATTRIBUTES,
  SEARCHABLE_ATTRIBUTES,
  SEARCHABLE_FACET_ATTRIBUTES,
} from "./types";

export async function setIndexSettings(
  client: Algoliasearch,
  indexName: string
): Promise<{ taskID: number; updatedAt: string }> {
  await client.saveRules({
    indexName: "fern-docs-search-index",
    rules: [],
  });

  return client.setSettings({
    indexName,
    indexSettings: {
      searchableAttributes: [...SEARCHABLE_ATTRIBUTES],
      attributesForFaceting: [
        ...FILTERABLE_FACET_ATTRIBUTES.map(
          (attribute) => `afterDistinct(filterOnly(${attribute}))`
        ),
        ...SEARCHABLE_FACET_ATTRIBUTES.map(
          (attribute) => `afterDistinct(searchable(${attribute}))`
        ),
      ],
      unretrievableAttributes: ["org_id", "visible_by", "authed"],
      attributeForDistinct: "canonicalPathname",
      enableRules: true,
      customRanking: ["desc(date_timestamp)", "asc(page_position)"],
      removeWordsIfNoResults: "allOptional",
      optionalWords: [
        "endpoint",
        "api",
        "guide",
        "documentation",
        "doc",
        "parameter",
        "webhook",
        "websocket",
        "http",
        "code",
        "snippet",
      ],
    },
  });
}
