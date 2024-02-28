import classNames from "classnames";
import { EndpointUrl } from "./EndpointUrl";

export const EndpointUrlWithOverflow: React.FC<Omit<EndpointUrl.Props, "urlStyle">> = ({ className, ...props }) => {
    return (
        <div className={classNames("flex min-w-0 max-w-full shrink flex-col items-start", className)}>
            <EndpointUrl {...props} className="max-w-full" />
        </div>
    );
};
