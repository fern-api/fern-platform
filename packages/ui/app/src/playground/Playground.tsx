import {
    ApiDefinition,
    EndpointDefinition,
    SubpackageId,
} from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointTitleAsString } from "@fern-ui/app-utils";
import { noop } from "instantsearch.js/es/lib/utils";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { EndpointAvailabilityTag } from "../api-page/endpoints/EndpointAvailabilityTag";
import { EndpointPlayground } from "../api-page/endpoints/EndpointPlayground";
import { EndpointUrlWithOverflow } from "../api-page/endpoints/EndpointUrlWithOverflow";
import { TitledExample } from "../api-page/examples/TitledExample";
import { HEADER_HEIGHT } from "../constants";
import { useDocsContext } from "../docs-context/useDocsContext";
import { BgImageGradient } from "../docs/BgImageGradient";
import { Header } from "../docs/Header";
import { SearchService } from "../services/useSearchService";

export declare namespace Playground {
    export interface Props {
        fullSlug: string;
    }
}

const SEARCH_SERVICE: SearchService = { isAvailable: false };

function recursiveGetEndpoint(
    slug: string[],
    subpackageIds: SubpackageId[],
    subpackages: ApiDefinition["subpackages"]
): EndpointDefinition | undefined {
    if (slug.length < 2 || subpackageIds.length === 0) {
        return;
    }

    for (const subpackageId of subpackageIds) {
        const subpackage = subpackages[subpackageId];
        if (subpackage == null) {
            continue;
        }

        if (subpackage.urlSlug === slug[0]) {
            if (slug.length > 2) {
                return recursiveGetEndpoint(slug.slice(1), subpackage.subpackages, subpackages);
            }

            if (subpackage.endpoints.length === 0) {
                return;
            }

            return subpackage.endpoints.find((endpoint) => endpoint.urlSlug === slug[1]);
        }
    }
    return;
}

export const Playground: React.FC<Playground.Props> = ({ fullSlug }) => {
    const { docsDefinition, theme } = useDocsContext();
    const { apiSlug, apiDefinition, resolveTypeById } = useApiDefinitionContext();

    const { colorsV3 } = docsDefinition.config;
    const hasSpecifiedBackgroundImage = !!docsDefinition.config.backgroundImage;

    const backgroundType = useMemo(() => {
        if (theme == null) {
            return null;
        }
        if (colorsV3.type === "darkAndLight") {
            return colorsV3[theme].background.type;
        } else {
            return colorsV3.background.type;
        }
    }, [colorsV3, theme]);

    const endpoint = useMemo(() => {
        const slugArray = fullSlug.split("/");
        const idx = slugArray.indexOf(apiSlug);
        if (idx === -1) {
            return;
        }

        return recursiveGetEndpoint(
            slugArray.slice(idx + 1),
            apiDefinition.rootPackage.subpackages,
            apiDefinition.subpackages
        );
    }, [apiDefinition.rootPackage.subpackages, apiDefinition.subpackages, apiSlug, fullSlug]);

    if (endpoint == null) {
        return null;
    }

    return (
        <>
            <BgImageGradient
                backgroundType={backgroundType}
                hasSpecifiedBackgroundImage={hasSpecifiedBackgroundImage}
            />
            <div className="relative flex h-full flex-col">
                <div style={{ height: HEADER_HEIGHT }}>
                    <Header
                        docsDefinition={docsDefinition}
                        openSearchDialog={noop}
                        isMobileSidebarOpen={false}
                        openMobileSidebar={noop}
                        closeMobileSidebar={noop}
                        searchService={SEARCH_SERVICE}
                    />
                </div>
                <div className="relative flex w-full flex-1 flex-col px-6 pb-6">
                    <div className="pb-6 pt-2">
                        <div>
                            <span className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                                {getEndpointTitleAsString(endpoint)}
                            </span>
                            {endpoint.availability != null && (
                                <span className="relative">
                                    <EndpointAvailabilityTag
                                        className="absolute -top-1.5 left-2.5 inline-block"
                                        availability={endpoint.availability}
                                    />
                                </span>
                            )}
                        </div>
                        <EndpointUrlWithOverflow endpoint={endpoint} />
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-6">
                        <TitledExample title="Request" tag={endpoint.method} type={"primary"} disablePadding>
                            <EndpointPlayground
                                auth={apiDefinition.auth}
                                endpoint={endpoint}
                                resolveTypeById={resolveTypeById}
                            />
                        </TitledExample>
                        <TitledExample title="Response" type={"primary"}>
                            <>Testing</>
                        </TitledExample>
                    </div>
                </div>
            </div>
        </>
    );
};
