import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { XFernBasePathConverterNode } from "../XFernBasePathConverter.node";
import { X_FERN_BASE_PATH } from "../fernExtension.consts";

describe("XFernGroupNameConverterNode", () => {
  const mockContext = createMockContext();

<<<<<<< HEAD
    describe("parse", () => {
        it(`sets basePath from ${X_FERN_BASE_PATH} when present`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [X_FERN_BASE_PATH]: "/v1" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it(`properly formats ${X_FERN_BASE_PATH} with slashes`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [X_FERN_BASE_PATH]: "/v1/" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBe("v1");
        });

        it(`sets basePath to undefined when ${X_FERN_BASE_PATH} is not present`, () => {
            const converter = new XFernBasePathConverterNode({
                input: {} as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBeUndefined();
        });

        it(`sets basePath to undefined when ${X_FERN_BASE_PATH} is explicitly null`, () => {
            const converter = new XFernBasePathConverterNode({
                input: { [X_FERN_BASE_PATH]: null } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.basePath).toBeUndefined();
        });
    });

    describe("convert", () => {
        it("returns the basePath value", () => {
            const converter = new XFernBasePathConverterNode({
                input: { [X_FERN_BASE_PATH]: "/v1" } as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBe("v1");
        });

        it("returns undefined when basePath is not set", () => {
            const converter = new XFernBasePathConverterNode({
                input: {} as unknown as OpenAPIV3_1.Document,
                context: mockContext,
                accessPath: [],
                pathId: "",
            });
            expect(converter.convert()).toBeUndefined();
        });
=======
  describe("parse", () => {
    it(`sets basePath from ${X_FERN_BASE_PATH} when present`, () => {
      const converter = new XFernBasePathConverterNode({
        input: { [X_FERN_BASE_PATH]: "/v1" } as unknown as OpenAPIV3_1.Document,
        context: mockContext,
        accessPath: [],
        pathId: "",
      });
      expect(converter.basePath).toBe("v1");
    });

    it(`properly formats ${X_FERN_BASE_PATH} with slashes`, () => {
      const converter = new XFernBasePathConverterNode({
        input: {
          [X_FERN_BASE_PATH]: "/v1/",
        } as unknown as OpenAPIV3_1.Document,
        context: mockContext,
        accessPath: [],
        pathId: "",
      });
      expect(converter.basePath).toBe("v1");
>>>>>>> main
    });

    it(`sets basePath to undefined when ${X_FERN_BASE_PATH} is not present`, () => {
      const converter = new XFernBasePathConverterNode({
        input: {} as unknown as OpenAPIV3_1.Document,
        context: mockContext,
        accessPath: [],
        pathId: "",
      });
      expect(converter.basePath).toBeUndefined();
    });

    it(`sets basePath to undefined when ${X_FERN_BASE_PATH} is explicitly null`, () => {
      const converter = new XFernBasePathConverterNode({
        input: { [X_FERN_BASE_PATH]: null } as unknown as OpenAPIV3_1.Document,
        context: mockContext,
        accessPath: [],
        pathId: "",
      });
      expect(converter.basePath).toBeUndefined();
    });
  });

  describe("convert", () => {
    it("returns the basePath value", () => {
      const converter = new XFernBasePathConverterNode({
        input: { [X_FERN_BASE_PATH]: "/v1" } as unknown as OpenAPIV3_1.Document,
        context: mockContext,
        accessPath: [],
        pathId: "",
      });
      expect(converter.convert()).toBe("v1");
    });

    it("returns undefined when basePath is not set", () => {
      const converter = new XFernBasePathConverterNode({
        input: {} as unknown as OpenAPIV3_1.Document,
        context: mockContext,
        accessPath: [],
        pathId: "",
      });
      expect(converter.convert()).toBeUndefined();
    });
  });
});
