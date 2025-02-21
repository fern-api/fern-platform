import { isNonNullish } from "@fern-api/ui-core-utils";
import { camelCase } from "es-toolkit/compat";
import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../../../client/generated";
import { HttpMethod } from "../../../../client/generated/api";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import {
  ConstArrayToType,
  SUPPORTED_REQUEST_CONTENT_TYPES,
} from "../../../types/format.types";
import { resolveSchemaReference } from "../../../utils/3.1/resolveSchemaReference";
import { createTypeDefinition } from "../../../utils/createTypeDefinition";
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
  method: HttpMethod;
  path: string;

  // application/json
  schema: ReferenceConverterNode | SchemaConverterNode | undefined;

  // application/octet-stream
  isOptional: boolean | undefined;
  contentType: string | undefined;
  contentTypeShorthand: RequestContentType | undefined;

  // multipart/form-data
  availability: AvailabilityConverterNode | undefined;
  requiredFields: string[] | undefined;
  fields:
    | Record<string, MultipartFormDataPropertySchemaConverterNode>
    | undefined;

  examples?:
    | Record<string, OpenAPIV3_1.ExampleObject | OpenAPIV3_1.ReferenceObject>
    | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.MediaTypeObject> & {
      contentType: string | undefined;
      method: HttpMethod;
      path: string;
    }
  ) {
    super(args);
    this.method = args.method;
    this.path = args.path;
    this.contentType = args.contentType;
    this.safeParse(args);
  }

  parse({ contentType }: { contentType: string | undefined }): void {
    if (this.input.schema != null) {
      const resolvedSchema = resolveSchemaReference(
        this.input.schema,
        this.context.document
      );
      this.availability = new AvailabilityConverterNode({
        input: this.input.schema,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "availability",
      });

      this.schema = isReferenceObject(this.input.schema)
        ? new ReferenceConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "schema",
            seenSchemas: new Set(),
            nullable: false,
            schemaName: "Request Body",
            description: this.input.schema.description,
            availability: this.availability,
          })
        : undefined;

      const mediaType = MediaType.parse(contentType);
      // An exhaustive switch cannot be used here, because contentType is an unbounded string
      if (mediaType?.containsJSON()) {
        this.contentTypeShorthand = "json" as const;
        this.schema =
          this.schema ??
          new SchemaConverterNode({
            input: this.input.schema,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "schema",
            seenSchemas: new Set(),
            nullable: undefined,
            schemaName: "Request Body",
          });
      } else if (mediaType?.isOctetStream()) {
        this.contentTypeShorthand = "bytes" as const;
        this.isOptional = resolvedSchema?.required == null;
      } else if (mediaType?.isMultiPartFormData()) {
        this.contentTypeShorthand = "form-data" as const;
        this.requiredFields = resolvedSchema?.required;
        this.fields = Object.fromEntries(
          Object.entries(resolvedSchema?.properties ?? {})
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
                  nullable: undefined,
                  schemaName: key,
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

    // This sets examples derived from OpenAPI examples.
    // this.input.example is typed as any
    // this.input.examples is typed as Record<string, OpenAPIV3_1.ReferenceObject | OpenAPIV3.ExampleObject> | undefined
    // In order to create a consistent shape, we add a default string key for an example, which should be treated as a global example
    // If there is no global example, we try to generate an example from underlying schemas, which may have examples, or defaults or fallback values
    const generatedExample = this.schema?.example({
      includeOptionals: true,
      override: undefined,
    });

    this.examples = {
      ...(this.input.example != null
        ? {
            [GLOBAL_EXAMPLE_NAME]: {
              value: this.input.example,
            },
          }
        : {}),
      ...this.input.examples,
    };

    if (generatedExample != null && Object.keys(this.examples).length === 0) {
      this.examples = {
        [GLOBAL_EXAMPLE_NAME]: {
          value: generatedExample,
        },
      };
    }
  }

  convertJsonLike():
    | FernRegistry.api.latest.HttpRequestBodyShape
    | FernRegistry.api.latest.HttpRequestBodyShape[]
    | undefined {
    const convertedJsonSchema = this.schema?.convert();
    if (convertedJsonSchema == null) {
      return undefined;
    }
    const convertedJsonSchemaArray =
      maybeSingleValueToArray(convertedJsonSchema);

    return convertedJsonSchemaArray
      ?.map((convertedJsonSchema) => {
        const type = convertedJsonSchema.type;
        switch (type) {
          case "object":
          case "alias":
            return convertedJsonSchema;
          case "enum":
          case "undiscriminatedUnion":
          case "discriminatedUnion": {
            const uniqueId = camelCase(
              [
                this.method,
                this.path,
                this.contentTypeShorthand,
                "request",
              ].join("_")
            );
            createTypeDefinition({
              uniqueId,
              type: convertedJsonSchema,
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
                  convertedJsonSchema.type === "enum" &&
                  convertedJsonSchema.default != null
                    ? {
                        type: "enum" as const,
                        value: convertedJsonSchema.default,
                      }
                    : undefined,
              },
            };
          }
          case undefined:
            return undefined;
          default:
            new UnreachableCaseError(type);
            return undefined;
        }
      })
      .filter(isNonNullish);
  }

  convert():
    | FernRegistry.api.latest.HttpRequestBodyShape
    | FernRegistry.api.latest.HttpRequestBodyShape[]
    | undefined {
    if (this.schema instanceof ReferenceConverterNode) {
      return this.schema.convert();
    }
    switch (this.contentTypeShorthand) {
      case "json": {
        return this.convertJsonLike();
      }
      case "bytes":
        return {
          type: "bytes",
          isOptional: this.isOptional ?? false,
          contentType: this.contentTypeShorthand,
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
                    exploded: undefined,
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
        return this.convertJsonLike();
      }
      default:
        return undefined;
    }
  }
}
