// This is not a real OAS type, it is used to encapsulate a large amount of logic

import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";
import { ConstArrayToType, SUPPORTED_MULTIPART_TYPES } from "../../../types/format.types";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";

export type MultipartType = ConstArrayToType<typeof SUPPORTED_MULTIPART_TYPES>;

export class MultipartFormDataPropertySchemaConverterNode extends SchemaConverterNode {
    multipartType: MultipartType | undefined;
    contentType: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SchemaObject>) {
        super(args);
        this.safeParse();
    }

    override parse(): void {
        super.parse();
        const propertyObject = isReferenceObject(this.input)
            ? resolveSchemaReference(this.input, this.context.document)
            : this.input;
        if (propertyObject.type === "string" && propertyObject.format === "binary") {
            this.multipartType = "file";
            this.contentType = propertyObject.contentMediaType;
        } else if (propertyObject.type === "array") {
            const items = isReferenceObject(propertyObject.items)
                ? resolveSchemaReference(propertyObject.items, this.context.document)
                : propertyObject.items;
            if (items?.type === "string" && items?.format === "binary") {
                this.multipartType = "files";
                this.contentType = items?.contentMediaType;
            } else {
                this.context.errors.warning({
                    message: `Expected multipart form data files definition with array type with internal string type and binary format. Received: ${JSON.stringify(propertyObject)}`,
                    path: this.accessPath,
                });
                this.multipartType = undefined;
                this.contentType = undefined;
            }
        } else {
            this.multipartType = "property";
            this.contentType = propertyObject.contentMediaType;
        }
    }
}
