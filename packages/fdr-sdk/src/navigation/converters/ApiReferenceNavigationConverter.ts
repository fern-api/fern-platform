import { noop } from "ts-essentials";
import urljoin from "url-join";
import { APIV1Read, DocsV1Read } from "../../client";
import { titleCase, visitDiscriminatedUnion } from "../../utils";
import { ApiDefinitionHolder } from "../ApiDefinitionHolder";
import { FernNavigation } from "../generated";
import { followRedirects } from "../utils";
import { convertAvailability } from "../utils/convertAvailability";
import { isSubpackage } from "../utils/isSubpackage";
import { stringifyEndpointPathParts } from "../utils/stringifyEndpointPathParts";
import { ChangelogNavigationConverter } from "./ChangelogConverter";
import { NodeIdGenerator } from "./NodeIdGenerator";
import { SlugGenerator } from "./SlugGenerator";

export class ApiReferenceNavigationConverter {
    public static convert(
        apiSection: DocsV1Read.ApiSection,
        api: APIV1Read.ApiDefinition,
        noindexMap: Record<FernNavigation.PageId, boolean>,
        parentSlug: SlugGenerator,
        idgen?: NodeIdGenerator,
        lexicographic?: boolean,
    ) {
        return new ApiReferenceNavigationConverter(
            apiSection,
            api,
            noindexMap,
            parentSlug,
            idgen ?? new NodeIdGenerator(),
            lexicographic,
        ).convert();
    }

    apiDefinitionId: FernNavigation.ApiDefinitionId;
    #holder: ApiDefinitionHolder;
    #visitedEndpoints = new Set<FernNavigation.EndpointId>();
    #visitedWebSockets = new Set<FernNavigation.WebSocketId>();
    #visitedWebhooks = new Set<FernNavigation.WebhookId>();
    #visitedSubpackages = new Set<string>();
    #idgen: NodeIdGenerator;
    private constructor(
        private apiSection: DocsV1Read.ApiSection,
        private api: APIV1Read.ApiDefinition,
        private noindexMap: Record<FernNavigation.PageId, boolean>,
        private parentSlug: SlugGenerator,
        idgen: NodeIdGenerator,
        private lexicographic: boolean = false,
    ) {
        this.apiDefinitionId = FernNavigation.ApiDefinitionId(api.id);
        this.#holder = ApiDefinitionHolder.create(api);
        this.#idgen = idgen;
    }

    private convert(): FernNavigation.ApiReferenceNode {
        return this.#idgen.with(this.apiSection.urlSlug, (id) => {
            const overviewPageId =
                this.apiSection.navigation?.summaryPageId != null
                    ? FernNavigation.PageId(this.apiSection.navigation.summaryPageId)
                    : undefined;
            const noindex = overviewPageId != null ? this.noindexMap[overviewPageId] : undefined;

            const slug = this.parentSlug.apply(this.apiSection);
            const children = this.convertChildren(slug);
            const changelog =
                this.apiSection.changelog != null
                    ? ChangelogNavigationConverter.convert(
                          this.apiSection.changelog,
                          this.noindexMap,
                          slug,
                          this.#idgen,
                      )
                    : undefined;
            const pointsTo = followRedirects(children) ?? changelog?.slug;
            return {
                id,
                type: "apiReference",
                title: this.apiSection.title,
                apiDefinitionId: FernNavigation.ApiDefinitionId(this.apiSection.api),
                overviewPageId,
                noindex,
                disableLongScrolling: this.apiSection.longScrolling === false ? true : undefined,
                slug: slug.get(),
                icon: this.apiSection.icon,
                hidden: this.apiSection.hidden,
                hideTitle: this.apiSection.flattened,
                showErrors: this.apiSection.showErrors,
                changelog,
                children,
                availability: undefined,
                pointsTo,
            };
        });
    }

    private convertChildren(parentSlug: SlugGenerator): FernNavigation.ApiPackageChild[] {
        if (this.apiSection.navigation != null) {
            return this.convertApiNavigationItems(this.apiSection.navigation.items, parentSlug, "root");
        }

        return this.convertPackageToChildren(this.api.rootPackage, parentSlug);
    }

    private convertEndpointNode(
        endpointId: FernNavigation.EndpointId,
        endpoint: APIV1Read.EndpointDefinition,
        parentSlug: SlugGenerator,
    ): FernNavigation.EndpointNode | FernNavigation.EndpointPairNode {
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
                availability: convertAvailability(endpoint.availability),
                isResponseStream: endpoint.response?.type.type === "stream",
            };
        });
    }

    private convertWebSocketNode(
        webSocketId: FernNavigation.WebSocketId,
        webSocket: APIV1Read.WebSocketChannel,
        parentSlug: SlugGenerator,
    ): FernNavigation.WebSocketNode {
        return this.#idgen.with(webSocketId, (id) => ({
            id,
            type: "webSocket",
            title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
            webSocketId,
            slug: parentSlug.apply(webSocket).get(),
            icon: undefined,
            hidden: undefined,
            apiDefinitionId: this.apiDefinitionId,
            availability: convertAvailability(webSocket.availability),
        }));
    }

    private convertWebhookNode(
        webhookId: FernNavigation.WebhookId,
        webhook: APIV1Read.WebhookDefinition,
        parentSlug: SlugGenerator,
    ): FernNavigation.WebhookNode {
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
        }));
    }

    private convertPackageToChildren(
        package_: APIV1Read.ApiDefinitionPackage,
        parentSlug: SlugGenerator,
    ): FernNavigation.ApiPackageChild[] {
        const children: FernNavigation.ApiPackageChild[] = [];

        let subpackageId = isSubpackage(package_) ? package_.subpackageId : "root";
        while (package_.pointsTo != null) {
            subpackageId = package_.pointsTo;
            package_ = this.api.subpackages[package_.pointsTo];
            if (package_ == null) {
                return [];
            }
        }

        if (this.#visitedSubpackages.has(subpackageId)) {
            return children;
        }

        package_.endpoints.forEach((endpoint) => {
            const endpointId = ApiDefinitionHolder.createEndpointId(endpoint, subpackageId);
            if (this.#visitedEndpoints.has(endpointId)) {
                return;
            }
            children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug));
            this.#visitedEndpoints.add(endpointId);
        });

        package_.websockets.forEach((webSocket) => {
            const webSocketId = ApiDefinitionHolder.createWebSocketId(webSocket, subpackageId);
            if (this.#visitedWebSockets.has(webSocketId)) {
                return;
            }
            children.push(this.convertWebSocketNode(webSocketId, webSocket, parentSlug));
            this.#visitedWebSockets.add(webSocketId);
        });

        package_.webhooks.forEach((webhook) => {
            const webhookId = ApiDefinitionHolder.createWebhookId(webhook, subpackageId);
            if (this.#visitedWebhooks.has(webhookId)) {
                return;
            }
            children.push(this.convertWebhookNode(webhookId, webhook, parentSlug));
            this.#visitedWebhooks.add(webhookId);
        });

        package_.subpackages.forEach((subpackageId) => {
            const subpackage = this.api.subpackages[subpackageId];
            if (subpackage == null) {
                // eslint-disable-next-line no-console
                console.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }
            const child = this.#idgen.with(subpackageId, (id): FernNavigation.ApiPackageNode | undefined => {
                const slug = parentSlug.apply(subpackage);
                const subpackageChildren = this.convertPackageToChildren(subpackage, slug);
                if (subpackageChildren.length === 0) {
                    return;
                }
                const pointsTo = followRedirects(subpackageChildren);
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
                };
            });
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
        subpackageId: string,
    ): FernNavigation.ApiPackageChild[] {
        const children: FernNavigation.ApiPackageChild[] = [];
        let subpackage = subpackageId === "root" ? this.api.rootPackage : this.api.subpackages[subpackageId];
        while (subpackage.pointsTo != null) {
            subpackage = this.api.subpackages[subpackage.pointsTo];
            if (subpackage == null) {
                return [];
            }
        }
        const targetSubpackageId = isSubpackage(subpackage) ? subpackage.subpackageId : "root";
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
                            const pageId = FernNavigation.PageId(page.id);
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
                            };
                        }),
                    );
                },
                endpointId: (oldEndpointId) => {
                    const endpoint = endpoints.get(oldEndpointId.value);
                    if (endpoint == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Endpoint ${oldEndpointId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const endpointId = ApiDefinitionHolder.createEndpointId(endpoint, targetSubpackageId);
                    children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug));
                    this.#visitedEndpoints.add(endpointId);
                },
                websocketId: (oldWebSocketId) => {
                    const webSocket = webSockets.get(oldWebSocketId.value);
                    if (webSocket == null) {
                        // eslint-disable-next-line no-console
                        console.error(`WebSocket ${oldWebSocketId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const webSocketId = ApiDefinitionHolder.createWebSocketId(webSocket, targetSubpackageId);
                    children.push(this.convertWebSocketNode(webSocketId, webSocket, parentSlug));
                    this.#visitedWebSockets.add(webSocketId);
                },
                webhookId: (oldWebhookId) => {
                    const webhook = webhooks.get(oldWebhookId.value);
                    if (webhook == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Webhook ${oldWebhookId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const webhookId = ApiDefinitionHolder.createWebhookId(webhook, targetSubpackageId);
                    children.push(this.convertWebhookNode(webhookId, webhook, parentSlug));
                    this.#visitedWebhooks.add(webhookId);
                },
                subpackage: ({ subpackageId, items, summaryPageId }) => {
                    const subpackage = this.api.subpackages[subpackageId];
                    if (subpackage == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Subpackage ${subpackageId} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const slug = parentSlug.apply(subpackage);
                    this.#idgen.with(subpackageId, (id) => {
                        const convertedItems = this.convertApiNavigationItems(items, slug, subpackageId);
                        const overviewPageId = summaryPageId != null ? FernNavigation.PageId(summaryPageId) : undefined;
                        const noindex = overviewPageId != null ? this.noindexMap[overviewPageId] : undefined;
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
                            pointsTo: followRedirects(convertedItems),
                        });
                    });
                },
                _other: noop,
            });
        });

        children.push(...this.convertPackageToChildren(subpackage, parentSlug));
        return this.mergeEndpointPairs(children);
    }

    private mergeEndpointPairs(children: FernNavigation.ApiPackageChild[]): FernNavigation.ApiPackageChild[] {
        const toRet: FernNavigation.ApiPackageChild[] = [];

        const methodAndPathToEndpointNode = new Map<string, FernNavigation.EndpointNode>();
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
            const pairNode: FernNavigation.EndpointPairNode = this.#idgen.with("endpoint-pair", (id) => ({
                id,
                type: "endpointPair",
                stream: child.isResponseStream ? child : existing,
                nonStream: child.isResponseStream ? existing : child,
            }));

            toRet[idx] = pairNode;
        });

        return toRet;
    }
}
