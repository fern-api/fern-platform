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
  SUPPORTED_REQUEST_CONTENT_TYPES,
} from "../../../types/format.types";
import { resolveReference } from "../../../utils/3.1/resolveReference";
import { maybeSingleValueToArray } from "../../../utils/maybeSingleValueToArray";
import { MediaType } from "../../../utils/MediaType";
import { AvailabilityConverterNode } from "../../extensions/AvailabilityConverter.node";
import { isObjectSchema } from "../../guards/isObjectSchema";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { ObjectConverterNode } from "../../schemas/ObjectConverter.node";
import { ReferenceConverterNode } from "../../schemas/ReferenceConverter.node";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";
import { MultipartFormDataPropertySchemaConverterNode } from "./MultipartFormDataPropertySchemaConverter.node";

export type RequestContentType = ConstArrayToType<
  typeof SUPPORTED_REQUEST_CONTENT_TYPES
>;

export class RequestMediaTypeObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.MediaTypeObject,
  | FernRegistry.api.latest.HttpRequestBodyShape
  | FernRegistry.api.latest.HttpRequestBodyShape[]
> {
  description: string | undefined;

  // application/json
  schema: ReferenceConverterNode | ObjectConverterNode | undefined;

  // application/octet-stream
  isOptional: boolean | undefined;
  contentType: RequestContentType | undefined;

  // multipart/form-data
  availability: AvailabilityConverterNode | undefined;
  requiredFields: string[] | undefined;
  fields:
    | Record<string, MultipartFormDataPropertySchemaConverterNode>
    | undefined;

  resolvedSchema: OpenAPIV3_1.SchemaObject | undefined;
  example: ExampleObjectConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
    contentType: string | undefined,
    protected path: string,
    protected responseStatusCode: number
  ) {
    super(args);
    this.safeParse(contentType);
  }

  parse(contentType: string | undefined): void {
    if (this.input.schema != null) {
      if (isReferenceObject(this.input.schema)) {
        this.resolvedSchema = resolveReference(
          this.input.schema,
          this.context.document,
          undefined
        );
        this.schema = new ReferenceConverterNode({
          input: this.input.schema,
          context: this.context,
          accessPath: this.accessPath,
          pathId: "schema",
        });
      } else if (isObjectSchema(this.input.schema)) {
        this.resolvedSchema = this.input.schema;
        const mediaType = MediaType.parse(contentType);
        // An exhaustive switch cannot be used here, because contentType is an unbounded string
        if (mediaType?.containsJSON()) {
          this.contentType = "json" as const;
          this.schema = new ObjectConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "schema",
          });
        } else if (mediaType?.isOctetStream()) {
          this.contentType = "bytes" as const;
          this.isOptional = this.input.schema.required == null;
        } else if (mediaType?.isMultiPartFormData()) {
          this.contentType = "form-data" as const;
          this.description = this.input.schema.description;
          this.availability = new AvailabilityConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "availability",
          });
          this.requiredFields = this.input.schema.required;
          this.fields = Object.fromEntries(
            Object.entries(this.input.schema?.properties ?? {})
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
              .filter(isNonNullish)
          );
        } else {
          this.context.errors.warning({
            message: `Expected request body of reference or object with json, streaming or form-data content types. Received: ${contentType}`,
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

    if (this.contentType != null) {
      if (this.input.example != null) {
        // this.example = new ExampleObjectConverterNode(
        //     {
        //         input: this.input.example,
        //         context: this.context,
        //         accessPath: this.accessPath,
        //         pathId: "example",
        //     },
        //     this.path,
        //     this.responseStatusCode,
        //     this,
        // );
      }
    }
  }

  convert():
    | FernRegistry.api.latest.HttpRequestBodyShape
    | FernRegistry.api.latest.HttpRequestBodyShape[]
    | undefined {
    switch (this.contentType) {
      case "json":
        return this.schema?.convert();
      case "bytes":
        return {
          type: "bytes",
          isOptional: this.isOptional ?? false,
          contentType: this.contentType,
        };
      case "form-data": {
        const possibleFields: FernRegistry.api.latest.FormDataField[][] =
          Object.entries(this.fields ?? {})
            .map(([key, field]) => {
              switch (field.multipartType) {
                case "file":
                  return [
                    {
                      type: field.multipartType,
                      key: FernRegistry.PropertyKey(key),
                      isOptional: this.requiredFields?.includes(key) == null,
                      contentType: field.contentType,
                      description: field.description,
                      availability: field.availability?.convert(),
                    },
                  ];
                case "files":
                  return [
                    {
                      type: field.multipartType,
                      key: FernRegistry.PropertyKey(key),
                      isOptional: this.requiredFields?.includes(key) == null,
                      contentType: field.contentType,
                      description: field.description,
                      availability: field.availability?.convert(),
                    },
                  ];
                case "property": {
                  const maybeValueShapes = maybeSingleValueToArray(
                    field.convert()
                  );
                  const type = field.multipartType;

                  return maybeValueShapes?.map((valueShape) => ({
                    type,
                    key: FernRegistry.PropertyKey(key),
                    contentType: field.contentType,
                    valueShape,
                    description: field.description,
                    availability: field.availability?.convert(),
                  }));
                }
                case undefined:
                  return [];
                default:
                  new UnreachableCaseError(field.multipartType);
                  return [];
              }
            })
            .filter(isNonNullish);
        const fieldPermutations = possibleFields.reduce<
          FernRegistry.api.latest.FormDataField[][]
        >(
          (acc, curr) => {
            return acc.flatMap((a) =>
              curr.length > 0 ? curr.map((b) => [...a, b]) : [[...a]]
            );
          },
          [[]]
        );
        return fieldPermutations.map((fields) => ({
          type: "formData",
          fields,
          availability: this.availability?.convert(),
          description: this.description,
        }));
      }
      case undefined:
        return this.schema?.convert();
      default:
        return undefined;
    }
  }
}
