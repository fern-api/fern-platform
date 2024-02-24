import { joinUrlSlugs } from "@fern-api/fdr-sdk";
import { useNavigationContext, useShouldHideFromSsg } from "../../navigation-context/useNavigationContext";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "../../util/resolver";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        endpoint: ResolvedEndpointDefinition;
        breadcrumbs: string[];
        isLastInApi: boolean;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({
    apiSection,
    apiDefinition,
    endpoint,
    breadcrumbs,
    isLastInApi,
}) => {
    const { resolvedPath } = useNavigationContext();
    const fullSlug = joinUrlSlugs(...endpoint.slug);
    const route = `/${fullSlug}`;

    const { setTargetRef } = useApiPageCenterElement({ slug: fullSlug });

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldHideFromSsg(fullSlug)) {
        return null;
    }

    return (
        <EndpointContent
            apiSection={apiSection}
            apiDefinition={apiDefinition}
            endpoint={endpoint}
            breadcrumbs={breadcrumbs}
            setContainerRef={setTargetRef}
            hideBottomSeparator={isLastInApi}
            route={route}
            isInViewport={resolvedPath.fullSlug === fullSlug}
        />
    );
};
