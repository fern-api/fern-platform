import { isNonNullish } from "@fern-api/ui-core-utils";
import { MethodObject } from "@open-rpc/meta-schema";
import { UnreachableCaseError } from "ts-essentials";
import { FernRegistry } from "../../client/generated";
import { generateExampleForJsonSchema } from "../../examples/generateExampleForJsonSchema";
import { SchemaConverterNode, ServerObjectConverterNode } from "../../openapi";
import { maybeSingleValueToArray } from "../../openapi/utils/maybeSingleValueToArray";
import {
  BaseOpenrpcConverterNode,
  BaseOpenrpcConverterNodeConstructorArgs,
} from "../BaseOpenrpcConverter.node";
import { resolveContentDescriptorObject } from "../utils/resolveContentDescriptorObject";
import { resolveExample } from "../utils/resolveExample";
import { resolveExamplePairingOrReference } from "../utils/resolveExamplePairing";
import { resolveTag } from "../utils/resolveTags";

const API_KEY_PATH_PARAMETER: FernRegistry.api.latest.ObjectProperty = {
  key: FernRegistry.PropertyKey("apiKey"),
  description: undefined,
  availability: undefined,
  valueShape: {
    type: "alias",
    value: {
      type: "primitive",
      value: {
        type: "string",
        format: undefined,
        regex: undefined,
        minLength: undefined,
        maxLength: undefined,
        default: undefined,
      },
    },
  },
};

export class MethodConverterNode extends BaseOpenrpcConverterNode<
  MethodObject,
  FernRegistry.api.latest.EndpointDefinition
> {
  private method: MethodObject;
  private servers: ServerObjectConverterNode[] = [];

  constructor(
    args: BaseOpenrpcConverterNodeConstructorArgs<MethodObject>,
    servers: ServerObjectConverterNode[]
  ) {
    super(args);
    this.method = args.input;
    this.servers = servers;
    this.safeParse();
  }

  parse(): void {
    // Parse method object
  }

  convert(): FernRegistry.api.latest.EndpointDefinition | undefined {
    try {
      const resolvedResult = this.method.result
        ? resolveContentDescriptorObject(
            this.method.result,
            this.context.openrpc
          )
        : undefined;

      const response = resolvedResult
        ? new SchemaConverterNode({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            input: resolvedResult.schema as any,
            context: this.context,
            accessPath: this.accessPath,
            pathId: "result",
            seenSchemas: new Set(),
          }).convert()
        : undefined;

      const resolvedParams = this.method.params
        ?.map((param) =>
          resolveContentDescriptorObject(param, this.context.openrpc)
        )
        .filter(isNonNullish);

      const requestParameters: FernRegistry.api.latest.ObjectProperty[] =
        resolvedParams
          ?.map((param): FernRegistry.api.latest.ObjectProperty | undefined => {
            const schema = new SchemaConverterNode({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              input: param.schema as any,
              context: this.context,
              accessPath: this.accessPath,
              pathId: ["params", param.name],
              seenSchemas: new Set(),
            }).convert();

            if (!schema) return undefined;

            const valueShape = Array.isArray(schema) ? schema[0] : schema;
            if (!valueShape) {
              return undefined;
            }

            return {
              key: FernRegistry.PropertyKey(param.name),
              valueShape: !param.required
                ? {
                    type: "alias",
                    value: {
                      type: "optional",
                      shape: valueShape,
                      default: undefined,
                    },
                  }
                : valueShape,
              description: param.description,
              availability: undefined,
            };
          })
          .filter(isNonNullish);

      const request: FernRegistry.api.latest.HttpRequest | undefined =
        requestParameters.length > 0
          ? {
              contentType: "application/json",
              body: {
                type: "object",
                extends: [],
                properties: requestParameters,
                extraProperties: undefined,
              },
              description: undefined,
            }
          : undefined;

      const examples =
        this.method.examples
          ?.map(
            (
              example
            ): FernRegistry.api.latest.ExampleEndpointCall | undefined => {
              const resolvedExample = resolveExamplePairingOrReference(
                example,
                this.context.openrpc
              );
              if (!resolvedExample) return undefined;
              return {
                name: resolvedExample.name ?? "Example",
                path: "",
                description: undefined,
                snippets: undefined,
                pathParameters: {},
                queryParameters: {},
                headers: {},
                requestBody:
                  resolvedExample.params.length > 0
                    ? {
                        type: "json",
                        value: Object.fromEntries(
                          resolvedExample.params
                            .map((param) => {
                              const resolvedParam = resolveExample(
                                param,
                                this.context.openrpc
                              );
                              if (!resolvedParam) return undefined;
                              return [
                                resolvedParam.name ?? "",
                                resolvedParam.value,
                              ];
                            })
                            .filter(isNonNullish)
                        ),
                      }
                    : undefined,
                responseStatusCode: 200,
                responseBody: resolvedExample.result
                  ? { type: "json", value: resolvedExample.result }
                  : undefined,
              };
            }
          )
          .filter(isNonNullish) ?? [];

      if (examples.length <= 0) {
        const requestBody = generateExampleForJsonSchema({
          type: "object",
          properties: Object.fromEntries(
            this.method.params?.map((param) => {
              const resolvedParam = resolveContentDescriptorObject(
                param,
                this.context.openrpc
              );
              return [resolvedParam?.name ?? "", resolvedParam?.schema ?? {}];
            }) ?? []
          ),
        });
        const example = {
          name: "Example",
          path: "",
          pathParameters: {},
          queryParameters: {},
          headers: {},
          requestBody: {
            type: "json" as const,
            value: {
              id: 1,
              jsonrpc: "2.0",
              method: this.method.name,
              params: requestBody,
            },
          },
          responseStatusCode: 200,
          responseBody: {
            type: "json" as const,
            value: generateExampleForJsonSchema(
              resolveContentDescriptorObject(
                this.method.result,
                this.context.openrpc
              )?.schema ?? {}
            ),
          },
          snippets: undefined,
          description: undefined,
        };
        examples.push(example);
      }

      // Convert method to HTTP endpoint
      // This is a basic implementation that needs to be expanded
      return {
        protocol: {
          type: "openrpc",
          methodName: this.input.name,
        },
        id: FernRegistry.EndpointId(this.input.name),
        displayName: this.input.name,
        method: "POST",
        path: [
          { type: "pathParameter", value: FernRegistry.PropertyKey("apiKey") },
        ],
        auth: undefined,
        pathParameters: [API_KEY_PATH_PARAMETER],
        queryParameters: [],
        requests: request != null ? [request] : undefined,
        responses:
          response != null
            ? [
                this.convertToHttpResponse(response, this.input.description),
              ].filter(isNonNullish)
            : [],
        errors: [],
        examples,
        description: this.input.description ?? this.input.summary,
        operationId: this.input.name,
        defaultEnvironment: undefined,
        environments: this.servers
          .map((server) => server.convert())
          .filter(isNonNullish),
        availability: this.method.deprecated ? "Deprecated" : undefined,
        requestHeaders: [],
        responseHeaders: [],
        snippetTemplates: undefined,
        // use the first tag as the namespace
        namespace: this.getNamespace(),
      };
    } catch (_error) {
      this.context.errors.error({
        message: "Failed to convert method",
        path: this.accessPath,
      });
      return undefined;
    }
  }

  private getNamespace(): FernRegistry.api.v1.SubpackageId[] | undefined {
    if (this.method.tags?.[0] == null) {
      return undefined;
    }
    const resolvedTag = resolveTag(this.method.tags[0], this.context.openrpc);
    if (resolvedTag?.name == null) {
      return undefined;
    }
    return [FernRegistry.api.v1.SubpackageId(resolvedTag.name)];
  }

  private convertToHttpResponse(
    shape:
      | FernRegistry.api.latest.TypeShape
      | FernRegistry.api.latest.TypeShape[],
    description?: string
  ): FernRegistry.api.latest.HttpResponse | undefined {
    if (shape == null) {
      return undefined;
    }
    const maybeShapes = maybeSingleValueToArray(shape);
    const validShape = maybeShapes
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
      .filter(isNonNullish)[0];

    if (!validShape) {
      return undefined;
    }

    return {
      statusCode: 200,
      body: validShape,
      description,
    };
  }
}
