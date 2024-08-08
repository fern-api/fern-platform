import { useAtomValue } from "jotai";
import { memo } from "react";
import { useCallbackOne } from "use-memo-one";
import { FERN_STREAM_ATOM, SLUG_ATOM, useAtomEffect } from "../../atoms";
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
    const isStream = useAtomValue(FERN_STREAM_ATOM);
    const endpointSlug = endpoint.stream != null && isStream ? endpoint.stream.slug : endpoint.slug;

    // TODO: rewrite this with a reducer pattern
    useAtomEffect(
        useCallbackOne(
            (get, set) => {
                const selectedSlug = get(SLUG_ATOM);
                if (endpoint.stream != null) {
                    if (endpoint.slug === selectedSlug) {
                        set(FERN_STREAM_ATOM, false);
                    } else if (endpoint.stream.slug === selectedSlug) {
                        set(FERN_STREAM_ATOM, true);
                    }
                }
            },
            [endpoint.stream, endpoint.slug],
        ),
    );

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
