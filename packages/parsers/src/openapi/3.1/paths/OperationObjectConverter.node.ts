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
import { XFernGroupNameConverterNode } from "../extensions/XFernGroupNameConverter.node";
import { isReferenceObject } from "../guards/isReferenceObject";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";
import {
    ParameterBaseObjectConverterNode,
    convertOperationObjectProperties,
} from "./parameters/ParameterBaseObjectConverter.node";
import { RequestBodyObjectConverterNode } from "./request/RequestBodyObjectConverter.node";
import { ResponsesObjectConverterNode } from "./response/ResponsesObjectConverter.node";

export class OperationObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.OperationObject,
    FernRegistry.api.latest.EndpointDefinition | FernRegistry.api.latest.WebhookDefinition
> {
    description: string | undefined;
    pathParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
    queryParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
    requestHeaders: Record<string, ParameterBaseObjectConverterNode> | undefined;
    requests: RequestBodyObjectConverterNode | undefined;
    responses: ResponsesObjectConverterNode | undefined;
    availability: AvailabilityConverterNode | undefined;
    auth: SecurityRequirementObjectConverterNode | undefined;
    namespace: XFernGroupNameConverterNode | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.OperationObject>,
        protected servers: ServerObjectConverterNode[] | undefined,
        protected path: string | undefined,
        protected method: "GET" | "POST" | "PUT" | "DELETE",
        protected basePath: XFernBasePathConverterNode | undefined,
        protected isWebhook?: boolean,
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
        this.servers = coalesceServers(this.servers, this.input.servers, this.context, this.accessPath);

        this.input.parameters?.map((parameter, index) => {
            if (isReferenceObject(parameter)) {
                const resolvedParameter = resolveParameterReference(parameter, this.context.document);
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
                    this.pathParameters[parameter.name] = new ParameterBaseObjectConverterNode({
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
                    this.queryParameters[parameter.name] = new ParameterBaseObjectConverterNode({
                        input: parameter,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: `parameters[${index}]`,
                    });
                }
            } else if (parameter.in === "header") {
                if (parameter.schema != null) {
                    this.requestHeaders ??= {};
                    this.requestHeaders[parameter.name] = new ParameterBaseObjectConverterNode({
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

        this.requests =
            this.input.requestBody != null
                ? new RequestBodyObjectConverterNode({
                      input: this.input.requestBody,
                      context: this.context,
                      accessPath: this.accessPath,
                      pathId: "requestBody",
                  })
                : undefined;

        this.responses =
            this.input.responses != null
                ? new ResponsesObjectConverterNode({
                      input: this.input.responses,
                      context: this.context,
                      accessPath: this.accessPath,
                      pathId: "responses",
                  })
                : undefined;

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
        const pathParts = basePath ? [basePath, ...path.split("/")] : path.split("/");

        return pathParts.map((part) => {
            if (part.startsWith("{") && part.endsWith("}")) {
                return {
                    type: "pathParameter" as const,
                    value: FernRegistry.PropertyKey(part.slice(1, -1).trim()),
                };
            }
            return {
                type: "literal" as const,
                value: part,
            };
        });
    }

    convert(): FernRegistry.api.latest.EndpointDefinition | FernRegistry.api.latest.WebhookDefinition | undefined {
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
                path: this.convertPathToPathParts()?.map((part) => part.value.toString()) ?? [],
                headers: convertOperationObjectProperties(this.requestHeaders),
                // TODO: figure out what this looks like to be able to parse
                payload: undefined,
                examples: undefined,
            };
        }

        const endpointId = getEndpointId(this.method, this.path);

        const environments = this.servers?.map((server) => server.convert()).filter(isNonNullish);
        const pathParts = this.convertPathToPathParts();
        if (pathParts == null) {
            return undefined;
        }

        let authIds: string[] | undefined;
        const auth = this.auth?.convert();
        if (auth != null) {
            authIds = Object.keys(auth);
        }

        // TODO: revisit fdr shape to suport multiple responses
        const { responses, errors } = this.responses?.convert() ?? { responses: undefined, errors: undefined };

        this.context.logger.info("Accessing first request and response from OperationObjectConverterNode conversion.");
        return {
            description: this.description,
            availability: this.availability?.convert(),
            namespace: this.namespace?.convert(),
            id: FernRegistry.EndpointId(endpointId),
            method: this.method,
            path: pathParts,
            auth: authIds?.map((id) => FernRegistry.api.latest.AuthSchemeId(id)),
            defaultEnvironment: environments?.[0]?.id,
            environments,
            pathParameters: convertOperationObjectProperties(this.pathParameters),
            queryParameters: convertOperationObjectProperties(this.queryParameters),
            requestHeaders: convertOperationObjectProperties(this.requestHeaders),
            responseHeaders: responses?.[0]?.headers,
            // TODO: revisit fdr shape to suport multiple requests
            request: this.requests?.convert()[0],
            response: responses?.[0]?.response,
            errors,
            // TODO: examples
            examples: [],
            snippetTemplates: undefined,
        };
    }
}
