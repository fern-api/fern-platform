import { ApiDefinition, FernNavigation } from "@fern-api/fdr-sdk";
import { NavigationNodePage } from "@fern-api/fdr-sdk/navigation";
import { measureBytes } from "@fern-api/ui-core-utils";
import { groupBy } from "es-toolkit/array";
import { AlgoliaRecord } from "../types";
import { createApiReferenceRecordHttp } from "./create-api-reference-record-http";
import { createApiReferenceRecordWebSocket } from "./create-api-reference-record-web-socket";
import { createApiReferenceRecordWebhook } from "./create-api-reference-record-webhook";
import { createBaseRecord } from "./create-base-record";
import { createChangelogRecord } from "./create-changelog-record";
import { createEndpointBaseRecordHttp } from "./create-endpoint-record-http";
import { createEndpointBaseRecordWebSocket } from "./create-endpoint-record-web-socket";
import { createEndpointBaseRecordWebhook } from "./create-endpoint-record-webhook";
import { createMarkdownRecords } from "./create-markdown-records";

interface CreateAlgoliaRecordsOptions {
  root: FernNavigation.RootNode;
  domain: string;
  org_id: string;
  pages: Record<FernNavigation.PageId, string>;
  apis: Record<ApiDefinition.ApiDefinitionId, ApiDefinition.ApiDefinition>;
  authed?: (node: NavigationNodePage) => boolean;
}

export function createAlgoliaRecords({
  root,
  domain,
  org_id,
  pages,
  apis,
  authed,
}: CreateAlgoliaRecordsOptions): {
  records: AlgoliaRecord[];
  /**
   * Records that are >= 100kb
   */
  tooLarge: {
    record: AlgoliaRecord;
    size: number;
  }[];
} {
  const collector = FernNavigation.NodeCollector.collect(root);

  const pageNodes = Array.from(collector.slugMap.values())
    .filter(FernNavigation.isPage)
    // exclude hidden pages
    .filter((node) => node.hidden !== true)
    // exclude pages that are noindexed
    .filter((node) =>
      FernNavigation.hasMarkdown(node) ? node.noindex !== true : true
    );

  const markdownNodes = pageNodes.filter(FernNavigation.hasMarkdown);
  const apiLeafNodes = pageNodes.filter(FernNavigation.isApiLeaf);

  const records: AlgoliaRecord[] = [];

  markdownNodes.forEach((node) => {
    const pageId = FernNavigation.getPageId(node);
    if (!pageId) {
      console.error(`Page node ${node.slug} has no page id`);
      return;
    }

    const markdown = pages[pageId];
    if (!markdown) {
      console.error(
        `Page node ${node.slug} has page id ${pageId} but no markdown`
      );
      return;
    }

    const base = createBaseRecord({
      node,
      parents: collector.getParents(node.id) ?? [],
      domain,
      org_id,
      authed: authed?.(node) ?? false,
    });

    if (node.type === "changelogEntry") {
      records.push(
        ...createChangelogRecord({ base, markdown, date: node.date })
      );
    } else {
      records.push(...createMarkdownRecords({ base, markdown }));
    }
  });

  apiLeafNodes.forEach((node) => {
    const apiDefinition = apis[node.apiDefinitionId];

    if (!apiDefinition) {
      console.error(
        `API leaf node ${node.slug} has api definition id ${node.apiDefinitionId} but no api definition`
      );
      return;
    }

    const base = createBaseRecord({
      node,
      parents: collector.getParents(node.id) ?? [],
      domain,
      org_id,
      authed: authed?.(node) ?? false,
    });

    if (node.type === "endpoint") {
      const endpoint = apiDefinition.endpoints[node.endpointId];
      if (!endpoint) {
        console.error(
          `API leaf node ${node.slug} has endpoint id ${node.endpointId} but no endpoint`
        );
        return;
      }

      const endpointBase = createEndpointBaseRecordHttp({
        base,
        node,
        endpoint,
        types: apiDefinition.types,
      });
      records.push(...createApiReferenceRecordHttp({ endpointBase, endpoint }));
      return;
    }

    if (node.type === "webSocket") {
      const endpoint = apiDefinition.websockets[node.webSocketId];
      if (!endpoint) {
        console.error(
          `API leaf node ${node.slug} has web socket id ${node.webSocketId} but no web socket`
        );
        return;
      }

      const endpointBase = createEndpointBaseRecordWebSocket({
        base,
        node,
        endpoint,
        types: apiDefinition.types,
      });
      records.push(createApiReferenceRecordWebSocket({ endpointBase }));
      return;
    }

    if (node.type === "webhook") {
      const endpoint = apiDefinition.webhooks[node.webhookId];
      if (!endpoint) {
        console.error(
          `API leaf node ${node.slug} has web hook id ${node.webhookId} but no web hook`
        );
        return;
      }

      const endpointBase = createEndpointBaseRecordWebhook({
        base,
        node,
        endpoint,
        types: apiDefinition.types,
      });
      records.push(
        ...createApiReferenceRecordWebhook({ endpointBase, endpoint })
      );
      return;
    }
  });

  // const distinctSlugs = new Set<string>();
  // collector.getNodesInOrder().forEach((node) => {
  //     if (!FernNavigation.hasMetadata(node)) {
  //         return;
  //     }

  //     if (distinctSlugs.has(node.slug)) {
  //         return;
  //     }

  //     distinctSlugs.add(node.slug);

  //     const base = createBaseRecord({ node, parents: collector.getParents(node.id) ?? [], domain, org_id, authed });
  //     records.push(createNavigationRecord({ base, node_type: node.type }));
  // });

  // remove all undefined values and filter out any record that is >= 100kb
  const jsonRecords = records.map((record) => JSON.stringify(record));
  const grouped = groupBy(jsonRecords, (record): "indexable" | "tooLarge" =>
    measureBytes(record) <= 100 * 1000 ? "indexable" : "tooLarge"
  );
  return {
    records: grouped.indexable?.map((record) => JSON.parse(record)) ?? [],
    tooLarge:
      grouped.tooLarge?.map((record) => ({
        record: JSON.parse(record),
        size: measureBytes(record),
      })) ?? [],
  };
}
