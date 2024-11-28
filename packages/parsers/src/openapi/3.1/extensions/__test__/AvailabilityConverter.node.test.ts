import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { Availability, AvailabilityConverterNode } from "../AvailabilityConverter.node";

describe("AvailabilityConverterNode", () => {
    const mockContext = createMockContext();

    describe("parse", () => {
        it("sets availability to deprecated when input.deprecated is true", () => {
            const converter = new AvailabilityConverterNode({
                input: { deprecated: true },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.availability).toBe("deprecated");
        });

        it("sets availability from x-fern-availability when valid", () => {
            const converter = new AvailabilityConverterNode({
                input: { "x-fern-availability": "pre-release" } as OpenAPIV3_1.SchemaObject,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.availability).toBe("pre-release");
        });

        it("sets availability to undefined and warns when x-fern-availability is invalid", () => {
            const converter = new AvailabilityConverterNode({
                input: { "x-fern-availability": "invalid" as Availability } as OpenAPIV3_1.SchemaObject,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.availability).toBeUndefined();
            expect(mockContext.errors.warning).toHaveBeenCalled();
        });
    });

    describe("convert", () => {
        it("converts pre-release to Beta", () => {
            const converter = new AvailabilityConverterNode({
                input: { "x-fern-availability": "pre-release" } as OpenAPIV3_1.SchemaObject,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe(FernRegistry.Availability.Beta);
        });

        it("converts in-development to InDevelopment", () => {
            const converter = new AvailabilityConverterNode({
                input: { "x-fern-availability": "in-development" } as OpenAPIV3_1.SchemaObject,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe(FernRegistry.Availability.InDevelopment);
        });

        it("converts generally-available to GenerallyAvailable", () => {
            const converter = new AvailabilityConverterNode({
                input: { "x-fern-availability": "generally-available" } as OpenAPIV3_1.SchemaObject,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe(FernRegistry.Availability.GenerallyAvailable);
        });

        it("converts deprecated to Deprecated", () => {
            const converter = new AvailabilityConverterNode({
                input: { deprecated: true },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe(FernRegistry.Availability.Deprecated);
        });

        it("returns undefined when availability is undefined", () => {
            const converter = new AvailabilityConverterNode({
                input: {},
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBeUndefined();
        });
    });
});
