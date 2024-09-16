import { useAtom } from "jotai";
import { memo, useEffect } from "react";
import { FERN_STREAM_ATOM, useDocsContent } from "../../atoms";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../../resolver/types";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        api: string;
        showErrors: boolean;
        endpoint: ResolvedEndpointDefinition;
        isLastInApi: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

const UnmemoizedEndpoint: React.FC<Endpoint.Props> = ({ api, showErrors, endpoint, isLastInApi, types }) => {
    const [isStream, setStream] = useAtom(FERN_STREAM_ATOM);
    const content = useDocsContent();

    const endpointSlug = endpoint.stream != null && isStream ? endpoint.stream.slug : endpoint.slug;

    useEffect(() => {
        if (endpoint.stream != null) {
            if (endpoint.slug === content.slug) {
                setStream(false);
            } else if (endpoint.stream.slug === content.slug) {
                setStream(true);
            }
        }
    }, [endpoint.slug, endpoint.stream, content.slug, setStream]);

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
            hideBottomSeparator={isLastInApi}
            types={types}
        />
    );
};

export const Endpoint = memo(UnmemoizedEndpoint);
