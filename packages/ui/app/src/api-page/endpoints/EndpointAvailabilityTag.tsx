import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import React, { memo } from "react";
import { getEndpointAvailabilityLabel } from "../../util/endpoint";

export declare namespace EndpointAvailabilityTag {
    export type Props = React.PropsWithChildren<{
        availability: APIV1Read.Availability | DocsV1Read.VersionAvailability;
        className?: string;
        minimal?: boolean;
    }>;
}

export const EndpointAvailabilityTag = memo<EndpointAvailabilityTag.Props>(function Core({
    availability,
    className,
    minimal = false,
}) {
    return (
        <span
            className={classNames(
                "rounded-full text-xs",
                {
                    "border px-1.5 py-0.5": !minimal,
                    "bg-tag-default t-muted": false,
                    "t-accent": availability === "GenerallyAvailable",
                    "t-warning": availability === "Beta",
                    "t-danger": availability === "Deprecated",
                    "bg-tag-primary border-border-accent-muted": availability === "GenerallyAvailable" && !minimal,
                    "bg-tag-warning border-warning": availability === "Beta" && !minimal,
                    "bg-tag-danger border-danger": availability === "Deprecated" && !minimal,
                },
                className,
            )}
        >
            {getEndpointAvailabilityLabel(availability)}
        </span>
    );
});
