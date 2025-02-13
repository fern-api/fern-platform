import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { HttpMethod } from "../../constants";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { resolveParameterReference } from "../../utils/3.1/resolveParameterReference";
import { getEndpointId } from "../../utils/getEndpointId";
import { getExampleName } from "../../utils/getExampleName";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { mergeSnippets } from "../../utils/mergeSnippets";
import { mergeXFernAndResponseExamples } from "../../utils/mergeXFernAndResponsesExamples";
import { SecurityRequirementObjectConverterNode } from "../auth/SecurityRequirementObjectConverter.node";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { XFernEndpointExampleConverterNode } from "../extensions/XFernEndpointExampleConverter.node";
import { XFernGroupNameConverterNode } from "../extensions/XFernGroupNameConverter.node";
import { XFernSdkMethodNameConverterNode } from "../extensions/XFernSdkMethodNameConverter.node";
import { XFernWebhookConverterNode } from "../extensions/XFernWebhookConverter.node";
import { RedocExampleConverterNode } from "../extensions/examples/RedocExampleConverter.node";
import { X_FERN_GROUP_NAME } from "../extensions/fernExtension.consts";
import { isReferenceObject } from "../guards/isReferenceObject";
import { ExampleObjectConverterNode } from "./ExampleObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";
import {
  ParameterBaseObjectConverterNode,
  convertOperationObjectProperties,
} from "./parameters/ParameterBaseObjectConverter.node";
import { RequestBodyObjectConverterNode } from "./request/RequestBodyObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "./request/RequestMediaTypeObjectConverter.node";
import { ResponsesObjectConverterNode } from "./response/ResponsesObjectConverter.node";

export class OperationObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.OperationObject,
  | FernRegistry.api.latest.EndpointDefinition[]
  | FernRegistry.api.latest.WebhookDefinition[]
> {
  endpointIds: string[] | undefined;
  description: string | undefined;
  displayName: string | undefined;
  operationId: string | undefined;
  pathParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
  queryParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
  requestHeaders: Record<string, ParameterBaseObjectConverterNode> | undefined;
  requests: RequestBodyObjectConverterNode | undefined;
  responses: ResponsesObjectConverterNode | undefined;
  availability: AvailabilityConverterNode | undefined;
  auth: SecurityRequirementObjectConverterNode | undefined;
  namespaces: XFernGroupNameConverterNode[] | undefined;
  xFernExamplesNode: XFernEndpointExampleConverterNode | undefined;
  redocExamplesNode: RedocExampleConverterNode | undefined;
  emptyResponseExamples: ExampleObjectConverterNode[] | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.OperationObject>,
    protected servers: ServerObjectConverterNode[] | undefined,
    protected globalAuth: SecurityRequirementObjectConverterNode | undefined,
    protected path: string,
    protected method: HttpMethod,
    protected basePath: XFernBasePathConverterNode | undefined,
    protected isWebhook?: boolean
  ) {
    super(args);
    this.safeParse();
  }

  pushEmptyResponseExample(
    requestExample:
      | OpenAPIV3_1.ReferenceObject
      | OpenAPIV3_1.ExampleObject
      | undefined,
    requestBody: RequestMediaTypeObjectConverterNode | undefined,
    requestExampleName: string | undefined
  ) {
    this.emptyResponseExamples ??= [];
    this.emptyResponseExamples.push(
      new ExampleObjectConverterNode(
        {
          input: {
            requestExample: requestExample,
            responseExample: undefined,
          },
          context: this.context,
          accessPath: this.accessPath,
          pathId: "examples",
        },
        this.path,
        // Since there is no response, we can use any status code, so we use 200
        200,
        getExampleName(requestExampleName, undefined),
        {
          requestBody,
          pathParameters: this.pathParameters,
          queryParameters: this.queryParameters,
          requestHeaders: this.requestHeaders,
        }
      )
    );
  }

  parse(): void {
    if (this.isWebhook && this.method !== "POST" && this.method !== "GET") {
      this.context.errors.error({
        message: `Webhook method must be POST or GET. Received: ${this.method}`,
        path: this.accessPath,
      });
      return;
    }

    this.description = this.input.description;
    this.displayName = this.input.summary;
    this.operationId = this.input.operationId;

    this.availability = new AvailabilityConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-availability",
    });
    this.servers = coalesceServers(
      this.servers,
      this.input.servers,
      this.context,
      this.accessPath
    );

    this.isWebhook =
      new XFernWebhookConverterNode({
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: this.pathId,
      }).isWebhook || this.isWebhook;

    this.input.parameters?.map((parameter, index) => {
      if (isReferenceObject(parameter)) {
        const resolvedParameter = resolveParameterReference(
          parameter,
          this.context.document
        );
        if (resolvedParameter != null) {
          parameter = resolvedParameter;
        } else {
          this.context.errors.warning({
            message: `Expected parameter reference to resolve to an object. Received undefined reference: ${parameter.$ref}`,
            path: [...this.accessPath, `parameters[${index}]`],
          });
          return undefined;
        }
      }
      if (parameter.in === "path") {
        if (parameter.schema != null) {
          this.pathParameters ??= {};
          this.pathParameters[parameter.name] =
            new ParameterBaseObjectConverterNode({
              input: parameter,
              context: this.context,
              accessPath: this.accessPath,
              pathId: ["parameters", `${index}`],
            });
        }
        // this.pathParameters.push(parameter.name);
      } else if (parameter.in === "query") {
        if (parameter.schema != null) {
          this.queryParameters ??= {};
          this.queryParameters[parameter.name] =
            new ParameterBaseObjectConverterNode({
              input: parameter,
              context: this.context,
              accessPath: this.accessPath,
              pathId: ["parameters", `${index}`],
            });
        }
      } else if (parameter.in === "header") {
        if (parameter.schema != null) {
          this.requestHeaders ??= {};
          this.requestHeaders[parameter.name] =
            new ParameterBaseObjectConverterNode({
              input: parameter,
              context: this.context,
              accessPath: this.accessPath,
              pathId: ["parameters", `${index}`],
            });
        }
      }
    });

    for (const pathParameterId of this.extractPathParameterIds() ?? []) {
      if (this.pathParameters?.[pathParameterId] == null) {
        this.context.errors.warning({
          message: `Path parameter not defined: ${pathParameterId}`,
          path: [...this.accessPath, "parameters"],
        });
      }
    }

    this.redocExamplesNode = new RedocExampleConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-code-samples",
    });

    this.requests =
      this.input.requestBody != null
        ? new RequestBodyObjectConverterNode(
            {
              input: this.input.requestBody,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "requestBody",
            },
            this.method,
            this.path
          )
        : undefined;

    this.responses =
      this.input.responses != null
        ? new ResponsesObjectConverterNode(
            {
              input: this.input.responses,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "responses",
            },
            this.path,
            this.method,
            Object.values(this.requests?.requestBodiesByContentType ?? {}),
            {
              pathParameters: this.pathParameters,
              queryParameters: this.queryParameters,
              requestHeaders: this.requestHeaders,
            }
          )
        : undefined;

    if (this.responses == null) {
      const requestBodiesByContent = this.requests?.requestBodiesByContentType;
      if (
        requestBodiesByContent == null ||
        Object.keys(requestBodiesByContent).length === 0
      ) {
        // Push an example
        this.pushEmptyResponseExample(undefined, undefined, undefined);
      } else {
        Object.values(requestBodiesByContent).forEach((requestBody) => {
          if (Object.keys(requestBody.examples ?? {}).length === 0) {
            const example = requestBody.schema?.example({
              includeOptionals: false,
              override: undefined,
            });

            if (example != null) {
              this.pushEmptyResponseExample(
                { value: example },
                requestBody,
                undefined
              );
            }
          } else {
            Object.entries(requestBody.examples ?? {}).forEach(
              ([requestExampleName, requestExample]) => {
                this.pushEmptyResponseExample(
                  requestExample,
                  requestBody,
                  requestExampleName
                );
              }
            );
          }
        });
      }
    }

    // TODO: pass appropriate status codes for examples
    let responseStatusCode = 200;
    if (this.responses?.responsesByStatusCode != null) {
      responseStatusCode = Number(
        Object.keys(this.responses.responsesByStatusCode)?.filter(
          (statusCode) => Number(statusCode) >= 200 && Number(statusCode) < 300
        )[0]
      );
    }

    if (this.globalAuth != null) {
      this.auth = this.globalAuth;
    }

    if (this.input.security != null) {
      this.auth = new SecurityRequirementObjectConverterNode({
        input: this.input.security,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "security",
      });
    }

    this.namespaces = [
      new XFernGroupNameConverterNode({
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "x-fern-group-name",
      }),
    ];

    if (
      this.namespaces?.every((namespace) => namespace.groupName == null) &&
      this.input.tags != null
    ) {
      // TODO: review if tags multiplex endpoint definitions, or if there should
      // be some cascading behavior
      this.namespaces = this.input.tags.slice(0, 1).map((tag, index) => {
        const newNamespaceNode = new XFernGroupNameConverterNode({
          input: { [X_FERN_GROUP_NAME]: tag },
          context: this.context,
          accessPath: this.accessPath,
          pathId: ["tags", `${index}`],
        });
        return newNamespaceNode;
      });
    }

    const sdkMethodName = new XFernSdkMethodNameConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-sdk-method-name",
    });

    this.endpointIds = this.namespaces
      .map((namespace) =>
        getEndpointId(
          maybeSingleValueToArray(namespace?.groupName),
          this.path,
          this.method,
          sdkMethodName.sdkMethodName,
          this.input.operationId,
          this.isWebhook
        )
      )
      .filter(isNonNullish);

    // TODO: figure out how to merge user specified examples with success response
    this.xFernExamplesNode = new XFernEndpointExampleConverterNode(
      {
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "x-fern-examples",
      },
      this.path,
      responseStatusCode,
      this.requests?.requestBodiesByContentType,
      this.responses?.responsesByStatusCode?.[responseStatusCode]?.responses
    );
  }

  extractPathParameterIds(): string[] | undefined {
    if (this.path == null) {
      return undefined;
    }

    return this.path
      .split("/")
      .map((part) => {
        if (part.startsWith("{") && part.endsWith("}")) {
          return part.slice(1, -1).trim();
        }
        return undefined;
      })
      .filter(isNonNullish);
  }

  convertPathToPathParts(): FernRegistry.api.latest.PathPart[] | undefined {
    if (this.path === undefined) {
      return undefined;
    }

    const path = this.path.startsWith("/") ? this.path.slice(1) : this.path;
    const basePath = this.basePath?.convert();
    const pathParts = basePath
      ? [basePath, ...path.split("/")]
      : path.split("/");

    return pathParts.reduce<FernRegistry.api.latest.PathPart[]>((acc, part) => {
      acc.push({
        type: "literal" as const,
        value: "/",
      });

      if (part.startsWith("{") && part.endsWith("}")) {
        acc.push({
          type: "pathParameter" as const,
          value: FernRegistry.PropertyKey(part.slice(1, -1).trim()),
        });
      } else {
        acc.push({
          type: "literal" as const,
          value: part,
        });
      }

      return acc;
    }, []);
  }

  convert():
    | FernRegistry.api.latest.EndpointDefinition[]
    | FernRegistry.api.latest.WebhookDefinition[]
    | undefined {
    if (this.path == null) {
      return undefined;
    }

    if (this.endpointIds == null) {
      return undefined;
    }

    const { responses, errors } = this.responses?.convert() ?? {
      responses: undefined,
      errors: undefined,
    };

    const emptyResponseExamples = this.emptyResponseExamples
      ?.map((example) => example.convert())
      .filter(isNonNullish);

    const examples = mergeXFernAndResponseExamples(
      this.xFernExamplesNode?.convert(),
      [
        ...(emptyResponseExamples ?? []),
        ...(responses?.flatMap((response) => response.examples) ?? []),
      ]
    )?.map((example) => {
      return {
        ...example,
        snippets: mergeSnippets(
          example.snippets,
          this.redocExamplesNode?.convert()
        ),
      };
    });

    if (this.isWebhook) {
      return this.endpointIds
        .map((endpointId, index) => {
          if (this.method !== "POST" && this.method !== "GET") {
            return undefined;
          }
          return {
            id: FernRegistry.WebhookId(endpointId),
            description: this.description,
            availability: this.availability?.convert(),
            displayName: this.displayName,
            operationId: this.operationId,
            namespace: this.namespaces?.[index]?.convert(),
            method: this.method,
            path:
              this.convertPathToPathParts()?.map((part) =>
                part.value.toString()
              ) ?? [],
            queryParameters: convertOperationObjectProperties(
              this.queryParameters
            )?.flat(),
            headers: convertOperationObjectProperties(
              this.requestHeaders
            )?.flat(),
            payloads: this.requests?.convertToWebhookPayload(),
            examples: [this.requests?.webhookExample()].filter(isNonNullish),
          };
        })
        .filter(isNonNullish);
    }

    const environments = this.servers
      ?.map((server) => server.convert())
      .filter(isNonNullish);
    const pathParts = this.convertPathToPathParts();
    if (pathParts == null) {
      return undefined;
    }

    let authIds: string[] | undefined;
    const auth = this.auth?.convert();
    if (auth != null) {
      authIds = Object.keys(auth);
    }

    const responseHeaders = responses
      ?.flatMap((response) => response.headers)
      .filter(isNonNullish);

    return this.endpointIds.map((endpointId, index) => ({
      id: FernRegistry.EndpointId(endpointId),
      description: this.description,
      availability: this.availability?.convert(),
      namespace: this.namespaces?.[index]
        ?.convert()
        ?.map((id) => FernRegistry.api.v1.SubpackageId(`subpackage_${id}`)),
      displayName: this.displayName,
      operationId: this.operationId,
      method: this.method,
      path: pathParts,
      auth: authIds?.map((id) => FernRegistry.api.latest.AuthSchemeId(id)),
      defaultEnvironment: environments?.[0]?.id,
      environments,
      pathParameters: convertOperationObjectProperties(
        this.pathParameters
      )?.flat(),
      queryParameters: convertOperationObjectProperties(
        this.queryParameters
      )?.flat(),
      requestHeaders: convertOperationObjectProperties(
        this.requestHeaders
      )?.flat(),
      responseHeaders:
        responseHeaders != null && responseHeaders.length > 0
          ? responseHeaders
          : undefined,
      requests: this.requests?.convert(),
      responses: responses?.map((response) => response.response),
      errors,
      examples,
      snippetTemplates: undefined,
      protocol: {
        type: "rest",
      },
    }));
  }
}
