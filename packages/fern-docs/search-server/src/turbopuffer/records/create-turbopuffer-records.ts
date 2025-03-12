import { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import {
  ApiDefinitionId,
  NavigationNodePage,
  NodeCollector,
  PageId,
  RootNode,
  getPageId,
  hasMarkdown,
  isApiLeaf,
} from "@fern-api/fdr-sdk/navigation";
import { flatten } from "es-toolkit/array";
import { FernTurbopufferRecordWithoutVector } from "../types";
import { createApiReferenceRecordHttp } from "./create-api-reference-record-http";
import { createApiReferenceRecordWebSocket } from "./create-api-reference-record-web-socket";
import { createApiReferenceRecordWebhook } from "./create-api-reference-record-webhook";
import { createBaseRecord } from "./create-base-record";
import { createEndpointBaseRecordHttp } from "./create-endpoint-record-http";
import { createEndpointBaseRecordWebSocket } from "./create-endpoint-record-web-socket";
import { createEndpointBaseRecordWebhook } from "./create-endpoint-record-webhook";
import { createMarkdownRecords } from "./create-markdown-records";

interface CreateTurbopufferRecordsOptions {
  root: RootNode;
  domain: string;
  org_id: string;
  pages: Record<PageId, string>;
  apis: Record<ApiDefinitionId, ApiDefinition>;
  authed?: (node: NavigationNodePage) => boolean;
  splitText: (text: string) => Promise<string[]>;
}

export async function createTurbopufferRecords({
  root,
  pages,
  apis,
  domain,
  org_id,
  authed,
  splitText,
}: CreateTurbopufferRecordsOptions): Promise<
  FernTurbopufferRecordWithoutVector[]
> {
  const collector = NodeCollector.collect(root);

  const pageNodes = collector.indexablePageNodesWithAuth;

  const markdownNodes = pageNodes
    .filter((node) => !isApiLeaf(node))
    .filter(hasMarkdown);
  const apiLeafNodes = pageNodes.filter(isApiLeaf);

  const markdownRecords = flatten(
    await Promise.all(
      markdownNodes.map(
        async (node): Promise<FernTurbopufferRecordWithoutVector[]> => {
          const pageId = getPageId(node);
          if (!pageId) {
            console.error(`Page node ${node.slug} has no page id`);
            return [];
          }

          const markdown = pages[pageId];
          if (!markdown) {
            console.error(
              `Page node ${node.slug} has page id ${pageId} but no markdown`
            );
            return [];
          }

          const base = createBaseRecord({
            node,
            parents: collector.getParents(node.id) ?? [],
            domain,
            org_id,
            authed: authed?.(node) ?? false,
            type: "markdown",
          });

          return createMarkdownRecords({ base, markdown, splitText });
        }
      )
    )
  );

  const apiReferenceRecords: FernTurbopufferRecordWithoutVector[] = [];
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
      type: "api-reference",
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
      apiReferenceRecords.push(
        ...createApiReferenceRecordHttp({ endpointBase, endpoint })
      );
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
      apiReferenceRecords.push(
        createApiReferenceRecordWebSocket({ endpointBase })
      );
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
      apiReferenceRecords.push(
        ...createApiReferenceRecordWebhook({ endpointBase, endpoint })
      );
      return;
    }
  });

  const records = [...markdownRecords, ...apiReferenceRecords];
  const nodeIds = new Set<string>();
  records.forEach((r) => {
    if (nodeIds.has(r.id)) {
      console.log("Duplicate node id", r.id);
    } else {
      nodeIds.add(r.id);
    }
  });
  // const records = [...markdownRecords];
  console.log(
    "Total chunk length:",
    records.reduce((sum, r) => sum + r.attributes.chunk.length, 0)
  );
  console.log("records.length", records.length);
  return records;
}
