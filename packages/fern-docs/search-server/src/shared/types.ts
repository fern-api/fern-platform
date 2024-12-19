import { z } from "zod";

export const AvailabilitySchema = z.enum([
  "Stable",
  "GenerallyAvailable", // also known as "GA" or "Graduated"
  "ReleaseCandidate", // also known as "RC"
  "PublicBeta",
  "Beta",
  "PrivateBeta",
  "LimitedAvailability", // also known as "Limited"
  "CanaryRelease", // also known as "Canary"
  "Preview", // also known as "Early Access"
  "PreRelease",
  "Alpha",
  "Experimental",
  "Internal",
  "InDevelopment",
  "Sunset",
  "Deprecated",
  "Retired",
]);

export type Availability = z.infer<typeof AvailabilitySchema>;
