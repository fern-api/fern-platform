import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointAvailabilityLabel } from "@fern-ui/app-utils";
import classNames from "classnames";
import React, { memo } from "react";

export declare namespace EndpointAvailabilityTag {
    export type Props = React.PropsWithChildren<{
        availability: FernRegistryApiRead.Availability;
        className?: string;
    }>;
}

export const EndpointAvailabilityTag = memo<EndpointAvailabilityTag.Props>(function Core({ availability }) {
    return (
        <div
            className={classNames(
                "flex shrink-0 items-center justify-center rounded border px-1.5 py-0.5 text-xs font-normal",
                {
                    "bg-tag-default-light dark:bg-tag-default-dark t-muted": false,
                    "bg-tag-success border-success t-success": availability === "GenerallyAvailable",
                    "bg-tag-warning border-warning t-warning": availability === "Beta",
                    "bg-tag-danger border-danger t-danger": availability === "Deprecated",
                }
            )}
        >
            {getEndpointAvailabilityLabel(availability)}
        </div>
    );
});
