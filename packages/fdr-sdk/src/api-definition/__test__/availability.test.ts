import { coalesceAvailability } from "../availability";
import { Availability } from "../latest";

describe("coalesceAvailability", () => {
    it("should return the least stable availability level", () => {
        expect(
            coalesceAvailability([Availability.Stable, Availability.Beta])
        ).toBe(Availability.Beta);
        expect(
            coalesceAvailability([Availability.Beta, Availability.Stable])
        ).toBe(Availability.Beta);
        expect(
            coalesceAvailability([
                Availability.Stable,
                Availability.Beta,
                Availability.Deprecated,
            ])
        ).toBe(Availability.Deprecated);
        expect(
            coalesceAvailability([
                Availability.Beta,
                Availability.InDevelopment,
            ])
        ).toBe(Availability.InDevelopment);
        expect(
            coalesceAvailability([
                Availability.PreRelease,
                Availability.InDevelopment,
            ])
        ).toBe(Availability.InDevelopment);
        expect(coalesceAvailability([Availability.GenerallyAvailable])).toBe(
            Availability.GenerallyAvailable
        );
        expect(
            coalesceAvailability([
                Availability.Stable,
                Availability.Beta,
                Availability.Stable,
            ])
        ).toBe(Availability.Beta);
        expect(coalesceAvailability([])).toBeUndefined();
    });
});
