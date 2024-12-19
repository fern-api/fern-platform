import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { noop } from "ts-essentials";
import { EndpointDescriptor } from "./EndpointDescriptor";

export declare namespace SubpackageEndpointsOverview {
    export interface Props {
        slug: FernNavigation.Slug;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
    }
}

export const SubpackageEndpointsOverview: React.FC<
    SubpackageEndpointsOverview.Props
> = ({ subpackage }) => {
    return (
        <div className="border-default flex flex-col overflow-hidden rounded-xl border">
            <div className="border-default flex h-10 items-center justify-between border-b bg-white/10 px-3 py-1">
                <div className="text-xs uppercase tracking-wide text-neutral-300">
                    Endpoints
                </div>
            </div>
            <div className="space-y-1.5 p-3">
                {subpackage.endpoints.map((e) => (
                    <EndpointDescriptor
                        key={e.id}
                        endpointDefinition={e}
                        onClick={noop}
                    />
                ))}
            </div>
        </div>
    );
};
