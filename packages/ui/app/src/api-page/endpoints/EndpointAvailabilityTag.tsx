import { APIV1Read } from "@fern-api/fdr-sdk";
import { getEndpointAvailabilityLabel } from "@fern-ui/app-utils";
import classNames from "classnames";
import React, { memo } from "react";

export declare namespace EndpointAvailabilityTag {
    export type Props = React.PropsWithChildren<{
        availability: APIV1Read.Availability;
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
                "rounded text-xs font-normal",
                {
                    "border px-1.5 py-0.5": !minimal,
                    "bg-tag-default-light dark:bg-tag-default-dark t-muted": false,
                    "text-accent-primary": availability === "GenerallyAvailable",
                    "t-warning": availability === "Beta",
                    "t-danger": availability === "Deprecated",
                    "bg-tag-primary border-border-primary": availability === "GenerallyAvailable" && !minimal,
                    "bg-tag-warning border-warning": availability === "Beta" && !minimal,
                    "bg-tag-danger border-danger": availability === "Deprecated" && !minimal,
                },
                className
            )}
        >
            {getEndpointAvailabilityLabel(availability)}
        </span>
    );
});
