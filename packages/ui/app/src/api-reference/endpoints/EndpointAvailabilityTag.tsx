import type { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { ColorScheme, FernTag } from "@fern-ui/components";
import React, { memo } from "react";
import { getEndpointAvailabilityLabel } from "../../util/endpoint";

export declare namespace EndpointAvailabilityTag {
    export type Props = React.PropsWithChildren<{
        availability: APIV1Read.Availability | DocsV1Read.VersionAvailability;
        className?: string;
        minimal?: boolean;
    }>;
}

const AVAILABILITY_COLOR_SCHEME: Record<APIV1Read.Availability | DocsV1Read.VersionAvailability, ColorScheme> = {
    GenerallyAvailable: "accent",
    Beta: "amber",
    Deprecated: "red",
    Stable: "green",
};

export const EndpointAvailabilityTag = memo<EndpointAvailabilityTag.Props>(function Core({
    availability,
    className,
    minimal = false,
}) {
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
