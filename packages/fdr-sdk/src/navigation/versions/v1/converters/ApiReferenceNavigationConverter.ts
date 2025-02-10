import { noop } from "ts-essentials";
import urljoin from "url-join";

import titleCase from "@fern-api/ui-core-utils/titleCase";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";

import { FernNavigation } from "../../../..";
import { APIV1Read, DocsV1Read } from "../../../../client/types";
import { ApiDefinitionHolder } from "../../../ApiDefinitionHolder";
import { ROOT_PACKAGE_ID } from "../../../consts";
import { isSubpackage } from "../../../utils/isSubpackage";
import { stringifyEndpointPathParts } from "../../../utils/stringifyEndpointPathParts";
import { ChangelogNavigationConverter } from "./ChangelogConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { SlugGenerator } from "./SlugGenerator";

export class ApiReferenceNavigationConverter {
  public static convert(
    apiSection: DocsV1Read.ApiSection,
    api: APIV1Read.ApiDefinition,
    fullSlugMap?: Record<FernNavigation.V1.PageId, FernNavigation.V1.Slug>,
    noindexMap?: Record<FernNavigation.V1.PageId, boolean>,
    parentSlug?: SlugGenerator,
    idgen?: NodeIdGenerator,
    lexicographic?: boolean,
    disableEndpointPairs?: boolean,
    paginated?: boolean
  ) {
    return new ApiReferenceNavigationConverter(
      apiSection,
      api,
      fullSlugMap,
      noindexMap,
      parentSlug,
      idgen ?? new NodeIdGenerator(),
      lexicographic,
      disableEndpointPairs,
      paginated
    ).convert();
  }

  apiDefinitionId: FernNavigation.V1.ApiDefinitionId;
  #holder: ApiDefinitionHolder;
  #visitedEndpoints = new Set<FernNavigation.V1.EndpointId>();
  #visitedWebSockets = new Set<FernNavigation.V1.WebSocketId>();
  #visitedWebhooks = new Set<FernNavigation.V1.WebhookId>();
  #visitedSubpackages = new Set<string>();
  #idgen: NodeIdGenerator;
  private constructor(
    private apiSection: DocsV1Read.ApiSection,
    private api: APIV1Read.ApiDefinition,
    private fullSlugMap: Record<
      FernNavigation.V1.PageId,
      FernNavigation.V1.Slug
    > = {},
    private noindexMap: Record<FernNavigation.V1.PageId, boolean> = {},
    private parentSlug: SlugGenerator = SlugGenerator.init(""),
    idgen: NodeIdGenerator = new NodeIdGenerator(),
    private lexicographic: boolean = false,
    private disableEndpointPairs: boolean = false,
    private paginated: boolean | undefined
  ) {
    this.apiDefinitionId = FernNavigation.V1.ApiDefinitionId(api.id);
    this.#holder = ApiDefinitionHolder.create(api);
    this.#idgen = idgen;
  }

  private convert(): FernNavigation.V1.ApiReferenceNode {
    return this.#idgen.with(this.apiSection.urlSlug, (id) => {
      const overviewPageId =
        this.apiSection.navigation?.summaryPageId != null
          ? FernNavigation.V1.PageId(this.apiSection.navigation.summaryPageId)
          : undefined;
      const noindex =
        overviewPageId != null ? this.noindexMap[overviewPageId] : undefined;

      let slug = this.parentSlug.apply(this.apiSection);

      const frontmatterSlug =
        overviewPageId != null ? this.fullSlugMap[overviewPageId] : undefined;
      if (frontmatterSlug != null) {
        slug = this.parentSlug.set(frontmatterSlug);
      }

      const children = this.convertChildren(slug);
      const changelog =
        this.apiSection.changelog != null
          ? ChangelogNavigationConverter.convert(
              this.apiSection.changelog,
              this.fullSlugMap,
              this.noindexMap,
              slug,
              this.#idgen
            )
          : undefined;
      const pointsTo =
        FernNavigation.V1.followRedirects(children) ?? changelog?.slug;
      return {
        id,
        type: "apiReference",
        title: this.apiSection.title,
        apiDefinitionId: FernNavigation.V1.ApiDefinitionId(this.apiSection.api),
        overviewPageId,
        noindex,
        paginated:
          this.paginated ??
          (this.apiSection.longScrolling === false ? true : undefined),
        slug: slug.get(),
        icon: this.apiSection.icon,
        hidden: this.apiSection.hidden,
        hideTitle: this.apiSection.flattened,
        showErrors: this.apiSection.showErrors,
        changelog,
        children,
        availability: undefined,
        pointsTo,
        playground: undefined,
        authed: undefined,
        viewers: undefined,
        orphaned: undefined,
        featureFlags: undefined,
      };
    });
  }

  private convertChildren(
    parentSlug: SlugGenerator
  ): FernNavigation.V1.ApiPackageChild[] {
    if (this.apiSection.navigation != null) {
      return this.convertApiNavigationItems(
        this.apiSection.navigation.items,
        parentSlug,
        APIV1Read.SubpackageId("root")
      );
    }

    return this.convertPackageToChildren(this.api.rootPackage, parentSlug);
  }

  private convertEndpointNode(
    endpointId: FernNavigation.V1.EndpointId,
    endpoint: APIV1Read.EndpointDefinition,
    parentSlug: SlugGenerator
  ): FernNavigation.V1.EndpointNode | FernNavigation.V1.EndpointPairNode {
    return this.#idgen.with(endpointId, (id) => {
      return {
        id,
        type: "endpoint",
        title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
        endpointId,
        slug: parentSlug.apply(endpoint).get(),
        icon: undefined,
        hidden: undefined,
        method: endpoint.method,
        apiDefinitionId: this.apiDefinitionId,
        availability: FernNavigation.V1.convertAvailability(
          endpoint.availability
        ),
        isResponseStream: endpoint.response?.type.type === "stream",
        playground: undefined,
        authed: undefined,
        viewers: undefined,
        orphaned: undefined,
        featureFlags: undefined,
      };
    });
  }

  private convertWebSocketNode(
    webSocketId: FernNavigation.V1.WebSocketId,
    webSocket: APIV1Read.WebSocketChannel,
    parentSlug: SlugGenerator
  ): FernNavigation.V1.WebSocketNode {
    return this.#idgen.with(webSocketId, (id) => ({
      id,
      type: "webSocket",
      title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
      webSocketId,
      slug: parentSlug.apply(webSocket).get(),
      icon: undefined,
      hidden: undefined,
      apiDefinitionId: this.apiDefinitionId,
      availability: FernNavigation.V1.convertAvailability(
        webSocket.availability
      ),
      playground: undefined,
      authed: undefined,
      viewers: undefined,
      orphaned: undefined,
      featureFlags: undefined,
    }));
  }

  private convertWebhookNode(
    webhookId: FernNavigation.V1.WebhookId,
    webhook: APIV1Read.WebhookDefinition,
    parentSlug: SlugGenerator
  ): FernNavigation.V1.WebhookNode {
    return this.#idgen.with(webhookId, (id) => ({
      id,
      type: "webhook",
      title: webhook.name ?? urljoin("/", ...webhook.path),
      webhookId,
      slug: parentSlug.apply(webhook).get(),
      icon: undefined,
      hidden: undefined,
      method: webhook.method,
      apiDefinitionId: this.apiDefinitionId,
      availability: undefined,
      authed: undefined,
      viewers: undefined,
      orphaned: undefined,
      featureFlags: undefined,
    }));
  }

  private convertPackageToChildren(
    package_: APIV1Read.ApiDefinitionPackage,
    parentSlug: SlugGenerator
  ): FernNavigation.V1.ApiPackageChild[] {
    const children: FernNavigation.V1.ApiPackageChild[] = [];

    let subpackageId = isSubpackage(package_)
      ? package_.subpackageId
      : "__package__";
    while (package_.pointsTo != null) {
      subpackageId = package_.pointsTo;
      const pointsToSubpackage = this.api.subpackages[package_.pointsTo];
      if (pointsToSubpackage == null) {
        return [];
      }
      package_ = pointsToSubpackage;
    }

    if (this.#visitedSubpackages.has(subpackageId)) {
      return children;
    }

    package_.endpoints.forEach((endpoint) => {
      const endpointId = ApiDefinitionHolder.createEndpointId(
        endpoint,
        subpackageId
      );
      if (this.#visitedEndpoints.has(endpointId)) {
        return;
      }
      children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug));
      this.#visitedEndpoints.add(endpointId);
    });

    package_.websockets.forEach((webSocket) => {
      const webSocketId = ApiDefinitionHolder.createWebSocketId(
        webSocket,
        subpackageId
      );
      if (this.#visitedWebSockets.has(webSocketId)) {
        return;
      }
      children.push(
        this.convertWebSocketNode(webSocketId, webSocket, parentSlug)
      );
      this.#visitedWebSockets.add(webSocketId);
    });

    package_.webhooks.forEach((webhook) => {
      const webhookId = ApiDefinitionHolder.createWebhookId(
        webhook,
        subpackageId
      );
      if (this.#visitedWebhooks.has(webhookId)) {
        return;
      }
      children.push(this.convertWebhookNode(webhookId, webhook, parentSlug));
      this.#visitedWebhooks.add(webhookId);
    });

    package_.subpackages.forEach((subpackageId) => {
      const subpackage = this.api.subpackages[subpackageId];
      if (subpackage == null) {
        console.error(
          `Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`
        );
        return;
      }
      const child = this.#idgen.with(
        subpackageId,
        (id): FernNavigation.V1.ApiPackageNode | undefined => {
          const slug = parentSlug.apply(subpackage);
          const subpackageChildren = this.convertPackageToChildren(
            subpackage,
            slug
          );
          if (subpackageChildren.length === 0) {
            return;
          }
          const pointsTo =
            FernNavigation.V1.followRedirects(subpackageChildren);
          return {
            id,
            type: "apiPackage",
            children: subpackageChildren,
            title: subpackage.displayName ?? titleCase(subpackage.name),
            slug: slug.get(),
            icon: undefined,
            hidden: undefined,
            overviewPageId: undefined,
            noindex: undefined,
            availability: undefined,
            apiDefinitionId: this.apiDefinitionId,
            pointsTo,
            playground: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
            featureFlags: undefined,
          };
        }
      );
      if (child != null) {
        children.push(child);
      }
    });

    this.#visitedSubpackages.add(subpackageId);

    const toRet = this.mergeEndpointPairs(children);

    if (this.lexicographic) {
      toRet.sort((a, b) => {
        const aTitle = a.type === "endpointPair" ? a.nonStream.title : a.title;
        const bTitle = b.type === "endpointPair" ? b.nonStream.title : b.title;
        return aTitle.localeCompare(bTitle);
      });
    }

    return toRet;
  }

  private convertApiNavigationItems(
    items: DocsV1Read.ApiNavigationConfigItem[],
    parentSlug: SlugGenerator,
    subpackageId: APIV1Read.SubpackageId
  ): FernNavigation.V1.ApiPackageChild[] {
    const children: FernNavigation.V1.ApiPackageChild[] = [];
    let subpackage =
      subpackageId === "root"
        ? this.api.rootPackage
        : this.api.subpackages[subpackageId];
    if (subpackage == null) {
      throw new Error(
        `${subpackageId} is not present within known subpackages: ${Object.keys(this.api.subpackages).join(", ")}`
      );
    }
    while (subpackage.pointsTo != null) {
      subpackage = this.api.subpackages[subpackage.pointsTo];
      if (subpackage == null) {
        return [];
      }
    }
    const targetSubpackageId = isSubpackage(subpackage)
      ? subpackage.subpackageId
      : ROOT_PACKAGE_ID;
    const endpoints = new Map<string, APIV1Read.EndpointDefinition>();
    const webSockets = new Map<string, APIV1Read.WebSocketChannel>();
    const webhooks = new Map<string, APIV1Read.WebhookDefinition>();
    subpackage.endpoints.forEach((endpoint) => {
      endpoints.set(endpoint.id, endpoint);
    });
    subpackage.websockets.forEach((webSocket) => {
      webSockets.set(webSocket.id, webSocket);
    });
    subpackage.webhooks.forEach((webhook) => {
      webhooks.set(webhook.id, webhook);
    });
    items.forEach((item) => {
      visitDiscriminatedUnion(item, "type")._visit({
        page: (page) => {
          children.push(
            this.#idgen.with(page.urlSlug, (id) => {
              const pageId = FernNavigation.V1.PageId(page.id);
              const noindex = this.noindexMap[pageId];
              return {
                id,
                type: "page",
                title: page.title,
                pageId,
                noindex,
                slug: parentSlug.apply(page).get(),
                icon: page.icon,
                hidden: page.hidden,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
                featureFlags: undefined,
              };
            })
          );
        },
        endpointId: (oldEndpointId) => {
          const endpoint = endpoints.get(oldEndpointId.value);
          if (endpoint == null) {
            console.error(
              `Endpoint ${oldEndpointId.value} not found in ${targetSubpackageId}`
            );
            return;
          }
          const endpointId = ApiDefinitionHolder.createEndpointId(
            endpoint,
            targetSubpackageId
          );
          children.push(
            this.convertEndpointNode(endpointId, endpoint, parentSlug)
          );
          this.#visitedEndpoints.add(endpointId);
        },
        websocketId: (oldWebSocketId) => {
          const webSocket = webSockets.get(oldWebSocketId.value);
          if (webSocket == null) {
            console.error(
              `WebSocket ${oldWebSocketId.value} not found in ${targetSubpackageId}`
            );
            return;
          }
          const webSocketId = ApiDefinitionHolder.createWebSocketId(
            webSocket,
            targetSubpackageId
          );
          children.push(
            this.convertWebSocketNode(webSocketId, webSocket, parentSlug)
          );
          this.#visitedWebSockets.add(webSocketId);
        },
        webhookId: (oldWebhookId) => {
          const webhook = webhooks.get(oldWebhookId.value);
          if (webhook == null) {
            console.error(
              `Webhook ${oldWebhookId.value} not found in ${targetSubpackageId}`
            );
            return;
          }
          const webhookId = ApiDefinitionHolder.createWebhookId(
            webhook,
            targetSubpackageId
          );
          children.push(
            this.convertWebhookNode(webhookId, webhook, parentSlug)
          );
          this.#visitedWebhooks.add(webhookId);
        },
        subpackage: ({ subpackageId, items, summaryPageId }) => {
          const subpackage = this.api.subpackages[subpackageId];
          if (subpackage == null) {
            console.error(
              `Subpackage ${subpackageId} not found in ${targetSubpackageId}`
            );
            return;
          }
          let slug = parentSlug.apply(subpackage);

          const overviewPageId =
            summaryPageId != null
              ? FernNavigation.V1.PageId(summaryPageId)
              : undefined;
          const noindex =
            overviewPageId != null
              ? this.noindexMap[overviewPageId]
              : undefined;

          const frontmatterSlug =
            overviewPageId != null
              ? this.fullSlugMap[overviewPageId]
              : undefined;
          if (frontmatterSlug != null) {
            slug = this.parentSlug.set(frontmatterSlug);
          }

          this.#idgen.with(subpackageId, (id) => {
            const convertedItems = this.convertApiNavigationItems(
              items,
              slug,
              subpackageId
            );
            children.push({
              id,
              type: "apiPackage",
              children: convertedItems,
              title: subpackage.displayName ?? titleCase(subpackage.name),
              slug: slug.get(),
              icon: undefined,
              hidden: undefined,
              overviewPageId,
              noindex,
              availability: undefined,
              apiDefinitionId: this.apiDefinitionId,
              pointsTo: FernNavigation.V1.followRedirects(convertedItems),
              playground: undefined,
              authed: undefined,
              viewers: undefined,
              orphaned: undefined,
              featureFlags: undefined,
            });
          });
        },
        _other: noop,
      });
    });

    children.push(...this.convertPackageToChildren(subpackage, parentSlug));
    return this.mergeEndpointPairs(children);
  }

  private mergeEndpointPairs(
    children: FernNavigation.V1.ApiPackageChild[]
  ): FernNavigation.V1.ApiPackageChild[] {
    // if batch stream toggle is disabled, return children as is and skip merging
    if (this.disableEndpointPairs) {
      return children;
    }

    const toRet: FernNavigation.V1.ApiPackageChild[] = [];

    const methodAndPathToEndpointNode = new Map<
      string,
      FernNavigation.V1.EndpointNode
    >();
    children.forEach((child) => {
      if (child.type !== "endpoint") {
        toRet.push(child);
        return;
      }

      const endpoint = this.#holder.endpoints.get(child.endpointId);
      if (endpoint == null) {
        throw new Error(`Endpoint ${child.endpointId} not found`);
      }

      const methodAndPath = `${endpoint.method} ${stringifyEndpointPathParts(endpoint.path.parts)}`;

      const existing = methodAndPathToEndpointNode.get(methodAndPath);
      methodAndPathToEndpointNode.set(methodAndPath, child);

      if (
        existing == null ||
        toRet.indexOf(existing) === -1 ||
        existing.isResponseStream === child.isResponseStream
      ) {
        toRet.push(child);
        return;
      }

      const idx = toRet.indexOf(existing);
      const pairNode: FernNavigation.V1.EndpointPairNode = this.#idgen.with(
        "endpoint-pair",
        (id) => ({
          id,
          type: "endpointPair",
          stream: child.isResponseStream ? child : existing,
          nonStream: child.isResponseStream ? existing : child,
        })
      );

      toRet[idx] = pairNode;
    });

    return toRet;
  }
}
