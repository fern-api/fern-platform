import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import {
  REDOC_CODE_SAMPLES_CAMEL,
  REDOC_CODE_SAMPLES_KEBAB,
} from "../openApiExtension.consts";

export declare namespace RedocExampleConverterNode {
  export type RedocCodeSample = {
    lang: string;
    label?: string;
    source: string;
  };
  export interface Input {
    [REDOC_CODE_SAMPLES_KEBAB]?: RedocCodeSample[];
    [REDOC_CODE_SAMPLES_CAMEL]?: RedocCodeSample[];
  }
}

export class RedocExampleConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  Record<string, FernRegistry.api.latest.CodeSnippet[]>
> {
  codeSamples: RedocExampleConverterNode.RedocCodeSample[] | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  // This would be used to set a member on the node
  parse(): void {
    this.codeSamples = [
      ...(extendType<RedocExampleConverterNode.Input>(this.input)[
        REDOC_CODE_SAMPLES_KEBAB
      ] ?? []),
      ...(extendType<RedocExampleConverterNode.Input>(this.input)[
        REDOC_CODE_SAMPLES_CAMEL
      ] ?? []),
    ];

    this.codeSamples.forEach((codeSample) => {
      if (
        Object.values(FernRegistry.api.v1.read.SupportedLanguage).includes(
          codeSample.lang.toLowerCase() as FernRegistry.api.v1.read.SupportedLanguage
        )
      ) {
        this.context.errors.warning({
          message: `Unsupported language: ${codeSample.lang}. This may not render correctly.`,
          path: this.accessPath,
        });
      }
    });
  }

  convert(): Record<string, FernRegistry.api.latest.CodeSnippet[]> | undefined {
    const convertedCodeSamples: Record<
      string,
      FernRegistry.api.latest.CodeSnippet[]
    > = {};
    this.codeSamples?.forEach((codeSample) => {
      convertedCodeSamples[codeSample.lang.toLowerCase()] ??= [];
      convertedCodeSamples[codeSample.lang.toLowerCase()]?.push({
        name: codeSample.label,
        language: codeSample.lang,
        code: codeSample.source,
        install: undefined,
        generated: false,
        description: undefined,
      });
    });
    if (Object.keys(convertedCodeSamples).length === 0) {
      return undefined;
    }
    return convertedCodeSamples;
  }
}
