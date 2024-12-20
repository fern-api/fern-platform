import { createMockContext } from "../../../../__test__/createMockContext.util";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";
import { XFernSdkMethodNameConverterNode } from "../XFernSdkMethodNameConverter.node";
import { X_FERN_SDK_METHOD_NAME } from "../fernExtension.consts";

describe("XFernSdkMethodNameConverterNode", () => {
    const mockContext = createMockContext();

    const baseArgs: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown> = {
        input: {},
        context: mockContext,
        accessPath: [],
        pathId: "test",
    };

    describe("convert()", () => {
        it("should return undefined when no SDK method name is provided", () => {
            const converter = new XFernSdkMethodNameConverterNode({
                ...baseArgs,
                input: {},
            });

            const result = converter.convert();
            expect(result).toBeUndefined();
        });

        it("should return the SDK method name when provided", () => {
            const methodName = "createUser";
            const converter = new XFernSdkMethodNameConverterNode({
                ...baseArgs,
                input: {
                    [X_FERN_SDK_METHOD_NAME]: methodName,
                },
            });

            const result = converter.convert();
            expect(result).toBe(methodName);
        });
    });
});
