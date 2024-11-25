import { FdrAPI } from "@fern-api/fdr-sdk";
import { UnreachableCaseError } from "ts-essentials";

type Availability = "beta" | "in-development" | "deprecated";

export function availabilityFunction<T>(input: T): FdrAPI.Availability | undefined {
    const inputWithAvailability = input as T & {
        "x-fern-availability"?: Availability;
    };
    switch (inputWithAvailability["x-fern-availability"]) {
        case "beta":
            return FdrAPI.Availability.Beta;
        case "in-development":
            return FdrAPI.Availability.InDevelopment;
        case "deprecated":
            return FdrAPI.Availability.Deprecated;
        case undefined:
            return undefined;
        default:
            new UnreachableCaseError(inputWithAvailability["x-fern-availability"]);
            return undefined;
    }
}
