import type { FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { ColorScheme, FernTag } from "@fern-ui/components";
import { getEndpointAvailabilityLabel } from "@fern-ui/fdr-utils";
import React, { memo } from "react";

export declare namespace EndpointAvailabilityTag {
    export type Props = React.PropsWithChildren<{
        availability: FdrAPI.Availability;
        className?: string;
        minimal?: boolean;
    }>;
}

const AVAILABILITY_COLOR_SCHEME: Record<FdrAPI.Availability, ColorScheme> = {
    GenerallyAvailable: "accent",
    InDevelopment: "gray",
    Beta: "blue",
    Stable: "green",
    PreRelease: "amber", // this is the pre-release badge color used by Github, so it's a good fit for pre-release
    Deprecated: "red",
};

export const EndpointAvailabilityTag = memo<EndpointAvailabilityTag.Props>(function Core({
    availability,
    className,
    minimal = false,
}) {
    // return (
    //     <span
    //         className={cn(
    //             "rounded-full text-xs",
    //             {
    //                 "border px-1.5 py-0.5": !minimal,
    //                 "bg-tag-default t-muted": false,
    //                 "t-accent": availability === "GenerallyAvailable",
    //                 "t-warning": availability === "Beta",
    //                 "t-danger": availability === "Deprecated",
    //                 "bg-tag-primary border-border-accent-muted": availability === "GenerallyAvailable" && !minimal,
    //                 "bg-tag-warning border-warning": availability === "Beta" && !minimal,
    //                 "bg-tag-danger border-danger": availability === "Deprecated" && !minimal,
    //             },
    //             className,
    //         )}
    //     >
    //         {getEndpointAvailabilityLabel(availability)}
    //     </span>
    // );

    return (
        <FernTag
            variant={minimal ? "subtle" : "solid"}
            colorScheme={AVAILABILITY_COLOR_SCHEME[availability]}
            className={className}
            rounded
        >
            {getEndpointAvailabilityLabel(availability)}
        </FernTag>
    );
});
