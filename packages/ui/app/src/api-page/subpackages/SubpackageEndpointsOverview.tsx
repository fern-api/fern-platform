import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { joinUrlSlugs } from "@fern-ui/app-utils";
import { useCallback } from "react";
import { useNavigationContext } from "../../navigation-context";
import { EndpointDescriptor } from "./EndpointDescriptor";

export declare namespace SubpackageEndpointsOverview {
    export interface Props {
        slug: string;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }
}

export const SubpackageEndpointsOverview: React.FC<SubpackageEndpointsOverview.Props> = ({ slug, subpackage }) => {
    const { navigateToPath } = useNavigationContext();

    const handleEndpointClick = useCallback(
        (endpointDef: FernRegistryApiRead.EndpointDefinition) => {
            const endpointSlug = joinUrlSlugs(slug, endpointDef.urlSlug);
            navigateToPath(endpointSlug);
        },
        [navigateToPath, slug]
    );

    return (
        <div className="border-border-default-light dark:border-border-default-dark flex flex-col overflow-hidden rounded-xl border">
            <div className="border-border-default-light dark:border-border-default-dark flex h-10 items-center justify-between border-b bg-white/10 px-3 py-1">
                <div className="text-xs uppercase tracking-wide text-neutral-300">Endpoints</div>
            </div>
            <div className="space-y-1.5 p-3">
                {subpackage.endpoints.map((e) => (
                    <EndpointDescriptor key={e.id} endpointDefinition={e} onClick={() => handleEndpointClick(e)} />
                ))}
            </div>
        </div>
    );
};
