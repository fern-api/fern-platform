import { APIV1Read } from "@fern-api/fdr-sdk";
import useSize from "@react-hook/size";
import classNames from "classnames";
import { useRef } from "react";
import { ResolvedEndpointPathParts } from "../../util/resolver";
import { EndpointUrl } from "./EndpointUrl";

export declare namespace EndpointUrlWithOverflow {
    export interface Props {
        className?: string;
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        environment?: string;
    }
}

const URL_OVERFLOW_THRESHOLD = 0.95;

export const EndpointUrlWithOverflow: React.FC<EndpointUrlWithOverflow.Props> = ({
    className,
    path,
    method,
    environment,
}) => {
    const endpointUrlOuterContainerRef = useRef<null | HTMLDivElement>(null);
    const endpointUrlInnerContainerRef = useRef<null | HTMLDivElement>(null);
    const [endpointUrlOuterContainerWidth] = useSize(endpointUrlOuterContainerRef);
    const [endpointUrlInnerContainerWidth] = useSize(endpointUrlInnerContainerRef);
    const isUrlAboutToOverflow =
        endpointUrlInnerContainerWidth / endpointUrlOuterContainerWidth > URL_OVERFLOW_THRESHOLD;

    return (
        <div
            ref={endpointUrlOuterContainerRef}
            className={classNames("flex min-w-0 max-w-full shrink flex-col items-start", className)}
        >
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
