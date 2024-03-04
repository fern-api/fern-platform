import classNames from "classnames";
import { HorizontalOverflowMask } from "../../commons/HorizontalOverflowMask";
import { EndpointUrl } from "./EndpointUrl";

export const EndpointUrlWithOverflow: React.FC<Omit<EndpointUrl.Props, "urlStyle">> = ({ className, ...props }) => {
    return (
        <HorizontalOverflowMask
            className={classNames("flex min-w-0 max-w-full shrink flex-col items-start", className)}
        >
            <EndpointUrl {...props} className="max-w-full" />
        </HorizontalOverflowMask>
    );
};
