import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { dfs } from "@fern-api/fdr-sdk/traversers";
import { atom, useAtomValue } from "jotai";
import { freezeAtom } from "jotai/utils";
import dynamic from "next/dynamic";
import { memo, useEffect, useMemo } from "react";
import { UnreachableCaseError } from "ts-essentials";
import { useMemoOne } from "use-memo-one";
import { SLUG_ATOM, useIsReady } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { scrollToRoute } from "../util/anchor";

const ApiSectionMarkdownPage = dynamic(
    () => import("./ApiSectionMarkdownPage").then(({ ApiSectionMarkdownPage }) => ApiSectionMarkdownPage),
    { ssr: true },
);
const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });
const EndpointPair = dynamic(() => import("./endpoints/EndpointPair").then(({ EndpointPair }) => EndpointPair), {
    ssr: true,
});

export interface ApiReferenceContentsProps {
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    apiDefinition: ApiDefinition;
    node: FernNavigation.ApiReferenceNode;
    mdxs: Record<FernNavigation.NodeId, FernDocs.MarkdownText>;
    showErrors: boolean;
}

type ApiPackageChildNode =
    | FernNavigation.ApiReferenceNode
    | Exclude<FernNavigation.ApiPackageChild, FernNavigation.LinkNode>;

const UnmemoizedApiPackageContents: React.FC<ApiReferenceContentsProps> = ({
    mdxs,
    breadcrumb,
    showErrors,
    apiDefinition,
    node,
}) => {
    const initialSlug = useAtomValue(useMemoOne(() => freezeAtom(atom((get) => get(SLUG_ATOM))), []));
    const isReady = useIsReady();

    // when the page is ready, all the other pages will suddenly be rendered
    useEffect(() => {
        const route = window.location.pathname + window.location.hash;
        if (isReady) {
            scrollToRoute(route);

            // TODO: handle this in a more deterministic way:
            // this is a hack to ensure that the page is scrolled to the correct position
            // while lazy-loaded components are being rendered
            setTimeout(() => {
                scrollToRoute(route);
            }, 150);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady]);

    const flattened = useMemo(() => {
        const toRet: {
            node: ApiPackageChildNode;
            breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        }[] = [];

        dfs<
            FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageChild,
            FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode
        >(
            node,
            (n, parents) => {
                if (n.type !== "link") {
                    toRet.push({
                        node: n,
                        breadcrumb: [...breadcrumb, ...FernNavigation.utils.createBreadcrumb(parents)],
                    });
                }
            },
            (n) => n.children,
        );

        return toRet;
    }, [breadcrumb, node]);

    function isLazy(node: ApiPackageChildNode) {
        if (node.type === "endpointPair") {
            return node.stream.slug !== initialSlug && node.nonStream.slug !== initialSlug;
        }
        return node.slug !== initialSlug;
    }

    function renderItem(node: ApiPackageChildNode, breadcrumb: readonly FernNavigation.BreadcrumbItem[]) {
        // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
        // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
        // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
        if (!isReady && isLazy(node)) {
            return null;
        }

        switch (node.type) {
            case "apiReference":
            case "apiPackage": {
                if (FernNavigation.hasMarkdown(node)) {
                    return <ApiSectionMarkdownPage node={node} mdxs={mdxs} />;
                }
                return null;
            }
            case "endpoint":
                return (
                    <Endpoint
                        node={node}
                        apiDefinition={apiDefinition}
                        breadcrumb={breadcrumb}
                        showErrors={showErrors}
                    />
                );
            case "webhook":
                return <Webhook node={node} apiDefinition={apiDefinition} breadcrumb={breadcrumb} />;
            case "webSocket":
                return <WebSocket node={node} apiDefinition={apiDefinition} breadcrumb={breadcrumb} />;
            case "page":
                return <ApiSectionMarkdownPage node={node} mdxs={mdxs} />;
            case "endpointPair":
                return (
                    <EndpointPair
                        node={node}
                        apiDefinition={apiDefinition}
                        breadcrumb={breadcrumb}
                        showErrors={showErrors}
                    />
                );
            default:
                throw new UnreachableCaseError(node);
        }
    }

    return (
        <>
            {flattened.map(({ node, breadcrumb }) => (
                <FernErrorBoundary component="ApiPackageContents" key={node.id}>
                    {renderItem(node, breadcrumb)}
                </FernErrorBoundary>
            ))}
        </>
    );
};

export const ApiPackageContents = memo(UnmemoizedApiPackageContents);
