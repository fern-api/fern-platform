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
import { isReferenceObject } from "../../guards/isReferenceObject";
import { SchemaConverterNode } from "../../schemas";
import { ReferenceConverterNode } from "../../schemas/ReferenceConverter.node";
import { GLOBAL_EXAMPLE_NAME } from "../ExampleObjectConverter.node";
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
  schema: ReferenceConverterNode | SchemaConverterNode | undefined;

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
  examples?:
    | Record<string, OpenAPIV3_1.ExampleObject | OpenAPIV3_1.ReferenceObject>
    | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject>,
    contentType: string | undefined
  ) {
    super(args);
    this.safeParse(contentType);
  }

  parse(contentType: string | undefined): void {
    // This sets examples derived from OpenAPI examples.
    // this.input.example is typed as any
    // this.input.examples is typed as Record<string, OpenAPIV3_1.ReferenceObject | OpenAPIV3.ExampleObject> | undefined
    // In order to create a consistent shape, we add a default string key for an example, which should be treated as a global example
    // If there is no global example, we try to generate an example from underlying schemas, which may have examples, or defaults or fallback values
    this.examples = {
      ...(this.input.example != null ||
      this.schema?.example({
        includeOptionals: true,
        override: undefined,
      }) != null
        ? {
            [GLOBAL_EXAMPLE_NAME]: {
              value:
                this.input.example ??
                this.schema?.example({
                  includeOptionals: true,
                  override: undefined,
                }),
            },
          }
        : {}),
      ...this.input.examples,
    };

    if (this.input.schema != null) {
      if (isReferenceObject(this.input.schema)) {
        this.resolvedSchema = resolveReference(
          this.input.schema,
          this.context.document,
          undefined
        );
        this.schema = new ReferenceConverterNode(
          {
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "schema",
            seenSchemas: new Set(),
          },
          false
        );
      } else {
        this.resolvedSchema = this.input.schema;
        const mediaType = MediaType.parse(contentType);
        // An exhaustive switch cannot be used here, because contentType is an unbounded string
        if (mediaType?.containsJSON()) {
          this.contentType = "json" as const;
          this.schema = new SchemaConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "schema",
            seenSchemas: new Set(),
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
                    seenSchemas: new Set(),
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
  }

  convert():
    | FernRegistry.api.latest.HttpRequestBodyShape
    | FernRegistry.api.latest.HttpRequestBodyShape[]
    | undefined {
    switch (this.contentType) {
      case "json": {
        const convertedJsonSchema = this.schema?.convert();
        if (convertedJsonSchema == null) {
          return undefined;
        }
        const convertedJsonSchemaArray =
          maybeSingleValueToArray(convertedJsonSchema);

        return convertedJsonSchemaArray
          ?.map((convertedJsonSchema) =>
            convertedJsonSchema.type === "object" ||
            convertedJsonSchema.type === "alias"
              ? convertedJsonSchema
              : undefined
          )
          .filter(isNonNullish);
      }
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
      case undefined: {
        const convertedJsonSchema = this.schema?.convert();
        if (convertedJsonSchema == null) {
          return undefined;
        }
        const convertedJsonSchemaArray =
          maybeSingleValueToArray(convertedJsonSchema);

        return convertedJsonSchemaArray
          ?.map((convertedJsonSchema) =>
            convertedJsonSchema.type === "object" ||
            convertedJsonSchema.type === "alias"
              ? convertedJsonSchema
              : undefined
          )
          .filter(isNonNullish);
      }
      default:
        return undefined;
    }
  }
}
