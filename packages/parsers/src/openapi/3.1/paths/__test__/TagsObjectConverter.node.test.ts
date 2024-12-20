import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";
import { TagObjectConverterNode } from "../TagsObjectConverter.node";

describe("TagObjectConverterNode", () => {
    const mockContext = createMockContext();

    const baseArgs: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.TagObject> = {
        input: {
            name: "test-tag",
            description: "Test tag description",
        },
        context: mockContext,
        accessPath: [],
        pathId: "test",
    };

    describe("parse()", () => {
        it("should parse tag name", () => {
            const converter = new TagObjectConverterNode(baseArgs);
            expect(converter.name).toBe("test-tag");
        });
    });

    describe("convert()", () => {
        it("should not throw error", () => {
            const converter = new TagObjectConverterNode(baseArgs);
            expect(() => converter.convert()).not.toThrow();
        });
    });
});
