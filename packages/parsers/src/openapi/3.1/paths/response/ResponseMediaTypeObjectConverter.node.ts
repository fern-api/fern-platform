import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import {
  ConstArrayToType,
  SUPPORTED_RESPONSE_CONTENT_TYPES,
  SUPPORTED_STREAMING_FORMATS,
} from "../../../types/format.types";
import { resolveExampleReference } from "../../../utils/3.1/resolveExampleReference";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { maybeSingleValueToArray } from "../../../utils/maybeSingleValueToArray";
import { MediaType } from "../../../utils/MediaType";
import { singleUndefinedArrayIfNullOrEmpty } from "../../../utils/singleUndefinedArrayIfNullOrEmpty";
import { singleUndefinedRecordIfNullOrEmpty } from "../../../utils/singleUndefinedRecordIfNullOrEmpty";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../request/RequestMediaTypeObjectConverter.node";

export type ResponseContentType = ConstArrayToType<
  typeof SUPPORTED_RESPONSE_CONTENT_TYPES
>;
export type ResponseStreamingFormat = ConstArrayToType<
  typeof SUPPORTED_STREAMING_FORMATS
>;

function matchExampleName(
  exampleName: string,
  requestExampleName: string
): boolean {
  return (
    exampleName === requestExampleName ||
    requestExampleName === "" ||
    exampleName === ""
  );
}

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

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
    contentType: string | undefined,
    protected streamingFormat: ResponseStreamingFormat | undefined,
    protected path: string,
    protected statusCode: number,
    protected requests: RequestMediaTypeObjectConverterNode[],
    protected shapes: ExampleObjectConverterNode.Shapes
  ) {
    super(args);
    this.safeParse(contentType);
  }

  private isExampleDefined(
    example: OpenAPIV3_1.ExampleObject | OpenAPIV3_1.ReferenceObject | undefined
  ): boolean {
    return (
      example != null &&
      resolveExampleReference(example, this.context.document)?.value != null
    );
  }

  private generateSupportedExamples(
    exampleName: string,
    exampleObject: OpenAPIV3_1.ExampleObject | OpenAPIV3_1.ReferenceObject,
    i: number
  ): ExampleObjectConverterNode[] {
    return singleUndefinedArrayIfNullOrEmpty(this.requests).flatMap((request) =>
      Object.entries(singleUndefinedRecordIfNullOrEmpty(request?.examples))
        .map(([requestExampleName, requestExample]) =>
          matchExampleName(exampleName, requestExampleName) &&
          (this.isExampleDefined(requestExample) ||
            this.isExampleDefined(exampleObject))
            ? new ExampleObjectConverterNode(
                {
                  input: {
                    requestExample,
                    responseExample: exampleObject,
                  },
                  context: this.context,
                  accessPath: this.accessPath,
                  pathId: `examples[${i}]`,
                },
                this.path,
                this.statusCode,
                exampleName === "" ? undefined : exampleName,
                {
                  requestBody: request,
                  responseBody: this,
                  pathParameters: this.shapes.pathParameters,
                  queryParameters: this.shapes.queryParameters,
                  requestHeaders: this.shapes.requestHeaders,
                }
              )
            : undefined
        )
        .filter(isNonNullish)
    );
  }

  private generateUnsupportedExamples(
    exampleName: string,
    exampleObject: OpenAPIV3_1.ExampleObject | OpenAPIV3_1.ReferenceObject,
    i: number
  ): ExampleObjectConverterNode[] {
    return singleUndefinedArrayIfNullOrEmpty(this.requests).flatMap((request) =>
      Object.entries(singleUndefinedRecordIfNullOrEmpty(request?.examples))
        .map(([requestExampleName, requestExample]) =>
          matchExampleName(exampleName, requestExampleName) &&
          (this.isExampleDefined(requestExample) || exampleObject != null)
            ? new ExampleObjectConverterNode(
                {
                  input: {
                    requestExample,
                    responseExample: {
                      value: exampleObject,
                    },
                  },
                  context: this.context,
                  accessPath: this.accessPath,
                  pathId: `examples[${i}]`,
                },
                this.path,
                this.statusCode,
                exampleName === "" ? undefined : exampleName,
                {
                  requestBody: request,
                  responseBody: this,
                  pathParameters: this.shapes.pathParameters,
                  queryParameters: this.shapes.queryParameters,
                  requestHeaders: this.shapes.requestHeaders,
                }
              )
            : undefined
        )
        .filter(isNonNullish)
    );
  }

  private generateFallbackExamples(
    fallbackExample: OpenAPIV3_1.ExampleObject | OpenAPIV3_1.ReferenceObject
  ): ExampleObjectConverterNode[] {
    return singleUndefinedArrayIfNullOrEmpty(this.requests).flatMap((request) =>
      Object.values(singleUndefinedRecordIfNullOrEmpty(request?.examples)).map(
        (requestExample) =>
          new ExampleObjectConverterNode(
            {
              input: {
                requestExample,
                responseExample: fallbackExample,
              },
              context: this.context,
              accessPath: this.accessPath,
              pathId: this.pathId,
            },
            this.path,
            this.statusCode,
            undefined,
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

  parse(contentType: string | undefined): void {
    const mediaType = MediaType.parse(contentType);

    if (mediaType?.isJSON() || mediaType?.isEventStream()) {
      this.contentType = "application/json" as const;
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
        });
      }
    } else if (mediaType?.isOctetStream()) {
      this.contentType = "application/octet-stream" as const;
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
        });
      }
    }

    // In this, we match example names on the request and response. If the example is directly on the request or response, we add to everywhere.
    Object.entries(
      this.input.examples ?? {
        "": { value: this.input.example },
      }
    ).forEach(([exampleName, exampleObject], i) => {
      this.examples ??= [];
      this.examples = this.examples.concat(
        this.generateSupportedExamples(exampleName, exampleObject, i)
      );
    });

    if (this.contentType != null || this.unsupportedContentType != null) {
      const resolvedSchema = resolveSchemaReference(
        this.input.schema,
        this.context.document
      );

      this.examples ??= [];
      Object.entries(
        resolvedSchema?.examples ?? {
          "": resolvedSchema?.example,
        }
      ).forEach(([exampleName, exampleObject], i) => {
        this.examples ??= [];
        this.examples = this.examples.concat(
          this.generateUnsupportedExamples(exampleName, exampleObject, i)
        );
      });

      if (this.examples.length === 0 && resolvedSchema != null) {
        const fallbackExample = {
          value:
            resolvedSchema?.example ??
            new SchemaConverterNode({
              input: resolvedSchema,
              context: this.context,
              accessPath: this.accessPath,
              pathId: this.pathId,
            }).example(),
        };

        if (fallbackExample != null) {
          this.examples = this.examples.concat(
            this.generateFallbackExamples(fallbackExample)
          );
        }
      }
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

  convert():
    | FernRegistry.api.latest.HttpResponseBodyShape
    | FernRegistry.api.latest.HttpResponseBodyShape[]
    | undefined {
    if (this.contentType != null) {
      switch (this.contentType) {
        case "application/json":
          if (this.streamingFormat == null) {
            const maybeShapes = maybeSingleValueToArray(this.schema?.convert());

            return maybeShapes
              ?.map((shape) => {
                if (
                  shape == null ||
                  (shape.type !== "object" && shape.type !== "alias")
                ) {
                  return undefined;
                }
                return shape;
              })
              .filter(isNonNullish);
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
      const maybeShapes = maybeSingleValueToArray(this.schema?.convert());

      return maybeShapes
        ?.map((shape) => {
          const type = shape.type;
          switch (type) {
            case "alias":
              return shape;
            case "discriminatedUnion":
            case "undiscriminatedUnion":
            case "enum":
              return undefined;
            case "object":
              return shape;
            default:
              new UnreachableCaseError(type);
              return undefined;
          }
        })
        .filter(isNonNullish);
    } else {
      return undefined;
    }
  }
}
