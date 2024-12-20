import { isNonNullish } from "@fern-api/ui-core-utils";
import { FernDefinition } from "@fern-fern/docs-parsers-fern-definition";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { isExampleCodeSampleSchemaLanguage } from "../guards/isExampleCodeSampleSchemaLanguage";
import { isExampleCodeSampleSchemaSdk } from "../guards/isExampleCodeSampleSchemaSdk";
import { isExampleResponseBody } from "../guards/isExampleResponseBody";
import { isExampleSseResponseBody } from "../guards/isExampleSseResponseBody";
import { isFileWithData } from "../guards/isFileWithData";
import { isRecord } from "../guards/isRecord";
import {
  RequestMediaTypeObjectConverterNode,
  ResponseMediaTypeObjectConverterNode,
} from "../paths";
import { X_FERN_EXAMPLES } from "./fernExtension.consts";

export declare namespace XFernEndpointExampleConverterNode {
  interface Input {
    [X_FERN_EXAMPLES]?: FernDefinition.ExampleEndpointCallSchema[];
    example?: OpenAPIV3_1.ExampleObject;
  }
}

export class XFernEndpointExampleConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  FernRegistry.api.latest.ExampleEndpointCall[]
> {
  examples: FernDefinition.ExampleEndpointCallSchema[] | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>,
    protected path: string,
    protected successResponseStatusCode: number,
    protected requestBodyByContentType:
      | Record<string, RequestMediaTypeObjectConverterNode>
      | undefined,
    protected responseBodies: ResponseMediaTypeObjectConverterNode[] | undefined
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.examples = extendType<XFernEndpointExampleConverterNode.Input>(
      this.input
    )[X_FERN_EXAMPLES];

    // if (!ajv.validate(this.request?.requestBodiesByContentType, this.openApiExample)) {
    //     this.context.errors.error({
    //         message: "Invalid example object",
    //         path: [...this.accessPath, "example"],
    //     });
    // }
  }

  convertFormDataExampleRequest(
    requestBody: RequestMediaTypeObjectConverterNode,
    exampleValue: Record<string, unknown> | string
  ): FernRegistry.api.latest.ExampleEndpointRequest | undefined {
    if (requestBody.fields == null) {
      return undefined;
    }
    switch (requestBody.contentType) {
      case "form-data": {
        const formData = Object.fromEntries(
          Object.entries(requestBody.fields)
            .map(([key, field]) => {
              const value =
                typeof exampleValue === "object"
                  ? exampleValue[key]
                  : undefined;
              switch (field.multipartType) {
                case "file": {
                  if (isFileWithData(value)) {
                    return [
                      key,
                      {
                        type: "filenameWithData",
                        filename: value.filename,
                        data: FernRegistry.FileId(value.data),
                      },
                    ];
                  } else if (value != null) {
                    return [
                      key,
                      {
                        type: "filename",
                        value,
                      },
                    ];
                  } else {
                    return undefined;
                  }
                }
                case "files": {
                  if (Array.isArray(value)) {
                    if (value.every((value) => isFileWithData(value))) {
                      return [
                        key,
                        {
                          type: "filenamesWithData",
                          value: value.map((value) => ({
                            filename: value.filename,
                            data: FernRegistry.FileId(value.data),
                          })),
                        },
                      ];
                    } else if (
                      value.every((value) => typeof value === "string")
                    ) {
                      return [
                        key,
                        {
                          type: "filenames",
                          value,
                        },
                      ];
                    }
                  }
                  return undefined;
                }
                case "property":
                  return [
                    key,
                    {
                      type: "json",
                      value,
                    },
                  ];
                case undefined:
                  return undefined;
                default:
                  new UnreachableCaseError(field.multipartType);
                  return undefined;
              }
            })
            .filter(isNonNullish)
        );
        return {
          type: "form",
          value: formData,
        };
      }

      case "json":
        return {
          type: "json",
          value: exampleValue,
        };
      case "bytes":
        return typeof exampleValue === "string"
          ? {
              type: "bytes",
              value: {
                type: "base64",
                value: exampleValue,
              },
            }
          : undefined;
      default:
        return undefined;
    }
  }

  convert(): FernRegistry.api.latest.ExampleEndpointCall[] | undefined {
    if (this.examples == null) {
      return undefined;
    }
    if (
      this.requestBodyByContentType != null &&
      Object.keys(this.requestBodyByContentType).length > 1
    ) {
      this.context.logger.warn(
        `Multiple request bodies found for #/${[this.accessPath, this.pathId, "x-fern-examples"].join("/")}. Coercing to first request body until supported.`
      );
    }
    const requestBodyContentTypeKey = Object.keys(
      this.requestBodyByContentType ?? {}
    )[0];

    if (requestBodyContentTypeKey == null) {
      return undefined;
    }

    return this.examples.flatMap((example) => {
      return (this.responseBodies ?? []).map((responseBodyNode) => {
        const requestBodyShape =
          this.requestBodyByContentType?.[requestBodyContentTypeKey];
        let requestBody:
          | FernRegistry.api.latest.ExampleEndpointRequest
          | undefined;
        if (requestBodyShape != null) {
          switch (requestBodyShape.contentType) {
            case "form-data":
              requestBody = isRecord(example.request)
                ? this.convertFormDataExampleRequest(
                    requestBodyShape,
                    example.request
                  )
                : undefined;
              break;
            case "json":
              requestBody = {
                type: "json",
                value: example.request,
              };
              break;
            case "bytes":
              requestBody =
                typeof example.request === "string"
                  ? {
                      type: "bytes",
                      value: {
                        type: "base64",
                        value: example.request,
                      },
                    }
                  : undefined;
              break;
            case undefined:
              break;
            default:
              new UnreachableCaseError(requestBodyShape.contentType);
              break;
          }
        }

        let responseBody:
          | FernRegistry.api.latest.ExampleEndpointResponse
          | undefined;
        switch (responseBodyNode.contentType) {
          case "application/json": {
            if (isExampleResponseBody(example.response)) {
              responseBody = {
                type: "json",
                value: example.response.body,
              };
            }
            break;
          }
          case "text/event-stream": {
            if (isExampleSseResponseBody(example.response)) {
              responseBody = {
                type: "sse",
                value: example.response.stream.map((streamPayload) => ({
                  event: streamPayload.event,
                  data: streamPayload.data,
                })),
              };
            }
            break;
          }
          case "application/octet-stream":
            if (typeof example.response === "string") {
              responseBody = {
                type: "filename",
                // TODO: example response should be a filename for now, but we should support different types of file patterns,
                // e.g. an S3 link with an audio stream
                value: example.response,
              };
            }
            break;
          case undefined:
            break;
          default:
            new UnreachableCaseError(responseBodyNode.contentType);
            break;
        }

        const snippets: Record<
          FernRegistry.api.latest.Language,
          FernRegistry.api.latest.CodeSnippet[]
        > = {};
        example["code-samples"]?.forEach((snippet) => {
          if (isExampleCodeSampleSchemaLanguage(snippet)) {
            if (snippet.language != null) {
              snippets[snippet.language] ??= [];
              snippets[snippet.language]?.push({
                name: snippet.name,
                language: snippet.language,
                install: snippet.install,
                code: snippet.code,
                generated: false,
                description: snippet.docs,
              });
            }
          } else if (isExampleCodeSampleSchemaSdk(snippet)) {
            if (snippet.sdk != null) {
              snippets[snippet.sdk] ??= [];
              snippets[snippet.sdk]?.push({
                name: snippet.name,
                language: snippet.sdk,
                install: undefined,
                code: snippet.code,
                generated: false,
                description: snippet.docs,
              });
            }
          }
        });

        return {
          path: this.path,
          responseStatusCode: this.successResponseStatusCode,
          name: example.name,
          description: example.docs,
          pathParameters: Object.fromEntries(
            Object.entries(example["path-parameters"] ?? {}).map(
              ([key, value]) => [FernRegistry.PropertyKey(key), value]
            )
          ),
          queryParameters: Object.fromEntries(
            Object.entries(example["query-parameters"] ?? {}).map(
              ([key, value]) => [FernRegistry.PropertyKey(key), value]
            )
          ),
          headers: Object.fromEntries(
            Object.entries(example.headers ?? {}).map(([key, value]) => [
              FernRegistry.PropertyKey(key),
              value,
            ])
          ),
          requestBody,
          responseBody,
          snippets,
        };
      });
    });
  }
}
