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
import { RedocExampleConverterNode } from "../../extensions/examples/RedocExampleConverter.node";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";

export type ResponseContentType = ConstArrayToType<typeof SUPPORTED_RESPONSE_CONTENT_TYPES>;
export type ResponseStreamingFormat = ConstArrayToType<typeof SUPPORTED_STREAMING_FORMATS>;

export class ResponseMediaTypeObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.MediaTypeObject,
    FernRegistry.api.latest.HttpResponseBodyShape
> {
    schema: SchemaConverterNode | undefined;
    contentType: ResponseContentType | undefined;
    contentSubtype: string | undefined;
    examples: ExampleObjectConverterNode[] | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
        contentType: string | undefined,
        protected streamingFormat: ResponseStreamingFormat | undefined,
        protected path: string,
        protected statusCode: number,
        protected redocExamplesNode: RedocExampleConverterNode,
    ) {
        super(args);
        this.safeParse(contentType);
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
            this.contentSubtype = resolveSchemaReference(this.input.schema, this.context.document)?.contentMediaType;
        }

        Object.entries(this.input.examples ?? {}).forEach(([exampleName, exampleObject], i) => {
            this.examples ??= [];
            this.examples.push(
                new ExampleObjectConverterNode(
                    {
                        input: {
                            requestExample: undefined,
                            responseExample: exampleObject,
                        },
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: `examples[${i}]`,
                    },
                    this.path,
                    this.statusCode,
                    exampleName,
                    undefined,
                    this,
                    // undefined,
                    // undefined,
                    // undefined,
                    this.redocExamplesNode,
                ),
            );
        });

        if (this.contentType != null) {
            const resolvedSchema = resolveSchemaReference(this.input.schema, this.context.document);
            this.examples ??= [];
            const example =
                resolvedSchema?.example ?? resolvedSchema != null
                    ? new SchemaConverterNode({
                          input: resolvedSchema,
                          context: this.context,
                          accessPath: this.accessPath,
                          pathId: "example",
                      }).example()
                    : undefined;
            if (example != null) {
                this.examples.push(
                    new ExampleObjectConverterNode(
                        {
                            input: {
                                requestExample: undefined,
                                responseExample: example,
                            },
                            context: this.context,
                            accessPath: this.accessPath,
                            pathId: "example",
                        },
                        this.path,
                        this.statusCode,
                        undefined,
                        undefined,
                        this,
                        // undefined,
                        // undefined,
                        // undefined,
                        this.redocExamplesNode,
                    ),
                );
            }
            resolvedSchema?.examples?.forEach((example, i) => {
                if (typeof example !== "object" || !("value" in example)) {
                    this.context.errors.warning({
                        message: "Expected example to be an object with a value property",
                        path: this.accessPath,
                    });
                    return;
                }
                this.examples?.push(
                    new ExampleObjectConverterNode(
                        {
                            input: {
                                requestExample: undefined,
                                responseExample: example,
                            },
                            context: this.context,
                            accessPath: this.accessPath,
                            pathId: `examples[${i}]`,
                        },
                        this.path,
                        this.statusCode,
                        undefined,
                        undefined,
                        this,
                        // undefined,
                        // undefined,
                        // undefined,
                        this.redocExamplesNode,
                    ),
                );
            });
        }
    }

    convertStreamingFormat(): FernRegistry.api.latest.HttpResponseBodyShape | undefined {
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
                    if (shape == null || (shape.type !== "object" && shape.type !== "alias")) {
                        return undefined;
                    }
                    return shape;
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
    }
}
