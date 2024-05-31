import { noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import urljoin from "url-join";
import { APIV1Read, DocsV1Read } from "../../client";
import { FernNavigation } from "../generated";
import { convertAvailability } from "../utils/convertAvailability";
import { createSlug } from "../utils/createSlug";
import { isSubpackage } from "../utils/isSubpackage";
import { stringifyEndpointPathParts } from "../utils/stringifyEndpointPathParts";
import { ChangelogNavigationConverter } from "./ChangelogConverter";

export class ApiReferenceNavigationConverter {
    public static convert(
        apiSection: DocsV1Read.ApiSection,
        apis: Record<string, APIV1Read.ApiDefinition>,
        baseSlug: string[],
        parentSlug: string[],
    ) {
        return new ApiReferenceNavigationConverter(apiSection, apis, baseSlug, parentSlug).convert();
    }

    private api: APIV1Read.ApiDefinition;
    private apiDefinitionId: FernNavigation.ApiDefinitionId;
    private endpoints = new Map<FernNavigation.EndpointId, APIV1Read.EndpointDefinition>();
    private webSockets = new Map<FernNavigation.WebSocketId, APIV1Read.WebSocketChannel>();
    private webhooks = new Map<FernNavigation.WebhookId, APIV1Read.WebhookDefinition>();
    private visitedEndpoints = new Set<FernNavigation.EndpointId>();
    private visitedWebSockets = new Set<FernNavigation.WebSocketId>();
    private visitedWebhooks = new Set<FernNavigation.WebhookId>();
    private visitedSubpackages = new Set<string>();
    private constructor(
        private apiSection: DocsV1Read.ApiSection,
        apis: Record<string, APIV1Read.ApiDefinition>,
        private baseSlug: string[],
        private apiDefinitionParentSlug: string[],
    ) {
        this.api = apis[apiSection.api];
        if (this.api == null) {
            throw new Error(`API ${apiSection.api} not found}`);
        }
        this.apiDefinitionId = FernNavigation.ApiDefinitionId(this.api.id);
        [this.api.rootPackage, ...Object.values(this.api.subpackages)].forEach((package_) => {
            const subpackageId = isSubpackage(package_) ? package_.subpackageId : "root";
            package_.endpoints.forEach((endpoint) => {
                this.endpoints.set(createEndpointId(endpoint, subpackageId), endpoint);
            });
            package_.websockets.forEach((webSocket) => {
                this.webSockets.set(createWebSocketId(webSocket, subpackageId), webSocket);
            });
            package_.webhooks.forEach((webhook) => {
                this.webhooks.set(createWebhookId(webhook, subpackageId), webhook);
            });
        });
    }

    private convert(): FernNavigation.ApiReferenceNode {
        const overviewPageId =
            this.apiSection.navigation?.summaryPageId != null
                ? FernNavigation.PageId(this.apiSection.navigation.summaryPageId)
                : undefined;

        const slug = createSlug(this.baseSlug, this.apiDefinitionParentSlug, this.apiSection);
        return {
            type: "apiReference",
            title: this.apiSection.title,
            apiDefinitionId: FernNavigation.ApiDefinitionId(this.apiSection.api),
            overviewPageId,
            disableLongScrolling: this.apiSection.longScrolling === false ? true : undefined,
            slug,
            icon: this.apiSection.icon,
            hidden: this.apiSection.hidden,
            hideTitle: this.apiSection.flattened,
            changelog:
                this.apiSection.changelog != null
                    ? ChangelogNavigationConverter.convert(this.apiSection.changelog, this.baseSlug, slug)
                    : undefined,
            children: this.convertChildren(slug),
            availability: undefined,
        };
    }

    private convertChildren(parentSlug: string[]): FernNavigation.ApiReferenceChild[] {
        if (this.apiSection.navigation != null) {
            return this.convertApiNavigationItems(this.apiSection.navigation.items, parentSlug, "root");
        }

        return this.convertPackageToChildren(this.api.rootPackage, parentSlug);
    }

    private convertEndpointNode(
        endpointId: FernNavigation.EndpointId,
        endpoint: APIV1Read.EndpointDefinition,
        parentSlug: string[],
    ): FernNavigation.EndpointNode | FernNavigation.EndpointPairNode {
        return {
            type: "endpoint",
            title: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
            endpointId,
            slug: createSlug(this.baseSlug, parentSlug, endpoint),
            icon: undefined,
            hidden: undefined,
            method: endpoint.method,
            apiDefinitionId: this.apiDefinitionId,
            availability: convertAvailability(endpoint.availability),
            isResponseStream: endpoint.response?.type.type === "stream",
        };
    }

    private convertWebSocketNode(
        webSocketId: FernNavigation.WebSocketId,
        webSocket: APIV1Read.WebSocketChannel,
        parentSlug: string[],
    ): FernNavigation.WebSocketNode {
        return {
            type: "webSocket",
            title: webSocket.name ?? stringifyEndpointPathParts(webSocket.path.parts),
            webSocketId,
            slug: createSlug(this.baseSlug, parentSlug, webSocket),
            icon: undefined,
            hidden: undefined,
            apiDefinitionId: this.apiDefinitionId,
            availability: convertAvailability(webSocket.availability),
        };
    }

    private convertWebhookNode(
        webhookId: FernNavigation.WebhookId,
        webhook: APIV1Read.WebhookDefinition,
        parentSlug: string[],
    ): FernNavigation.WebhookNode {
        return {
            type: "webhook",
            title: webhook.name ?? urljoin("/", ...webhook.path),
            webhookId,
            slug: createSlug(this.baseSlug, parentSlug, webhook),
            icon: undefined,
            hidden: undefined,
            method: webhook.method,
            apiDefinitionId: this.apiDefinitionId,
            availability: undefined,
        };
    }

    private convertPackageToChildren(
        package_: APIV1Read.ApiDefinitionPackage,
        parentSlug: string[],
    ): FernNavigation.ApiReferenceChild[] {
        const children: FernNavigation.ApiReferenceChild[] = [];

        let subpackageId = isSubpackage(package_) ? package_.subpackageId : "root";
        while (package_.pointsTo != null) {
            subpackageId = package_.pointsTo;
            package_ = this.api.subpackages[package_.pointsTo];
            if (package_ == null) {
                return [];
            }
        }

        if (this.visitedSubpackages.has(subpackageId)) {
            return children;
        }

        package_.endpoints.forEach((endpoint) => {
            const endpointId = createEndpointId(endpoint, subpackageId);
            if (this.visitedEndpoints.has(endpointId)) {
                return;
            }
            children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug));
            this.visitedEndpoints.add(endpointId);
        });

        package_.websockets.forEach((webSocket) => {
            const webSocketId = createWebSocketId(webSocket, subpackageId);
            if (this.visitedWebSockets.has(webSocketId)) {
                return;
            }
            children.push(this.convertWebSocketNode(webSocketId, webSocket, parentSlug));
            this.visitedWebSockets.add(webSocketId);
        });

        package_.webhooks.forEach((webhook) => {
            const webhookId = createWebhookId(webhook, subpackageId);
            if (this.visitedWebhooks.has(webhookId)) {
                return;
            }
            children.push(this.convertWebhookNode(webhookId, webhook, parentSlug));
            this.visitedWebhooks.add(webhookId);
        });

        package_.subpackages.forEach((subpackageId) => {
            const subpackage = this.api.subpackages[subpackageId];
            if (subpackage == null) {
                // eslint-disable-next-line no-console
                console.error(`Subpackage ${subpackageId} not found in ${this.apiDefinitionId}`);
                return;
            }
            const slug = createSlug(this.baseSlug, parentSlug, subpackage);
            const subpackageChildren = this.convertPackageToChildren(subpackage, slug);
            if (subpackageChildren.length === 0) {
                return;
            }
            children.push({
                type: "apiSection",
                children: subpackageChildren,
                title: subpackage.displayName ?? subpackage.name,
                slug,
                icon: undefined,
                hidden: undefined,
                overviewPageId: undefined,
                availability: undefined,
            });
        });

        this.visitedSubpackages.add(subpackageId);

        return this.mergeEndpointPairs(children);
    }

    private convertApiNavigationItems(
        items: DocsV1Read.ApiNavigationConfigItem[],
        parentSlug: string[],
        subpackageId: string,
    ): FernNavigation.ApiReferenceChild[] {
        const children: FernNavigation.ApiReferenceChild[] = [];
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
            endpoints.set(createEndpointId(endpoint, targetSubpackageId), endpoint);
        });
        subpackage.websockets.forEach((webSocket) => {
            webSockets.set(createWebSocketId(webSocket, targetSubpackageId), webSocket);
        });
        subpackage.webhooks.forEach((webhook) => {
            webhooks.set(createWebhookId(webhook, targetSubpackageId), webhook);
        });
        items.forEach((item) => {
            visitDiscriminatedUnion(item, "type")._visit({
                page: (page) => {
                    children.push({
                        type: "page",
                        title: page.title,
                        pageId: FernNavigation.PageId(page.id),
                        slug: createSlug(this.baseSlug, parentSlug, page),
                        icon: page.icon,
                        hidden: page.hidden,
                    });
                },
                endpointId: (oldEndpointId) => {
                    const endpoint = endpoints.get(oldEndpointId.value);
                    if (endpoint == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Endpoint ${oldEndpointId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const endpointId = createEndpointId(endpoint, targetSubpackageId);
                    children.push(this.convertEndpointNode(endpointId, endpoint, parentSlug));
                    this.visitedEndpoints.add(endpointId);
                },
                websocketId: (oldWebSocketId) => {
                    const webSocket = webSockets.get(oldWebSocketId.value);
                    if (webSocket == null) {
                        // eslint-disable-next-line no-console
                        console.error(`WebSocket ${oldWebSocketId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const webSocketId = createWebSocketId(webSocket, targetSubpackageId);
                    children.push(this.convertWebSocketNode(webSocketId, webSocket, parentSlug));
                    this.visitedWebSockets.add(webSocketId);
                },
                webhookId: (oldWebhookId) => {
                    const webhook = webhooks.get(oldWebhookId.value);
                    if (webhook == null) {
                        // eslint-disable-next-line no-console
                        console.error(`Webhook ${oldWebhookId.value} not found in ${targetSubpackageId}`);
                        return;
                    }
                    const webhookId = createWebhookId(webhook, targetSubpackageId);
                    children.push(this.convertWebhookNode(webhookId, webhook, parentSlug));
                    this.visitedWebhooks.add(webhookId);
                },
                subpackage: ({ subpackageId, items }) => {
                    const subpackage = this.api.subpackages[subpackageId];
                    const slug = createSlug(this.baseSlug, parentSlug, subpackage);
                    this.convertApiNavigationItems(items, slug, subpackageId);
                },
                _other: noop,
            });
        });

        children.push(...this.convertPackageToChildren(subpackage, parentSlug));
        return this.mergeEndpointPairs(children);
    }

    private mergeEndpointPairs(children: FernNavigation.ApiReferenceChild[]): FernNavigation.ApiReferenceChild[] {
        const toRet: FernNavigation.ApiReferenceChild[] = [];

        const methodAndPathToEndpointNode = new Map<string, FernNavigation.EndpointNode>();
        children.forEach((child) => {
            if (child.type !== "endpoint") {
                toRet.push(child);
                return;
            }

            const endpoint = this.endpoints.get(child.endpointId);
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
            const pairNode: FernNavigation.EndpointPairNode = {
                type: "endpointPair",
                stream: child.isResponseStream ? child : existing,
                nonStream: child.isResponseStream ? existing : child,
            };

            toRet[idx] = pairNode;
        });

        return toRet;
    }
}

function createEndpointId(endpoint: APIV1Read.EndpointDefinition, subpackageId: string): FernNavigation.EndpointId {
    return FernNavigation.EndpointId(endpoint.originalEndpointId ?? `${subpackageId}.${endpoint.id}`);
}
function createWebSocketId(webSocket: APIV1Read.WebSocketChannel, subpackageId: string): FernNavigation.WebSocketId {
    return FernNavigation.WebSocketId(`${subpackageId}.${webSocket.id}`);
}
function createWebhookId(webhook: APIV1Read.WebhookDefinition, subpackageId: string): FernNavigation.WebhookId {
    return FernNavigation.WebhookId(`${subpackageId}.${webhook.id}`);
}
