import { createEndpointContext, type ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { memo, useMemo } from "react";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        showErrors: boolean;
        node: FernNavigation.EndpointNode;
        apiDefinition: ApiDefinition;
        isLastInApi: boolean;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        streamToggle?: React.ReactElement;
    }
}

const UnmemoizedEndpoint: React.FC<Endpoint.Props> = ({
    showErrors,
    node,
    isLastInApi,
    apiDefinition,
    breadcrumb,
    streamToggle,
}) => {
    const context = useMemo(() => createEndpointContext(node, apiDefinition), [node, apiDefinition]);

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldLazyRender(node.slug)) {
        return null;
    }

    if (!context) {
        // eslint-disable-next-line no-console
        console.error("Could not create context for endpoint", node);
        return null;
    }

    return (
        <EndpointContent
            breadcrumb={breadcrumb}
            showErrors={showErrors}
            hideBottomSeparator={isLastInApi}
            context={context}
            streamToggle={streamToggle}
        />
    );
};

export const Endpoint = memo(UnmemoizedEndpoint);
