import { getJsonLineNumbers } from "../useHighlightJsonLines";

const MOCK_JSON = {
    // 0
    data: [
        // 1
        {
            // 2
            a: {
                // 3
                b: "string", // 4
            }, // 5
        }, // 6
        {
            // 7
            a: {
                // 8
                b: {
                    // 9
                    c: 1, // 10
                }, // 11
                d: "filter", // 12
            }, // 13
        }, // 14
        {
            // 15
            b: {
                // 16
                c: 2, // 17
            }, // 18
            c: 3, // 19
        }, // 20
        {
            // 21
            a: {
                // 22
                d: "filter", // 23
            }, // 24
        }, // 25
    ], // 26
}; // 27

describe("useHighlightJsonLines", () => {
    it("should return all range of all lines if path is empty", () => {
        expect(getJsonLineNumbers(MOCK_JSON, [])).toEqual([[0, 27]]);
    });

    it("should return nothing with invalid selector", () => {
        expect(
            getJsonLineNumbers(MOCK_JSON, [
                { type: "objectProperty", propertyName: "data" },
                { type: "listItem" },
                { type: "objectProperty", propertyName: "d" },
            ]),
        ).toEqual([]);
    });

    it("should return line numbers with valid selector", () => {
        expect(
            getJsonLineNumbers(MOCK_JSON, [
                { type: "objectProperty", propertyName: "data" },
                { type: "listItem" },
                { type: "objectProperty", propertyName: "a" },
                { type: "objectProperty", propertyName: "b" },
            ]),
        ).toEqual([4, [9, 11]]);
    });

    it("should return line numbers with valid selector and filter", () => {
        expect(
            getJsonLineNumbers(MOCK_JSON, [
                { type: "objectProperty", propertyName: "data" },
                { type: "listItem" },
                { type: "objectProperty", propertyName: "a" },
                { type: "objectFilter", propertyName: "d", requiredStringValue: "filter" },
            ]),
        ).toEqual([
            [8, 13],
            [22, 24],
        ]);
    });
});
