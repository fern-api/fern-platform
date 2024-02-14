import { joinUrlSlugs } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { useShouldHideFromSsg } from "../../navigation-context/useNavigationContext";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        endpoint: ResolvedEndpointDefinition;
        subpackageTitle: string | undefined;
        isLastInApi: boolean;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({
    apiSection,
    apiDefinition,
    endpoint,
    subpackageTitle,
    isLastInApi,
}) => {
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
            subpackageTitle={subpackageTitle}
            setContainerRef={setTargetRef}
            hideBottomSeparator={isLastInApi}
            route={route}
        />
    );
};
