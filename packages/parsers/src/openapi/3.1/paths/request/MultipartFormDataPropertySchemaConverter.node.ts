// This is not a real OAS type, it is used to encapsulate a large amount of logic

import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";
import {
  ConstArrayToType,
  SUPPORTED_MULTIPART_TYPES,
} from "../../../types/format.types";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";

export type MultipartType = ConstArrayToType<typeof SUPPORTED_MULTIPART_TYPES>;

export class MultipartFormDataPropertySchemaConverterNode extends SchemaConverterNode {
  multipartType: MultipartType | undefined;
  contentType: string | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeWithTrackingConstructorArgs<OpenAPIV3_1.SchemaObject>
  ) {
    super(args);
    this.safeParse();
  }

  override parse(): void {
    super.parse();
    const propertyObject = resolveSchemaReference(
      this.input,
      this.context.document
    );
    if (propertyObject == null) {
      this.context.errors.error({
        message: `Expected multipart form data property definition. ${isReferenceObject(this.input) ? `Received undefined reference: ${this.input.$ref}` : ""}`,
        path: this.accessPath,
      });
      return;
    }
    if (
      propertyObject.type === "string" &&
      propertyObject.format === "binary"
    ) {
      this.multipartType = "file";
      this.contentType = propertyObject.contentMediaType;
    } else if (propertyObject.type === "array") {
      const items = resolveSchemaReference(
        propertyObject.items,
        this.context.document
      );
      if (items?.type === "string" && items?.format === "binary") {
        this.multipartType = "files";
        this.contentType = items?.contentMediaType;
      } else {
        this.context.errors.warning({
          message:
            "Expected multipart form data files definition with array type with internal string type and binary format.",
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
