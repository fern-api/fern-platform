import type * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import { getEndpointAvailabilityLabel } from "@fern-ui/app-utils";
import classNames from "classnames";
import React, { memo } from "react";

export declare namespace EndpointAvailabilityTag {
    export type Props = React.PropsWithChildren<{
        availability: FernRegistryApiRead.Availability;
        className?: string;
    }>;
}

export const EndpointAvailabilityTag = memo<EndpointAvailabilityTag.Props>(function Core({ availability, className }) {
    return (
        <span
            className={classNames(
                "rounded border px-1.5 py-0.5 text-xs font-normal",
                {
                    "bg-tag-default-light dark:bg-tag-default-dark t-muted": false,
                    "bg-tag-primary border-border-primary text-accent-primary": availability === "GenerallyAvailable",
                    "bg-tag-warning border-warning t-warning": availability === "Beta",
                    "bg-tag-danger border-danger t-danger": availability === "Deprecated",
                },
                className
            )}
        >
            {getEndpointAvailabilityLabel(availability)}
        </span>
    );
});
