import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { resolveParameterReference } from "../../utils/3.1/resolveParameterReference";
import { getEndpointId } from "../../utils/getEndpointId";
import { SecurityRequirementObjectConverterNode } from "../auth/SecurityRequirementObjectConverter.node";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { XFernEndpointExampleConverterNode } from "../extensions/XFernEndpointExampleConverter.node";
import { XFernGroupNameConverterNode } from "../extensions/XFernGroupNameConverter.node";
import { XFernSdkMethodNameConverterNode } from "../extensions/XFernSdkMethodNameConverter.node";
import { RedocExampleConverterNode } from "../extensions/examples/RedocExampleConverter.node";
import { isReferenceObject } from "../guards/isReferenceObject";
import { ExampleObjectConverterNode } from "./ExampleObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";
import {
  ParameterBaseObjectConverterNode,
  convertOperationObjectProperties,
} from "./parameters/ParameterBaseObjectConverter.node";
import { RequestBodyObjectConverterNode } from "./request/RequestBodyObjectConverter.node";
import { ResponsesObjectConverterNode } from "./response/ResponsesObjectConverter.node";

export class OperationObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.OperationObject,
  | FernRegistry.api.latest.EndpointDefinition
  | FernRegistry.api.latest.WebhookDefinition
> {
  endpointId: string | undefined;
  description: string | undefined;
  pathParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
  queryParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
  requestHeaders: Record<string, ParameterBaseObjectConverterNode> | undefined;
  requests: RequestBodyObjectConverterNode | undefined;
  responses: ResponsesObjectConverterNode | undefined;
  availability: AvailabilityConverterNode | undefined;
  auth: SecurityRequirementObjectConverterNode | undefined;
  namespace: XFernGroupNameConverterNode | undefined;
  xFernExamplesNode: XFernEndpointExampleConverterNode | undefined;
  emptyExample: ExampleObjectConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.OperationObject>,
    protected servers: ServerObjectConverterNode[] | undefined,
    protected globalAuth: SecurityRequirementObjectConverterNode | undefined,
    protected path: string,
    protected method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    protected basePath: XFernBasePathConverterNode | undefined,
    protected isWebhook?: boolean
  ) {
    super(args);
    this.safeParse();
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
              pathId: `parameters[${index}]`,
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
              pathId: `parameters[${index}]`,
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
              pathId: `parameters[${index}]`,
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

    const redocExamplesNode = new RedocExampleConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-code-samples",
    });

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
            redocExamplesNode
          )
        : undefined;

    this.emptyExample =
      redocExamplesNode.codeSamples != null &&
      redocExamplesNode.codeSamples.length > 0
        ? new ExampleObjectConverterNode(
            {
              input: undefined,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "example",
            },
            this.path,
            200,
            undefined,
            undefined,
            undefined,
            redocExamplesNode
          )
        : undefined;

    // TODO: pass appropriate status codes for examples
    let responseStatusCode = 200;
    if (this.responses?.responsesByStatusCode != null) {
      responseStatusCode = Number(
        Object.keys(this.responses.responsesByStatusCode)?.filter(
          (statusCode) => Number(statusCode) >= 200 && Number(statusCode) < 300
        )[0]
      );
    }

    this.requests =
      this.input.requestBody != null
        ? new RequestBodyObjectConverterNode(
            {
              input: this.input.requestBody,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "requestBody",
            },
            this.path,
            responseStatusCode
          )
        : undefined;

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

    this.namespace = new XFernGroupNameConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-group-name",
    });

    if (this.namespace?.groupName == null && this.input.tags != null) {
      this.namespace.groupName = this.input.tags;
    }

    const sdkMethodName = new XFernSdkMethodNameConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: "x-fern-sdk-method-name",
    });

    this.endpointId = getEndpointId(
      this.namespace?.groupName,
      this.path,
      sdkMethodName.sdkMethodName,
      this.input.operationId
    );

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
    | FernRegistry.api.latest.EndpointDefinition
    | FernRegistry.api.latest.WebhookDefinition
    | undefined {
    if (this.path == null) {
      return undefined;
    }

    if (this.isWebhook) {
      if (this.method !== "POST" && this.method !== "GET") {
        return undefined;
      }

      return {
        description: this.description,
        availability: this.availability?.convert(),
        namespace: this.namespace?.convert(),
        id: FernRegistry.WebhookId("x-fern-webhook-name"),
        method: this.method,
        // This is a little bit weird, consider changing the shape of fdr
        path:
          this.convertPathToPathParts()?.map((part) => part.value.toString()) ??
          [],
        headers: convertOperationObjectProperties(this.requestHeaders),
        // TODO: figure out what this looks like to be able to parse
        payload: undefined,
        examples: undefined,
      };
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

    if (this.endpointId == null) {
      return undefined;
    }

    const { responses, errors } = this.responses?.convert() ?? {
      responses: undefined,
      errors: undefined,
    };

    const examples = [
      ...(this.xFernExamplesNode?.convert() ?? []),
      ...(responses?.flatMap((response) => response.examples) ?? []),
    ];

    if (examples.length === 0) {
      const emptyExample = this.emptyExample?.convert();
      if (emptyExample != null) {
        examples.push(emptyExample);
      }
    }

    return {
      description: this.description,
      availability: this.availability?.convert(),
      namespace: this.namespace?.convert(),
      id: FernRegistry.EndpointId(this.endpointId),
      method: this.method,
      path: pathParts,
      auth: authIds?.map((id) => FernRegistry.api.latest.AuthSchemeId(id)),
      defaultEnvironment: environments?.[0]?.id,
      environments,
      pathParameters: convertOperationObjectProperties(this.pathParameters),
      queryParameters: convertOperationObjectProperties(this.queryParameters),
      requestHeaders: convertOperationObjectProperties(this.requestHeaders),
      responseHeaders: responses?.[0]?.headers,
      requests: this.requests?.convert(),
      responses: responses?.map((response) => response.response),
      errors,
      examples,
      snippetTemplates: undefined,
    };
  }
}
