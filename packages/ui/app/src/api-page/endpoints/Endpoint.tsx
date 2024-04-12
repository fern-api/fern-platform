import { useFeatureFlags } from "../../contexts/FeatureFlagContext";
import { useNavigationContext, useShouldHideFromSsg } from "../../contexts/navigation-context/useNavigationContext";
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
    const { resolvedPath } = useNavigationContext();
    const { isApiScrollingDisabled } = useFeatureFlags();

    const { setTargetRef } = useApiPageCenterElement({ slug: endpoint.slug.join("/") });

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldHideFromSsg(endpoint.slug.join("/"))) {
        return null;
    }

    return (
        <EndpointContent
            api={api}
            showErrors={showErrors}
            endpoint={endpoint}
            breadcrumbs={breadcrumbs}
            setContainerRef={setTargetRef}
            hideBottomSeparator={isLastInApi || isApiScrollingDisabled}
            isInViewport={resolvedPath.fullSlug === endpoint.slug.join("/")}
            types={types}
        />
    );
};
