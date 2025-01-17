import { createMockContext } from "../../../../__test__/createMockContext.util";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../../BaseOpenApiV3_1Converter.node";
import { RedocExampleConverterNode } from "../../examples/RedocExampleConverter.node";
import {
  REDOC_CODE_SAMPLES_CAMEL,
  REDOC_CODE_SAMPLES_KEBAB,
} from "../../openApiExtension.consts";

describe("RedocExampleConverterNode", () => {
  const createNode = (input: unknown): RedocExampleConverterNode => {
    const args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown> = {
      input,
      context: createMockContext(),
      accessPath: [],
      pathId: "",
    };
    return new RedocExampleConverterNode(args);
  };

  describe("parse()", () => {
    test("parses kebab case code samples", () => {
      const input = {
        [REDOC_CODE_SAMPLES_KEBAB]: [
          {
            lang: "typescript",
            label: "TypeScript Example",
            source: "console.log('hello')",
          },
        ],
      };
      const node = createNode(input);
      expect(node.codeSamples).toEqual([
        {
          lang: "typescript",
          label: "TypeScript Example",
          source: "console.log('hello')",
        },
      ]);
    });

    test("parses camel case code samples", () => {
      const input = {
        [REDOC_CODE_SAMPLES_CAMEL]: [
          {
            lang: "python",
            label: "Python Example",
            source: "print('hello')",
          },
        ],
      };
      const node = createNode(input);
      expect(node.codeSamples).toEqual([
        {
          lang: "python",
          label: "Python Example",
          source: "print('hello')",
        },
      ]);
    });

    test("combines kebab and camel case samples", () => {
      const input = {
        [REDOC_CODE_SAMPLES_KEBAB]: [
          {
            lang: "typescript",
            source: "console.log('hello')",
          },
        ],
        [REDOC_CODE_SAMPLES_CAMEL]: [
          {
            lang: "python",
            source: "print('hello')",
          },
        ],
      };
      const node = createNode(input);
      expect(node.codeSamples).toEqual([
        {
          lang: "typescript",
          source: "console.log('hello')",
        },
        {
          lang: "python",
          source: "print('hello')",
        },
      ]);
    });
  });

  describe("convert()", () => {
    test("converts code samples to CodeSnippets", () => {
      const input = {
        [REDOC_CODE_SAMPLES_KEBAB]: [
          {
            lang: "TypeScript",
            label: "TS Example",
            source: "console.log('hello')",
          },
          {
            lang: "TypeScript",
            source: "console.log('world')",
          },
        ],
      };

      const node = createNode(input);
      const result = node.convert();

      expect(result).toEqual({
        typescript: [
          {
            name: "TS Example",
            language: "TypeScript",
            code: "console.log('hello')",
            install: undefined,
            generated: false,
            description: undefined,
          },
          {
            name: undefined,
            language: "TypeScript",
            code: "console.log('world')",
            install: undefined,
            generated: false,
            description: undefined,
          },
        ],
      });
    });

    test("returns undefined when no code samples", () => {
      const node = createNode({});
      const result = node.convert();
      expect(result).toEqual(undefined);
    });
  });
});
