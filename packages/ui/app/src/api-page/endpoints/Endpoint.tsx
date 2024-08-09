import { useAtom } from "jotai";
import { memo, useEffect } from "react";
import { FERN_STREAM_ATOM, useResolvedPath } from "../../atoms";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../../resolver/types";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        api: string;
        showErrors: boolean;
        endpoint: ResolvedEndpointDefinition;
        breadcrumbs: readonly string[];
        isLastInApi: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

const UnmemoizedEndpoint: React.FC<Endpoint.Props> = ({
    api,
    showErrors,
    endpoint,
    breadcrumbs,
    isLastInApi,
    types,
}) => {
    const [isStream, setStream] = useAtom(FERN_STREAM_ATOM);
    const resolvedPath = useResolvedPath();

    const endpointSlug = endpoint.stream != null && isStream ? endpoint.stream.slug : endpoint.slug;

    useEffect(() => {
        if (endpoint.stream != null) {
            if (endpoint.slug === resolvedPath.slug) {
                setStream(false);
            } else if (endpoint.stream.slug === resolvedPath.slug) {
                setStream(true);
            }
        }
    }, [endpoint.slug, endpoint.stream, resolvedPath.slug, setStream]);

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldLazyRender(endpointSlug)) {
        return null;
    }

    return (
        <EndpointContent
            api={api}
            showErrors={showErrors}
            endpoint={endpoint}
            breadcrumbs={breadcrumbs}
            hideBottomSeparator={isLastInApi}
            types={types}
        />
    );
};

export const Endpoint = memo(UnmemoizedEndpoint);
