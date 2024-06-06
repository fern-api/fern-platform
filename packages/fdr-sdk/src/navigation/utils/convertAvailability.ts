import { APIV1Read, DocsV1Read } from "../../client";
import { assertNever } from "../../utils";
import { FernNavigation } from "../generated";

export function convertAvailability(
    availability: DocsV1Read.VersionAvailability | APIV1Read.Availability | undefined,
): FernNavigation.Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability) {
        case "Beta":
            return FernNavigation.Availability.Beta;
        case "Stable":
            return FernNavigation.Availability.Stable;
        case "GenerallyAvailable":
            return FernNavigation.Availability.GenerallyAvailable;
        case "Deprecated":
            return FernNavigation.Availability.Deprecated;
        default:
            return assertNever(availability);
    }
}
