import { assertNever, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { FernNavigation } from "../generated";

interface ApiReferenceChildVisitor<T> {
    endpoint(node: FernNavigation.EndpointNode): T;
    endpointPair: (node: FernNavigation.EndpointPairNode) => T;
    webSocket(node: FernNavigation.WebSocketNode): T;
    webhook(node: FernNavigation.WebhookNode): T;
    apiSection(node: FernNavigation.ApiSectionNode): T;
    page(node: FernNavigation.PageNode): T;
    link(node: FernNavigation.LinkNode): T;
}

export function visitApiReferenceChild<T>(
    node: FernNavigation.ApiReferenceChild,
    visitor: ApiReferenceChildVisitor<T>,
): T {
    return visitDiscriminatedUnion(node, "type")._visit<T>({
        endpoint: visitor.endpoint,
        endpointPair: visitor.endpointPair,
        webSocket: visitor.webSocket,
        webhook: visitor.webhook,
        apiSection: visitor.apiSection,
        page: visitor.page,
        link: visitor.link,
        _other: (other) => assertNever(other as never),
    });
}
