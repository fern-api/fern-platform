import {
  NavigationNodePage,
  NodeCollector,
  PageId,
  RootNode,
  getPageId,
  hasMarkdown,
  isPage,
} from "@fern-api/fdr-sdk/navigation";
import { flatten } from "es-toolkit/array";
import { FernTurbopufferRecordWithoutVector } from "../types";
import { createBaseRecord } from "./create-base-record";
import { createMarkdownRecords } from "./create-markdown-records";

interface CreateTurbopufferRecordsOptions {
  root: RootNode;
  domain: string;
  org_id: string;
  pages: Record<PageId, string>;
  // apis: Record<ApiDefinitionId, ApiDefinition>;
  authed?: (node: NavigationNodePage) => boolean;
  splitText: (text: string) => Promise<string[]>;
}

export async function createTurbopufferRecords({
  root,
  pages,
  // apis,
  domain,
  org_id,
  authed,
  splitText,
}: CreateTurbopufferRecordsOptions): Promise<
  FernTurbopufferRecordWithoutVector[]
> {
  const collector = NodeCollector.collect(root);

  const pageNodes = Array.from(collector.slugMap.values())
    .filter(isPage)
    // exclude hidden pages
    .filter((node) => node.hidden !== true)
    // exclude pages that are noindexed
    .filter((node) => (hasMarkdown(node) ? node.noindex !== true : true));

  const markdownNodes = pageNodes.filter(hasMarkdown);
  // const apiLeafNodes = pageNodes.filter(isApiLeaf);

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

  // apiLeafNodes.forEach((node) => {
  //     const apiDefinition = apis[node.apiDefinitionId];

  //     if (!apiDefinition) {
  //         // eslint-disable-next-line no-console
  //         console.error(
  //             `API leaf node ${node.slug} has api definition id ${node.apiDefinitionId} but no api definition`,
  //         );
  //         return;
  //     }

  //     const base = createBaseRecord({
  //         node,
  //         parents: collector.getParents(node.id) ?? [],
  //         domain,
  //         org_id,
  //         authed: authed?.(node) ?? false,
  //         type: "api-reference",
  //     });

  //     if (node.type === "endpoint") {
  //         const endpoint = apiDefinition.endpoints[node.endpointId];
  //         if (!endpoint) {
  //             // eslint-disable-next-line no-console
  //             console.error(`API leaf node ${node.slug} has endpoint id ${node.endpointId} but no endpoint`);
  //             return;
  //         }

  //         const endpointBase = createEndpointBaseRecordHttp({ base, node, endpoint, types: apiDefinition.types });
  //         records.push(...createApiReferenceRecordHttp({ endpointBase, endpoint }));
  //         return;
  //     }

  //     if (node.type === "webSocket") {
  //         const endpoint = apiDefinition.websockets[node.webSocketId];
  //         if (!endpoint) {
  //             // eslint-disable-next-line no-console
  //             console.error(`API leaf node ${node.slug} has web socket id ${node.webSocketId} but no web socket`);
  //             return;
  //         }

  //         const endpointBase = createEndpointBaseRecordWebSocket({
  //             base,
  //             node,
  //             endpoint,
  //             types: apiDefinition.types,
  //         });
  //         records.push(createApiReferenceRecordWebSocket({ endpointBase }));
  //         return;
  //     }

  //     if (node.type === "webhook") {
  //         const endpoint = apiDefinition.webhooks[node.webhookId];
  //         if (!endpoint) {
  //             // eslint-disable-next-line no-console
  //             console.error(`API leaf node ${node.slug} has web hook id ${node.webhookId} but no web hook`);
  //             return;
  //         }

  //         const endpointBase = createEndpointBaseRecordWebhook({ base, node, endpoint, types: apiDefinition.types });
  //         records.push(...createApiReferenceRecordWebhook({ endpointBase, endpoint }));
  //         return;
  //     }
  // });

  return markdownRecords;
}
