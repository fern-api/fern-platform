import { FdrAPI } from "@fern-api/fdr-sdk";
import { AvailabilityConverterNode } from "../../../3.1/extensions/AvailabilityConverter.node";
import { convertToObjectProperties } from "../../3.1/convertToObjectProperties";

describe("convertToObjectProperties", () => {
    it("should return undefined when properties is undefined", () => {
        expect(convertToObjectProperties(undefined)).toBeUndefined();
    });

    it("should convert properties to object properties", () => {
        const mockTypeShape: FdrAPI.api.latest.TypeShape = {
            type: "alias",
            value: {
                type: "primitive",
                value: {
                    type: "string",
                    regex: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    default: undefined,
                },
            },
        };

        const mockAvailabilityShape: FdrAPI.Availability = "Deprecated";

        const properties = {
            name: {
                description: "The name",
                availability: {
                    convert: () => mockAvailabilityShape,
                } as AvailabilityConverterNode,
                convert: () => mockTypeShape,
            },
            age: {
                convert: () => mockTypeShape,
            },
        };

        const result = convertToObjectProperties(properties);

        expect(result).toEqual([
            {
                key: FdrAPI.PropertyKey("name"),
                valueShape: mockTypeShape,
                description: "The name",
                availability: mockAvailabilityShape,
            },
            {
                key: FdrAPI.PropertyKey("age"),
                valueShape: mockTypeShape,
                description: undefined,
                availability: undefined,
            },
        ]);
    });

    it("should filter out properties with null value shapes", () => {
        const mockTypeShape: FdrAPI.api.latest.TypeShape = {
            type: "alias",
            value: {
                type: "primitive",
                value: {
                    type: "string",
                    regex: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    default: undefined,
                },
            },
        };

        const properties = {
            valid: {
                convert: () => mockTypeShape,
            },
            invalid: {
                convert: () => undefined,
            },
        };

        const result = convertToObjectProperties(properties);

        expect(result).toEqual([
            {
                key: FdrAPI.PropertyKey("valid"),
                valueShape: mockTypeShape,
                description: undefined,
                availability: undefined,
            },
        ]);
    });
});
