import { APIV1Read } from "@fern-api/fdr-sdk";
import useSize from "@react-hook/size";
import { useRef } from "react";
import { EndpointUrl } from "./EndpointUrl";

export declare namespace EndpointUrlWithOverflow {
    export interface Props {
        endpoint: APIV1Read.EndpointDefinition;
    }
}

const URL_OVERFLOW_THRESHOLD = 0.95;

export const EndpointUrlWithOverflow: React.FC<EndpointUrlWithOverflow.Props> = ({ endpoint }) => {
    const endpointUrlOuterContainerRef = useRef<null | HTMLDivElement>(null);
    const endpointUrlInnerContainerRef = useRef<null | HTMLDivElement>(null);
    const [endpointUrlOuterContainerWidth] = useSize(endpointUrlOuterContainerRef);
    const [endpointUrlInnerContainerWidth] = useSize(endpointUrlInnerContainerRef);
    const isUrlAboutToOverflow =
        endpointUrlInnerContainerWidth / endpointUrlOuterContainerWidth > URL_OVERFLOW_THRESHOLD;

    return (
        <div ref={endpointUrlOuterContainerRef} className="flex max-w-full flex-col items-start">
            <EndpointUrl
                ref={endpointUrlInnerContainerRef}
                className="max-w-full"
                urlStyle={isUrlAboutToOverflow ? "overflow" : "default"}
                endpoint={endpoint}
            />
        </div>
    );
};
