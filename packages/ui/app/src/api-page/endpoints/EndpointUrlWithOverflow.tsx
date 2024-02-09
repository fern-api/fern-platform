import { APIV1Read } from "@fern-api/fdr-sdk";
import { ResolvedEndpointPathParts } from "@fern-ui/app-utils";
import useSize from "@react-hook/size";
import { useRef } from "react";
import { EndpointUrl } from "./EndpointUrl";

export declare namespace EndpointUrlWithOverflow {
    export interface Props {
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        environment?: string;
    }
}

const URL_OVERFLOW_THRESHOLD = 0.95;

export const EndpointUrlWithOverflow: React.FC<EndpointUrlWithOverflow.Props> = ({ path, method, environment }) => {
    const endpointUrlOuterContainerRef = useRef<null | HTMLDivElement>(null);
    const endpointUrlInnerContainerRef = useRef<null | HTMLDivElement>(null);
    const [endpointUrlOuterContainerWidth] = useSize(endpointUrlOuterContainerRef);
    const [endpointUrlInnerContainerWidth] = useSize(endpointUrlInnerContainerRef);
    const isUrlAboutToOverflow =
        endpointUrlInnerContainerWidth / endpointUrlOuterContainerWidth > URL_OVERFLOW_THRESHOLD;

    return (
        <div ref={endpointUrlOuterContainerRef} className="flex min-w-0 max-w-full flex-1 shrink flex-col items-start">
            <EndpointUrl
                ref={endpointUrlInnerContainerRef}
                className="max-w-full"
                urlStyle={isUrlAboutToOverflow ? "overflow" : "default"}
                path={path}
                method={method}
                environment={environment}
            />
        </div>
    );
};
