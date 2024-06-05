import { useAtomValue } from "jotai";
import { useFeatureFlags } from "../../contexts/FeatureFlagContext.js";
import { useNavigationContext, useShouldHideFromSsg } from "../../contexts/navigation-context/useNavigationContext.js";
import { ResolvedEndpointDefinition, ResolvedTypeDefinition } from "../../resolver/types.js";
import { FERN_STREAM_ATOM } from "../../sidebar/atom.js";
import { useApiPageCenterElement } from "../useApiPageCenterElement.js";
import { EndpointContent } from "./EndpointContent.js";

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
    const { resolvedPath } = useNavigationContext();
    const { isApiScrollingDisabled } = useFeatureFlags();

    const endpointSlug = endpoint.stream != null && isStream ? endpoint.stream.slug : endpoint.slug;

    const { setTargetRef } = useApiPageCenterElement({ slug: endpointSlug.join("/") });

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldHideFromSsg(endpointSlug.join("/"))) {
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
            isInViewport={resolvedPath.fullSlug === endpoint.slug.join("/")}
            types={types}
        />
    );
};
