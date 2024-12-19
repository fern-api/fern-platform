import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { dfs } from "@fern-api/fdr-sdk/traversers";
import { ReactElement, memo, useEffect, useMemo } from "react";
import { useIsReady } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { useIsLocalPreview } from "../contexts/local-preview";
import { DocsContent } from "../resolver/DocsContent";
import { scrollToRoute } from "../util/anchor";
import { ApiPackageContent, ApiPackageContentNode } from "./ApiPackageContent";

export interface ApiReferenceContentProps {
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    apiDefinition: ApiDefinition;
    node: FernNavigation.ApiReferenceNode;
    mdxs: Record<
        FernNavigation.NodeId,
        Omit<DocsContent.MarkdownPage, "type" | "apis">
    >;
    showErrors: boolean;
    slug: FernNavigation.Slug;
}

const UnmemoizedApiReferenceContent: React.FC<ApiReferenceContentProps> = ({
    mdxs,
    breadcrumb,
    showErrors,
    apiDefinition,
    node,
    slug,
}) => {
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
            node: ApiPackageContentNode;
            breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        }[] = [];

        dfs<FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageChild>(
            node,
            (n, parents) => {
                if (n.type === "link") {
                    return;
                }

                toRet.push({
                    node: n,
                    breadcrumb: [
                        ...breadcrumb,
                        ...FernNavigation.utils.createBreadcrumb(parents),
                    ],
                });
            },
            (n) => {
                if (n.type === "apiPackage" || n.type === "apiReference") {
                    return n.children;
                } else {
                    return [];
                }
            }
        );

        return toRet;
    }, [breadcrumb, node]);

    function isLazy(node: ApiPackageContentNode) {
        if (node.type === "endpointPair") {
            return node.stream.slug !== slug && node.nonStream.slug !== slug;
        }
        return node.slug !== slug;
    }

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    const filtered = isReady
        ? flattened
        : flattened.filter(({ node }) => !isLazy(node));

    return (
        <>
            {filtered.map(({ node, breadcrumb }, idx) => (
                <FernErrorBoundary component="ApiPackageContents" key={node.id}>
                    <ApiPackageContent
                        node={node}
                        mdxs={mdxs}
                        apiDefinition={apiDefinition}
                        breadcrumb={breadcrumb}
                        showErrors={showErrors}
                        last={idx === filtered.length - 1}
                    />
                </FernErrorBoundary>
            ))}
        </>
    );
};

const MemoizedApiReferenceContent = memo(
    UnmemoizedApiReferenceContent,
    (prev, next) => prev.node.id === next.node.id
);

export function ApiReferenceContent(
    props: ApiReferenceContentProps
): ReactElement {
    const isLocalPreview = useIsLocalPreview();
    // do not memoize when in local preview mode to ensure that the page is re-rendered on every change
    const Component = isLocalPreview
        ? UnmemoizedApiReferenceContent
        : MemoizedApiReferenceContent;
    return <Component {...props} />;
}
