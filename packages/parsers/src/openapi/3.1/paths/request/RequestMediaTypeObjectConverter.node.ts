import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, SUPPORTED_REQUEST_CONTENT_TYPES } from "../../../types/format.types";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { MediaType } from "../../../utils/MediaType";
import { AvailabilityConverterNode } from "../../extensions/AvailabilityConverter.node";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";
import { MultipartFormDataPropertySchemaConverterNode } from "./MultipartFormDataPropertySchemaConverter.node";

export type RequestContentType = ConstArrayToType<typeof SUPPORTED_REQUEST_CONTENT_TYPES>;

export class RequestMediaTypeObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.MediaTypeObject,
    FernRegistry.api.latest.HttpRequestBodyShape[]
> {
    description: string | undefined;

    // application/json
    schema: SchemaConverterNode | undefined;

    // application/octet-stream
    isOptional: boolean | undefined;
    contentType: RequestContentType | undefined;

    // multipart/form-data
    availability: AvailabilityConverterNode | undefined;
    requiredFields: string[] | undefined;
    fields: Record<string, MultipartFormDataPropertySchemaConverterNode> | undefined;

    example: ExampleObjectConverterNode | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
        contentType: string | undefined,
        protected path: string,
        protected responseStatusCode: number,
    ) {
        super(args);
        this.safeParse(contentType);
    }

    // TODO: this needs to parse a full schema object and convert it into a request body shape
    parse(contentType: string | undefined): void {
        if (this.input.schema != null) {
            const mediaType = MediaType.parse(contentType);

            this.schema = new SchemaConverterNode({
                input: this.input.schema,
                context: this.context,
                accessPath: this.accessPath,
                pathId: "schema",
            });
            // An exhaustive switch cannot be used here, because contentType is an unbounded string
            if (mediaType?.isOctetStream()) {
                this.contentType = "bytes" as const;
                const schema = resolveSchemaReference(this.input.schema, this.context.document);
                if (schema == null) {
                    this.context.errors.error({
                        message:
                            "Expected object schema or reference for multipart form data request body. Received null",
                        path: this.accessPath,
                    });
                    return;
                }
                this.isOptional = schema.required == null;
            } else if (mediaType?.isMultiPartFormData()) {
                const schema = resolveSchemaReference(this.input.schema, this.context.document);
                if (schema == null) {
                    this.context.errors.error({
                        message:
                            "Expected object schema or reference for multipart form data request body. Received null",
                        path: this.accessPath,
                    });
                    return;
                }
                this.contentType = "form-data" as const;
                this.description = this.input.schema.description;
                this.availability = new AvailabilityConverterNode({
                    input: this.input.schema,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "availability",
                });
                this.requiredFields = schema.required;
                this.fields = Object.fromEntries(
                    Object.entries(schema?.properties ?? {})
                        .map(([key, property]) => {
                            if (property == null) {
                                return undefined;
                            }

                            return [
                                key,
                                new MultipartFormDataPropertySchemaConverterNode({
                                    input: property,
                                    context: this.context,
                                    accessPath: this.accessPath,
                                    pathId: `schema.${key}`,
                                }),
                            ];
                        })
                        .filter(isNonNullish),
                );
            } else {
                this.contentType = "json" as const;
                if (!mediaType?.containsJSON()) {
                    this.context.errors.warning({
                        message: `Unsupported request body content type: ${contentType}, coercing to application/json`,
                        path: this.accessPath,
                    });
                }
            }
        } else {
            this.context.errors.warning({
                message: "Expected media type schema or reference.",
                path: this.accessPath,
            });
        }

        // TODO: request examples? Maybe plumb from top
    }

    convertTypeShapeToHttpRequestBodyShape(
        shape: FernRegistry.api.latest.TypeShape | undefined,
        seenVariants: Set<string> = new Set(),
    ): FernRegistry.api.latest.HttpRequestBodyShape[] | undefined {
        if (
            shape == null ||
            (shape.type === "alias" && shape.value.type === "id" && seenVariants.has(shape.value.id))
        ) {
            return undefined;
        }

        const newSeenVariants = new Set(seenVariants);
        if (shape.type === "alias" && shape.value.type === "id") {
            newSeenVariants.add(shape.value.id);
        }

        const type = shape.type;
        switch (type) {
            case "alias":
            case "object":
                return [shape];
            case "enum":
                return shape.values.map((value) => ({
                    type: "alias",
                    value: {
                        type: "literal",
                        value: {
                            type: "stringLiteral",
                            value: value.value,
                        },
                    },
                }));
            case "undiscriminatedUnion":
                return shape.variants
                    .flatMap((variant) => this.convertTypeShapeToHttpRequestBodyShape(variant.shape, newSeenVariants))
                    .filter(isNonNullish);
            case "discriminatedUnion":
                return shape.variants.map((variant) => ({
                    type: "object",
                    properties: variant.properties,
                    extends: variant.extends,
                    extraProperties: variant.extraProperties,
                }));
            default:
                new UnreachableCaseError(type);
                return undefined;
        }
    }

    convert(): FernRegistry.api.latest.HttpRequestBodyShape[] | undefined {
        switch (this.contentType) {
            case "json":
                return this.convertTypeShapeToHttpRequestBodyShape(this.schema?.convert());
            case "bytes":
                return [
                    {
                        type: "bytes",
                        isOptional: this.isOptional ?? false,
                        contentType: this.contentType,
                    },
                ];
            case "form-data":
                return [
                    {
                        type: "formData",
                        fields: Object.entries(this.fields ?? {})
                            .map(([key, field]) => {
                                switch (field.multipartType) {
                                    case "file":
                                        return {
                                            type: field.multipartType,
                                            key: FernRegistry.PropertyKey(key),
                                            isOptional: this.requiredFields?.includes(key) == null,
                                            contentType: field.contentType,
                                            description: field.description,
                                            availability: field.availability?.convert(),
                                        };
                                    case "files":
                                        return {
                                            type: field.multipartType,
                                            key: FernRegistry.PropertyKey(key),
                                            isOptional: this.requiredFields?.includes(key) == null,
                                            contentType: field.contentType,
                                            description: field.description,
                                            availability: field.availability?.convert(),
                                        };
                                    case "property": {
                                        const valueShape = field.convert();
                                        if (valueShape == null) {
                                            return undefined;
                                        }
                                        return {
                                            type: field.multipartType,
                                            key: FernRegistry.PropertyKey(key),
                                            contentType: field.contentType,
                                            valueShape,
                                            description: field.description,
                                            availability: field.availability?.convert(),
                                        };
                                    }
                                    case undefined:
                                        return undefined;
                                    default:
                                        new UnreachableCaseError(field.multipartType);
                                        return undefined;
                                }
                            })
                            .filter(isNonNullish),
                        availability: this.availability?.convert(),
                        description: this.description,
                    },
                ];
            case undefined:
                return this.convertTypeShapeToHttpRequestBodyShape(this.schema?.convert());
            default:
                return undefined;
        }
    }
}
