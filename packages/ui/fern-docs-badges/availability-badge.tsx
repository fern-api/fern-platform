import { forwardRef } from "react";

import { Badge, type BadgeProps, type ConfigurableColorScheme } from "./badge";

export type Availability = "Stable" | "GenerallyAvailable" | "Beta" | "PreRelease" | "InDevelopment" | "Deprecated";

export const Availability: Record<Availability, Availability> = {
    Stable: "Stable",
    GenerallyAvailable: "GenerallyAvailable",
    Beta: "Beta",
    PreRelease: "PreRelease",
    InDevelopment: "InDevelopment",
    Deprecated: "Deprecated",
} as const;

export const AvailabilityOrder = [
    Availability.Stable,
    Availability.GenerallyAvailable,
    Availability.Beta,
    Availability.PreRelease,
    Availability.InDevelopment,
    Availability.Deprecated,
] as const;

export const AvailabilityDisplayNames: Record<Availability, string> = {
    Stable: "Stable",
    GenerallyAvailable: "GA",
    Beta: "Beta",
    PreRelease: "RC",
    InDevelopment: "Developing",
    Deprecated: "Deprecated",
};

export const AvailabilityColorScheme: Record<Availability, ConfigurableColorScheme> = {
    Stable: "green",
    GenerallyAvailable: "accent",
    Beta: "blue",
    PreRelease: "amber", // this is the pre-release badge color used by Github, so it's a good fit for pre-release
    InDevelopment: "gray",
    Deprecated: "red",
};

interface AvailabilityBadgeProps extends Omit<BadgeProps, "color"> {
    availability: Availability;
}

export const AvailabilityBadge = forwardRef<HTMLSpanElement, AvailabilityBadgeProps>((props, ref) => {
    const { availability, ...rest } = props;
    return (
        <Badge ref={ref} {...rest} color={AvailabilityColorScheme[availability]} data-badge-type="availability">
            {props.children ?? AvailabilityDisplayNames[availability]}
        </Badge>
    );
});

AvailabilityBadge.displayName = "AvailabilityBadge";
