import moment from "moment";
import { Changelog } from "../dateUtils.js";

describe("Changelog.toShortDateString", () => {
    it("should return the correct date", () => {
        const timestamp = "2020-01-01T00:00:00Z";
        expect(Changelog.toShortDateString(timestamp)).toEqual("Jan 01 2020");
    });

    it("should return the correct date for a different date", () => {
        const timestamp = "2020-02-02T00:00:00Z";
        expect(Changelog.toShortDateString(timestamp)).toEqual("Feb 02 2020");
    });

    it("should return the correct date even for the end of the day", () => {
        const timestamp = "2020-02-02T23:59:59Z";
        expect(Changelog.toShortDateString(timestamp)).toEqual("Feb 02 2020");
    });

    it("should return the correct date for a different timezone", () => {
        const timestamp = "2020-02-02T00:00:00+01:00";
        expect(Changelog.toShortDateString(timestamp)).toEqual("Feb 02 2020");

        const timestamp2 = "2020-02-02T00:00:00-01:00";
        expect(Changelog.toShortDateString(timestamp2)).toEqual("Feb 02 2020");

        const timestamp3 = "2020-02-02T00:00:00+02:00";
        expect(Changelog.toShortDateString(timestamp3)).toEqual("Feb 02 2020");
    });
});

describe("Changelog.toLongDateString", () => {
    it("should return the correct date", () => {
        const timestamp = "2020-01-01T00:00:00Z";
        expect(Changelog.toLongDateString(timestamp)).toEqual("January 1, 2020");
    });

    it("should return the correct date for a different date", () => {
        const timestamp = "2020-02-02T00:00:00Z";
        expect(Changelog.toLongDateString(timestamp)).toEqual("February 2, 2020");
    });

    it("should return the correct date even for the end of the day", () => {
        const timestamp = "2020-02-02T23:59:59Z";
        expect(Changelog.toLongDateString(timestamp)).toEqual("February 2, 2020");
    });
});

describe("Changelog.toCalendarDate", () => {
    it("should return 'today' for the same day", () => {
        const timestamp = moment().toISOString();
        expect(Changelog.toCalendarDate(timestamp)).toEqual("today");
    });

    it("should return 'tomorrow' for the next day", () => {
        const timestamp = moment().add(1, "day").toISOString();
        expect(Changelog.toCalendarDate(timestamp)).toEqual("tomorrow");
    });

    it("should return 'yesterday' for the previous day", () => {
        const timestamp = moment().subtract(1, "day").toISOString();
        expect(Changelog.toCalendarDate(timestamp)).toEqual("yesterday");
    });

    it("should return the day of the week for the next week", () => {
        const timestamp = moment().add(2, "days").toISOString();
        expect(Changelog.toCalendarDate(timestamp)).oneOf([
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]);
    });

    it("should return the day of the week for the previous week", () => {
        const timestamp = moment().subtract(3, "days").toISOString();
        expect(Changelog.toCalendarDate(timestamp)).oneOf([
            "last Monday",
            "last Tuesday",
            "last Wednesday",
            "last Thursday",
            "last Friday",
            "last Saturday",
            "last Sunday",
        ]);
    });

    it("should return the date for any other day", () => {
        const timestamp = "2020-01-01T00:00:00Z";
        expect(Changelog.toCalendarDate(timestamp)).toEqual("1/1/2020");

        const timestamp2 = "2020-01-31T00:00:00Z";
        expect(Changelog.toCalendarDate(timestamp2)).toEqual("1/31/2020");
    });
});

describe("Changelog.withinLastWeek", () => {
    it("should return true for today", () => {
        const timestamp = moment().toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(true);
    });

    it("should return true for yesterday", () => {
        const timestamp = moment().subtract(1, "day").toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(true);
    });

    it("should return true for 6 days ago", () => {
        const timestamp = moment().subtract(6, "days").toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(true);
    });

    it("should return false for 8 days ago", () => {
        const timestamp = moment().subtract(8, "days").toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(false);
    });

    it("should return false for 10 days ago", () => {
        const timestamp = moment().subtract(10, "days").toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(false);
    });

    it("should return false tomorrow", () => {
        const timestamp = moment().add(1, "day").toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(false);
    });

    it("should return false for 7 days from now", () => {
        const timestamp = moment().add(7, "days").toISOString();
        expect(Changelog.withinLastWeek(timestamp)).toEqual(false);
    });
});

describe("Changelog.isFutureDate", () => {
    it("should return true for today", () => {
        const timestamp = moment().toISOString();
        expect(Changelog.isFutureDate(timestamp)).toEqual(false);
    });

    it("should return false for yesterday", () => {
        const timestamp = moment().subtract(1, "day").toISOString();
        expect(Changelog.isFutureDate(timestamp)).toEqual(false);
    });

    it("should return false for 7 days ago", () => {
        const timestamp = moment().subtract(7, "days").toISOString();
        expect(Changelog.isFutureDate(timestamp)).toEqual(false);
    });

    it("should return true for tomorrow", () => {
        const timestamp = moment().add(1, "day").toISOString();
        expect(Changelog.isFutureDate(timestamp)).toEqual(true);
    });

    it("should return true for 7 days from now", () => {
        const timestamp = moment().add(7, "days").toISOString();
        expect(Changelog.isFutureDate(timestamp)).toEqual(true);
    });
});
