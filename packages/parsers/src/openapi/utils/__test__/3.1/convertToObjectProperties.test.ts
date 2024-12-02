import { FernRegistry } from "../../../../client/generated";
import { AvailabilityConverterNode } from "../../../3.1/extensions/AvailabilityConverter.node";
import { convertToObjectProperties } from "../../3.1/convertToObjectProperties";

describe("convertToObjectProperties", () => {
    it("should return undefined when properties is undefined", () => {
        expect(convertToObjectProperties(undefined)).toBeUndefined();
    });

    it("should convert properties to object properties", () => {
        const mockTypeShape: FernRegistry.api.latest.TypeShape = {
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

        const mockAvailabilityShape: FernRegistry.Availability = "Deprecated";

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
                key: FernRegistry.PropertyKey("name"),
                valueShape: mockTypeShape,
                description: "The name",
                availability: mockAvailabilityShape,
            },
            {
                key: FernRegistry.PropertyKey("age"),
                valueShape: mockTypeShape,
                description: undefined,
                availability: undefined,
            },
        ]);
    });

    it("should filter out properties with null value shapes", () => {
        const mockTypeShape: FernRegistry.api.latest.TypeShape = {
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
                key: FernRegistry.PropertyKey("valid"),
                valueShape: mockTypeShape,
                description: undefined,
                availability: undefined,
            },
        ]);
    });
});
