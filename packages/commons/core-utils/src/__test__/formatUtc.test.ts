import { formatUtc } from "../formatUtc";

describe("formatUtc", () => {
    it("formats a date in UTC", () => {
        const formatted = formatUtc(1680480000000, "yyyy-MM-dd");
        expect(formatted).toBe("2023-04-03");
    });
});
