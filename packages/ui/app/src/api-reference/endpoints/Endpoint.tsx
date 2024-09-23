import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { atom, useAtomValue } from "jotai";
import { memo } from "react";
import { useMemoOne } from "use-memo-one";
import { FernNavigation } from "../../../../../fdr-sdk/src/navigation/generated";
import { FERN_STREAM_ATOM } from "../../atoms";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        api: ApiDefinition.ApiDefinition;
        showErrors: boolean;
        endpoint: ApiDefinition.EndpointDefinition;
        isLastInApi: boolean;
    }
}

const UnmemoizedEndpoint: React.FC<Endpoint.Props> = ({ api, showErrors, endpoint, isLastInApi }) => {
    const isStreamingEndpoint = ApiDefinition.isStreamEndpoint(endpoint);
    const isVisible = useAtomValue(
        useMemoOne(() => atom((get) => get(FERN_STREAM_ATOM) && isStreamingEndpoint), [isStreamingEndpoint]),
    );

    // useEffect(() => {
    //     if (endpoint.stream != null) {
    //         if (endpoint.slug === content.slug) {
    //             setStream(false);
    //         } else if (endpoint.stream.slug === content.slug) {
    //             setStream(true);
    //         }
    //     }
    // }, [endpoint.slug, endpoint.stream, content.slug, setStream]);

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldLazyRender(FernNavigation.Slug(endpoint.slug)) || !isVisible) {
        return null;
    }

    return <EndpointContent api={api} showErrors={showErrors} endpoint={endpoint} hideBottomSeparator={isLastInApi} />;
};

export const Endpoint = memo(UnmemoizedEndpoint);
