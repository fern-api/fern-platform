import { isNonNullish } from "@fern-api/ui-core-utils";
import { camelCase, mapValues } from "es-toolkit";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import {
  APPLICATION_JSON_CONTENT_TYPE,
  APPLICATION_OCTET_STREAM_CONTENT_TYPE,
  HttpMethod,
} from "../../../constants";
import {
  ConstArrayToType,
  SUPPORTED_RESPONSE_CONTENT_TYPES,
  SUPPORTED_STREAMING_FORMATS,
} from "../../../types/format.types";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { createTypeDefinition } from "../../../utils/createTypeDefinition";
import { getExampleName } from "../../../utils/getExampleName";
import { matchExampleName } from "../../../utils/matchExampleNames";
import { maybeSingleValueToArray } from "../../../utils/maybeSingleValueToArray";
import { MediaType } from "../../../utils/MediaType";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";
import {
  ExampleObjectConverterNode,
  GLOBAL_EXAMPLE_NAME,
} from "../ExampleObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../request/RequestMediaTypeObjectConverter.node";

export type ResponseContentType = ConstArrayToType<
  typeof SUPPORTED_RESPONSE_CONTENT_TYPES
>;
export type ResponseStreamingFormat = ConstArrayToType<
  typeof SUPPORTED_STREAMING_FORMATS
>;

export class ResponseMediaTypeObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.MediaTypeObject,
  | FernRegistry.api.latest.HttpResponseBodyShape
  | FernRegistry.api.latest.HttpResponseBodyShape[]
> {
  schema: SchemaConverterNode | undefined;
  contentType: ResponseContentType | undefined;
  unsupportedContentType: string | undefined;
  contentSubtype: string | undefined;
  examples: ExampleObjectConverterNode[] | undefined;
  empty: boolean | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
    contentType: string | undefined,
    protected streamingFormat: ResponseStreamingFormat | undefined,
    protected path: string,
    protected method: HttpMethod,
    protected statusCode: number,
    protected requests: RequestMediaTypeObjectConverterNode[],
    protected shapes: ExampleObjectConverterNode.Shapes
  ) {
    super(args);
    this.safeParse(contentType);
  }

  matchRequestResponseExamplesByName(
    requests: RequestMediaTypeObjectConverterNode[],
    responseExamples: Record<
      string,
      (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject | undefined)[]
    >,
    matchedExampleNames: Set<string>
  ) {
    for (const request of requests) {
      for (const [requestExampleName, requestExample] of Object.entries(
        request?.examples ?? {}
      )) {
        for (const [responseExampleName, responseExampleList] of Object.entries(
          responseExamples
        )) {
          for (const responseExample of responseExampleList) {
            if (matchExampleName(responseExampleName, requestExampleName)) {
              matchedExampleNames.add(responseExampleName);
              this.examples?.push(
                new ExampleObjectConverterNode(
                  {
                    input: {
                      requestExample,
                      responseExample,
                    },
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId:
                      requestExampleName != null && requestExampleName !== ""
                        ? ["examples", requestExampleName]
                        : "examples",
                  },
                  this.path,
                  this.statusCode,
                  getExampleName(requestExampleName, responseExampleName),
                  {
                    requestBody: request,
                    responseBody: this,
                    pathParameters: this.shapes.pathParameters,
                    queryParameters: this.shapes.queryParameters,
                    requestHeaders: this.shapes.requestHeaders,
                  }
                )
              );
            }
          }
        }
      }
    }
  }

  matchExamplesByIndex(
    requestExamples: (
      | [
          RequestMediaTypeObjectConverterNode,
          string,
          OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject,
        ]
      | undefined
    )[],
    responseExamples: [
      string,
      (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject | undefined)[],
    ][]
  ) {
    let requestExampleIndex = 0;
    for (const maybeRequestContainer of requestExamples) {
      let responseExampleIndex = 0;
      for (const [
        responseExampleName,
        responseExampleList,
      ] of responseExamples) {
        if (responseExampleIndex === requestExampleIndex) {
          const [request, requestExampleName, requestExample] =
            maybeRequestContainer ?? [undefined, undefined, undefined];

          this.examples?.push(
            ...responseExampleList.map(
              (responseExample) =>
                new ExampleObjectConverterNode(
                  {
                    input: {
                      requestExample,
                      responseExample,
                    },
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId:
                      requestExampleName != null && requestExampleName !== ""
                        ? ["examples", requestExampleName]
                        : "examples",
                  },
                  this.path,
                  this.statusCode,
                  getExampleName(requestExampleName, responseExampleName),
                  {
                    requestBody: request,
                    responseBody: this,
                    pathParameters: this.shapes.pathParameters,
                    queryParameters: this.shapes.queryParameters,
                    requestHeaders: this.shapes.requestHeaders,
                  }
                )
            )
          );
        }
        responseExampleIndex++;
      }
      requestExampleIndex++;
    }

    if (requestExamples.length > responseExamples.length) {
      for (const maybeRequestContainer of requestExamples.slice(
        responseExamples.length
      )) {
        const [responseExampleName, responseExampleList] = responseExamples[
          responseExamples.length - 1
        ] ?? [undefined, undefined];
        const [request, requestExampleName, requestExample] =
          maybeRequestContainer ?? [undefined, undefined, undefined];
        this.examples?.push(
          ...(responseExampleList ?? [undefined]).map(
            (responseExample) =>
              new ExampleObjectConverterNode(
                {
                  input: {
                    requestExample,
                    responseExample,
                  },
                  context: this.context,
                  accessPath: this.accessPath,
                  pathId:
                    requestExampleName != null && requestExampleName !== ""
                      ? ["examples", requestExampleName]
                      : "examples",
                },
                this.path,
                this.statusCode,
                getExampleName(requestExampleName, responseExampleName),
                {
                  requestBody: request,
                  responseBody: this,
                  pathParameters: this.shapes.pathParameters,
                  queryParameters: this.shapes.queryParameters,
                  requestHeaders: this.shapes.requestHeaders,
                }
              )
          )
        );
      }
    }

    if (responseExamples.length > requestExamples.length) {
      const [request, requestExampleName, requestExample] = requestExamples[
        requestExamples.length - 1
      ] ?? [undefined, undefined, undefined];

      for (const [
        responseExampleName,
        responseExampleList,
      ] of responseExamples.slice(requestExamples.length)) {
        this.examples?.push(
          ...responseExampleList.map(
            (responseExample) =>
              new ExampleObjectConverterNode(
                {
                  input: {
                    requestExample,
                    responseExample,
                  },
                  context: this.context,
                  accessPath: this.accessPath,
                  pathId:
                    requestExampleName != null && requestExampleName !== ""
                      ? ["examples", requestExampleName]
                      : "examples",
                },
                this.path,
                this.statusCode,
                getExampleName(requestExampleName, responseExampleName),
                {
                  requestBody: request,
                  responseBody: this,
                  pathParameters: this.shapes.pathParameters,
                  queryParameters: this.shapes.queryParameters,
                  requestHeaders: this.shapes.requestHeaders,
                }
              )
          )
        );
      }
    }
  }

  pushResponseExample(
    responseExamples: Record<
      string,
      (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject | undefined)[]
    >,
    request: RequestMediaTypeObjectConverterNode | undefined,
    requestExampleName: string | undefined,
    requestExample:
      | OpenAPIV3_1.ReferenceObject
      | OpenAPIV3_1.ExampleObject
      | undefined
  ) {
    const resExamples = responseExamples[GLOBAL_EXAMPLE_NAME];
    if (resExamples == null) {
      return;
    }
    for (const responseExample of resExamples) {
      this.examples?.push(
        new ExampleObjectConverterNode(
          {
            input: {
              requestExample,
              responseExample,
            },
            context: this.context,
            accessPath: this.accessPath,
            pathId:
              requestExampleName != null && requestExampleName !== ""
                ? ["examples", requestExampleName]
                : "examples",
          },
          this.path,
          this.statusCode,
          getExampleName(requestExampleName, undefined),
          {
            requestBody: request,
            responseBody: this,
            pathParameters: this.shapes.pathParameters,
            queryParameters: this.shapes.queryParameters,
            requestHeaders: this.shapes.requestHeaders,
          }
        )
      );
    }
  }

  addGlobalFallbackExample(
    requests: RequestMediaTypeObjectConverterNode[],
    responseExamples: Record<
      string,
      (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject | undefined)[]
    >
  ) {
    if (requests == null || requests.length === 0) {
      this.pushResponseExample(
        responseExamples,
        undefined,
        undefined,
        undefined
      );
    } else {
      for (const request of requests) {
        if (Object.keys(request.examples ?? {}).length === 0) {
          this.pushResponseExample(
            responseExamples,
            request,
            undefined,
            undefined
          );
        } else {
          for (const [requestExampleName, requestExample] of Object.entries(
            request.examples ?? {}
          )) {
            this.pushResponseExample(
              responseExamples,
              request,
              requestExampleName,
              requestExample
            );
          }
        }
      }
    }
  }

  parse(contentType: string | undefined): void {
    if (contentType === "empty") {
      this.empty = true;
    } else {
      const mediaType = MediaType.parse(contentType);

      if (mediaType?.isJSON() || mediaType?.isEventStream()) {
        this.contentType = APPLICATION_JSON_CONTENT_TYPE;
        if (this.input.schema == null) {
          if (this.streamingFormat == null || this.streamingFormat === "json") {
            this.context.errors.error({
              message: "Expected schema for JSON response body. Received null",
              path: this.accessPath,
            });
          }
        } else {
          this.schema = new SchemaConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "type",
            seenSchemas: new Set(),
            nullable: undefined,
            schemaName: "Response Body",
          });
        }
      } else if (mediaType?.isOctetStream()) {
        this.contentType = APPLICATION_OCTET_STREAM_CONTENT_TYPE;
        this.contentSubtype = resolveSchemaReference(
          this.input.schema,
          this.context.document
        )?.contentMediaType;
      } else {
        this.unsupportedContentType = contentType;
        if (this.input.schema == null) {
          this.context.errors.error({
            message:
              "Expected schema for plain text response body. Received null",
            path: this.accessPath,
          });
          return;
        } else {
          this.schema = new SchemaConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
            seenSchemas: new Set(),
            nullable: undefined,
            schemaName: "Response Body",
          });
        }
      }
    }

    let responseExamples: Record<
      string | symbol,
      (OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject | undefined)[]
    > = {};

    if (this.input.examples != null) {
      responseExamples = mapValues(this.input.examples, (v) => [v]);
    }

    if (
      this.input.example != null &&
      Object.keys(responseExamples).length === 0
    ) {
      responseExamples[GLOBAL_EXAMPLE_NAME] ??= [];
      responseExamples[GLOBAL_EXAMPLE_NAME] = [
        {
          value: this.input.example,
        },
      ];
    }

    const resolvedSchema = resolveSchemaReference(
      this.input.schema,
      this.context.document
    );

    if (resolvedSchema != null) {
      if (
        resolvedSchema.examples != null &&
        Object.keys(responseExamples).length === 0
      ) {
        responseExamples = mapValues(resolvedSchema.examples, (v) => [v]);
      }

      if (
        resolvedSchema.example != null &&
        Object.keys(responseExamples).length === 0
      ) {
        responseExamples[GLOBAL_EXAMPLE_NAME] ??= [];
        responseExamples[GLOBAL_EXAMPLE_NAME]?.push({
          value: resolvedSchema.example,
        });
      }
    }

    if (Object.keys(responseExamples).length === 0) {
      const fallbackExample = this.schema?.example({
        includeOptionals: true,
        override: undefined,
      });
      responseExamples[GLOBAL_EXAMPLE_NAME] ??= [];
      responseExamples[GLOBAL_EXAMPLE_NAME]?.push(
        fallbackExample != null
          ? {
              value: fallbackExample,
            }
          : undefined
      );
    }

    this.examples ??= [];

    const matchedExampleNames = new Set<string>();

    // match examples based on name given
    this.matchRequestResponseExamplesByName(
      this.requests,
      responseExamples,
      matchedExampleNames
    );

    // Filter out examples that have already been matched
    const filteredRequestExamples: (
      | [
          RequestMediaTypeObjectConverterNode,
          string,
          OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject,
        ]
      | undefined
    )[] = [];
    for (const request of this.requests) {
      filteredRequestExamples.push(
        ...Object.entries(request.examples ?? {})
          .filter(
            ([exampleName]) =>
              !matchedExampleNames.has(exampleName) &&
              exampleName !== GLOBAL_EXAMPLE_NAME
          )
          .map<
            [
              RequestMediaTypeObjectConverterNode,
              string,
              OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ExampleObject,
            ]
          >(([exampleName, example]) => [request, exampleName, example])
      );
    }

    const filteredResponseExamples = Object.entries(responseExamples).filter(
      ([exampleName, examples]) =>
        !matchedExampleNames.has(exampleName) &&
        isNonNullish(examples) &&
        exampleName !== GLOBAL_EXAMPLE_NAME
    );

    // Match based on index, saturating examples at the end of lists if mismatched
    this.matchExamplesByIndex(
      filteredRequestExamples,
      filteredResponseExamples
    );

    // Fallback to a generated example if no examples were matched
    if (
      !matchedExampleNames.has(GLOBAL_EXAMPLE_NAME) &&
      this.examples.length === 0
    ) {
      this.addGlobalFallbackExample(this.requests, responseExamples);
    }

    if (this.examples.length === 0) {
      this.examples = undefined;
    }
  }

  convertStreamingFormat():
    | FernRegistry.api.latest.HttpResponseBodyShape
    | FernRegistry.api.latest.HttpResponseBodyShape[]
    | undefined {
    switch (this.streamingFormat) {
      case "json": {
        const maybeShapes = maybeSingleValueToArray(this.schema?.convert());

        return maybeShapes?.map((shape) => ({
          type: "stream",
          // TODO: Parse terminator (probably extension)
          terminator: "[DATA]",
          shape,
        }));
      }
      case "sse":
        return { type: "streamingText" };
      case undefined:
        return undefined;
      default:
        new UnreachableCaseError(this.streamingFormat);
        return undefined;
    }
  }

  convertJsonLike():
    | FernRegistry.api.latest.HttpResponseBodyShape
    | FernRegistry.api.latest.HttpResponseBodyShape[]
    | undefined {
    const maybeShapes = maybeSingleValueToArray(this.schema?.convert());

    return maybeShapes
      ?.map((shape) => {
        const type = shape.type;
        switch (type) {
          case "alias":
            return shape;
          case "discriminatedUnion":
          case "undiscriminatedUnion":
          case "enum": {
            const uniqueId = camelCase(
              [this.method, this.path, this.statusCode, "response"].join("_")
            );
            createTypeDefinition({
              uniqueId,
              type: shape,
              contextTypes: this.context.generatedTypes,
              description: this.schema?.description,
              availability: this.schema?.availability?.convert(),
            });
            return {
              type: "alias" as const,
              value: {
                type: "id" as const,
                id: FernRegistry.TypeId(uniqueId),
                default:
                  shape.type === "enum" && shape.default != null
                    ? {
                        type: "enum" as const,
                        value: shape.default,
                      }
                    : undefined,
              },
            };
          }
          case "object":
            return shape;
          default:
            new UnreachableCaseError(type);
            return undefined;
        }
      })
      .filter(isNonNullish);
  }

  convert():
    | FernRegistry.api.latest.HttpResponseBodyShape
    | FernRegistry.api.latest.HttpResponseBodyShape[]
    | undefined {
    if (this.empty) {
      return {
        type: "empty",
      };
    }

    if (this.contentType != null) {
      switch (this.contentType) {
        case "application/json":
          if (this.streamingFormat == null) {
            return this.convertJsonLike();
          } else {
            return this.convertStreamingFormat();
          }
        case "application/octet-stream":
          return { type: "fileDownload", contentType: this.contentSubtype };
        case "text/event-stream":
          return this.convertStreamingFormat();
        case undefined:
          return undefined;
        default:
          new UnreachableCaseError(this.contentType);
          return undefined;
      }
    } else if (this.unsupportedContentType != null) {
      return this.convertJsonLike();
    } else {
      return undefined;
    }
  }
}
