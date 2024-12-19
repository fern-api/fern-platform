import { UnreachableCaseError } from "ts-essentials";
import { FernNavigation } from "../../..";
import { FdrAPI } from "../../../client/types";

export function convertAvailability(
    availability: FdrAPI.Availability | undefined
): FernNavigation.V1.NavigationV1Availability | undefined {
    if (availability == null) {
        return undefined;
    }
    switch (availability) {
        case FdrAPI.Availability.Beta:
            return FernNavigation.V1.NavigationV1Availability.Beta;
        case FdrAPI.Availability.Stable:
            return FernNavigation.V1.NavigationV1Availability.Stable;
        case FdrAPI.Availability.GenerallyAvailable:
            return FernNavigation.V1.NavigationV1Availability
                .GenerallyAvailable;
        case FdrAPI.Availability.Deprecated:
            return FernNavigation.V1.NavigationV1Availability.Deprecated;
        case FdrAPI.Availability.InDevelopment:
            return FernNavigation.V1.NavigationV1Availability.InDevelopment;
        case FdrAPI.Availability.PreRelease:
            return FernNavigation.V1.NavigationV1Availability.PreRelease;
        default:
            throw new UnreachableCaseError(availability);
    }
}
