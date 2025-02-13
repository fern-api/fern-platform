"use client";

import { forwardRef } from "react";

import { UIColor } from "../colors";
import { Badge, type BadgeProps } from "./badge";

export type Availability =
  | "Stable"
  | "GenerallyAvailable" // also known as "GA" or "Graduated"
  | "ReleaseCandidate" // also known as "RC"
  | "PublicBeta"
  | "Beta"
  | "PrivateBeta"
  | "LimitedAvailability" // also known as "Limited"
  | "CanaryRelease" // also known as "Canary"
  | "Preview" // also known as "Early Access"
  | "PreRelease"
  | "Alpha"
  | "Experimental"
  | "Internal"
  | "InDevelopment"
  | "Sunset"
  | "Deprecated"
  | "Retired";

export const Availability: Record<Availability, Availability> = {
  Stable: "Stable",
  GenerallyAvailable: "GenerallyAvailable",
  ReleaseCandidate: "ReleaseCandidate",
  PublicBeta: "PublicBeta",
  Beta: "Beta",
  PrivateBeta: "PrivateBeta",
  LimitedAvailability: "LimitedAvailability",
  CanaryRelease: "CanaryRelease",
  Preview: "Preview",
  PreRelease: "PreRelease",
  Alpha: "Alpha",
  Experimental: "Experimental",
  Internal: "Internal",
  InDevelopment: "InDevelopment",
  Sunset: "Sunset",
  Deprecated: "Deprecated",
  Retired: "Retired",
} as const;

export function isAvailability(value: string): value is Availability {
  return Availability[value as keyof typeof Availability] != null;
}

/**
 * The order of availability levels from most stable to most unstable.
 */
export const AvailabilityOrder = [
  // external
  Availability.Stable,
  Availability.GenerallyAvailable,
  Availability.ReleaseCandidate,
  Availability.PublicBeta,
  Availability.Beta,
  Availability.PrivateBeta,
  Availability.LimitedAvailability,
  Availability.CanaryRelease,
  Availability.Preview,
  Availability.PreRelease,
  // internal
  Availability.Alpha,
  Availability.Experimental,
  Availability.Internal,
  Availability.InDevelopment,
  // deprecated
  Availability.Sunset,
  Availability.Deprecated,
  Availability.Retired,
] as const;

export const AvailabilityDisplayNames: Record<Availability, string> = {
  Stable: "Stable",
  GenerallyAvailable: "GA",
  ReleaseCandidate: "RC",
  PublicBeta: "Public Beta",
  Beta: "Beta",
  PrivateBeta: "Private Beta",
  LimitedAvailability: "Limited",
  CanaryRelease: "Canary",
  Preview: "Preview",
  PreRelease: "Pre-release",
  Alpha: "Alpha",
  Experimental: "Experimental",
  Internal: "Internal",
  InDevelopment: "Dev",
  Sunset: "Sunset",
  Deprecated: "Deprecated",
  Retired: "Retired",
};

export const AvailabilityFullyQualifiedDisplayNames: Record<
  Availability,
  string
> = {
  Stable: "Stable",
  GenerallyAvailable: "Generally Available",
  ReleaseCandidate: "Release Candidate",
  PublicBeta: "Public Beta",
  Beta: "Beta",
  PrivateBeta: "Private Beta",
  LimitedAvailability: "Limited Availability",
  CanaryRelease: "Canary Release",
  Preview: "Preview",
  PreRelease: "Pre-release",
  Alpha: "Alpha",
  Experimental: "Experimental",
  Internal: "Internal",
  InDevelopment: "In Development",
  Sunset: "Sunset",
  Deprecated: "Deprecated",
  Retired: "Retired",
};

export const AvailabilityColorScheme: Record<Availability, UIColor> = {
  Stable: "green",
  GenerallyAvailable: "accent",
  ReleaseCandidate: "pink",
  PublicBeta: "indigo",
  Beta: "blue",
  PrivateBeta: "cyan",
  LimitedAvailability: "teal",
  CanaryRelease: "lime",
  Preview: "yellow",
  PreRelease: "amber", // this is the pre-release badge color used by Github, so it's a good fit for pre-release
  Alpha: "orange",
  Experimental: "violet",
  Internal: "gray",
  InDevelopment: "gray",
  Sunset: "tomato",
  Deprecated: "red",
  Retired: "gray",
};

interface AvailabilityBadgeProps extends Omit<BadgeProps, "color"> {
  availability: Availability;
  color?: BadgeProps["color"];
}

export const AvailabilityBadge = forwardRef<
  HTMLSpanElement & HTMLButtonElement,
  AvailabilityBadgeProps
>((props, ref) => {
  const { availability, ...rest } = props;
  return (
    <Badge
      ref={ref}
      color={AvailabilityColorScheme[availability]}
      {...rest}
      data-badge-type="availability"
      title={AvailabilityFullyQualifiedDisplayNames[availability]}
    >
      {props.children ?? AvailabilityDisplayNames[availability]}
    </Badge>
  );
});

AvailabilityBadge.displayName = "AvailabilityBadge";
