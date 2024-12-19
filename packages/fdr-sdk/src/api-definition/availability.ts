import * as Latest from "./latest";

/**
 * The order of availability levels, from most stable to least stable.
 *
 * This is used to sort the availability levels in the UI, and to determine the stability level of a type reference when multiple are available.
 */
export const AvailabilityOrder = [
    Latest.Availability.Stable,
    Latest.Availability.GenerallyAvailable,
    Latest.Availability.Beta,
    Latest.Availability.PreRelease,
    Latest.Availability.InDevelopment,
    Latest.Availability.Deprecated,
] as const;

/**
 * @param availabilities an array of availability levels
 * @returns the **least** stable availability level from the input array
 */
export function coalesceAvailability(
    availabilities: (Latest.Availability | undefined)[]
): Latest.Availability | undefined {
    for (const availability of [...AvailabilityOrder].reverse()) {
        if (availabilities.includes(availability)) {
            return availability;
        }
    }
    return undefined;
}

// the following code is used to check that the contents of the AvailabilityOrder array contains all the values of the Availability enum
type AvailabilityValues =
    (typeof Latest.Availability)[keyof typeof Latest.Availability];
type CheckAvailabilityOrder<T extends readonly AvailabilityValues[]> =
    T[number] extends AvailabilityValues
        ? AvailabilityValues extends T[number]
            ? true
            : false
        : false;
type Assert<T extends true> = T;
export type CheckAssert = Assert<
    CheckAvailabilityOrder<typeof AvailabilityOrder>
>;
