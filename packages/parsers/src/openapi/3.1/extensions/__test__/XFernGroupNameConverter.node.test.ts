import { createMockContext } from "../../../../__test__/createMockContext.util";
import { XFernGroupNameConverterNode } from "../XFernGroupNameConverter.node";

describe("XFernGroupNameConverterNode", () => {
    const mockContext = createMockContext();

    describe("parse", () => {
        it("sets groupName from x-fern-group-name when present", () => {
            const converter = new XFernGroupNameConverterNode({
                input: { "x-fern-sdk-group-name": "test-group" },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.groupName).toEqual("test-group");
        });

        it("sets groupName to undefined when x-fern-group-name is not present", () => {
            const converter = new XFernGroupNameConverterNode({
                input: {},
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.groupName).toBeUndefined();
        });
    });

    describe("convert", () => {
        it("returns the groupName value", () => {
            const converter = new XFernGroupNameConverterNode({
                input: { "x-fern-sdk-group-name": "test-group" },
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toEqual(["test-group"]);
        });

        it("returns undefined when groupName is not set", () => {
            const converter = new XFernGroupNameConverterNode({
                input: {},
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBeUndefined();
        });
    });
});
