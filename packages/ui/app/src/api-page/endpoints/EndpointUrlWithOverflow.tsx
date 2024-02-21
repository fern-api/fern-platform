import useSize from "@react-hook/size";
import classNames from "classnames";
import { useRef } from "react";
import { EndpointUrl } from "./EndpointUrl";

const URL_OVERFLOW_THRESHOLD = 0.95;

export const EndpointUrlWithOverflow: React.FC<Omit<EndpointUrl.Props, "urlStyle">> = ({ className, ...props }) => {
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
                {...props}
                ref={endpointUrlInnerContainerRef}
                className="max-w-full"
                urlStyle={isUrlAboutToOverflow ? "overflow" : "default"}
            />
        </div>
    );
};
