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
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { MediaType } from "../../../utils/MediaType";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";

export type ResponseContentType = ConstArrayToType<
  typeof SUPPORTED_RESPONSE_CONTENT_TYPES
>;
export type ResponseStreamingFormat = ConstArrayToType<
  typeof SUPPORTED_STREAMING_FORMATS
>;

export class ResponseMediaTypeObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.MediaTypeObject,
  FernRegistry.api.latest.HttpResponseBodyShape
> {
  schema: SchemaConverterNode | undefined;
  contentType: ResponseContentType | undefined;
  contentSubtype: string | undefined;
  streamingFormat: ResponseStreamingFormat | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
    contentType: string | undefined,
    streamingFormat: ResponseStreamingFormat | undefined
  ) {
    super(args);
    this.safeParse(contentType, streamingFormat);
  }

  parse(
    contentType: string | undefined,
    streamingFormat: ResponseStreamingFormat | undefined
  ): void {
    const mediaType = MediaType.parse(contentType);

    if (mediaType?.isJSON() || mediaType?.isEventStream()) {
      this.contentType = "application/json" as const;
      this.streamingFormat = streamingFormat;
      if (this.input.schema == null) {
        if (streamingFormat == null || streamingFormat === "json") {
          this.context.errors.error({
            message: "Expected schema for JSON response body. Received null",
            path: this.accessPath,
          });
        }
      } else {
        if (isReferenceObject(this.input.schema)) {
          this.schema = new SchemaConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "type",
          });
        } else {
          this.schema = new SchemaConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "type",
          });
        }
      }
    } else if (mediaType?.isOctetStream()) {
      this.contentType = "application/octet-stream" as const;
      this.contentSubtype = resolveSchemaReference(
        this.input.schema,
        this.context.document
      )?.contentMediaType;
    }
  }

  convertStreamingFormat():
    | FernRegistry.api.latest.HttpResponseBodyShape
    | undefined {
    switch (this.streamingFormat) {
      case "json": {
        const shape = this.schema?.convert();
        if (shape == null) {
          return undefined;
        }
        return {
          type: "stream",
          // TODO: Parse terminator (probably extension)
          terminator: "[DATA]",
          shape,
        };
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

  convert(): FernRegistry.api.latest.HttpResponseBodyShape | undefined {
    switch (this.contentType) {
      case "application/json":
        if (this.streamingFormat == null) {
          const shape = this.schema?.convert();
          if (
            shape == null ||
            (shape.type !== "object" && shape.type !== "alias")
          ) {
            return undefined;
          }
          return shape;
        } else {
          return this.convertStreamingFormat();
        }
      case "application/octet-stream":
        return {
          type: "fileDownload",
          contentType: this.contentSubtype,
        };
      case "text/event-stream":
        return this.convertStreamingFormat();
      case undefined:
        return undefined;
      default:
        new UnreachableCaseError(this.contentType);
        return undefined;
    }
  }
}
