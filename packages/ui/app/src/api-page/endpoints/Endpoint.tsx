import { useAtomValue } from "jotai";
import { useFeatureFlags } from "../../atoms/flags";
import { useResolvedPath } from "../../atoms/navigation";
import { FERN_STREAM_ATOM } from "../../atoms/stream";
import { useShouldHideFromSsg } from "../../contexts/navigation-context/useNavigationContext";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../../resolver/types";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
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

export const Endpoint: React.FC<Endpoint.Props> = ({ api, showErrors, endpoint, breadcrumbs, isLastInApi, types }) => {
    const isStream = useAtomValue(FERN_STREAM_ATOM);
    const resolvedPath = useResolvedPath();
    const { isApiScrollingDisabled } = useFeatureFlags();

    const endpointSlug = endpoint.stream != null && isStream ? endpoint.stream.slug : endpoint.slug;

    const { setTargetRef } = useApiPageCenterElement({ slug: endpointSlug });

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldHideFromSsg(endpointSlug)) {
        return null;
    }

    return (
        <EndpointContent
            api={api}
            showErrors={showErrors}
            endpoint={endpoint}
            breadcrumbs={breadcrumbs}
            containerRef={setTargetRef}
            hideBottomSeparator={isLastInApi || isApiScrollingDisabled}
            isInViewport={resolvedPath.fullSlug === endpoint.slug}
            types={types}
        />
    );
};
