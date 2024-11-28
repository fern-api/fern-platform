import { isNonNullish } from "@fern-api/ui-core-utils";
import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { convertToObjectProperties } from "../../utils/3.1/convertToObjectProperties";
import { resolveParameterReference } from "../../utils/3.1/resolveParameterReference";
import { AvailabilityConverterNode } from "../extensions/AvailabilityConverter.node";
import { isReferenceObject } from "../guards/isReferenceObject";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";
import { ParameterBaseObjectConverterNode } from "./parameters/ParameterBaseObjectConverter.node";
import { RequestBodyObjectConverterNode } from "./request/RequestBodyObjectConverter.node";
import { ResponsesObjectConverterNode } from "./response/ResponsesObjectConverter.node";

export class OperationObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.OperationObject,
    FernRegistry.api.latest.EndpointDefinition
> {
    description: string | undefined;
    pathParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
    queryParameters: Record<string, ParameterBaseObjectConverterNode> | undefined;
    requestHeaders: Record<string, ParameterBaseObjectConverterNode> | undefined;
    requests: RequestBodyObjectConverterNode | undefined;
    responses: ResponsesObjectConverterNode | undefined;
    availability: AvailabilityConverterNode | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.OperationObject>,
        protected servers: ServerObjectConverterNode[] | undefined,
        protected path: string | undefined,
        protected method: "GET" | "POST" | "PUT" | "DELETE",
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
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
                        message: "Expected parameter reference to resolve to a parameter object. Received null",
                        path: this.accessPath,
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
        // validate path parts

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
    }

    convertPathToPathParts(): FernRegistry.api.latest.PathPart[] | undefined {
        if (this.path === undefined) {
            return undefined;
        }

        const path = this.path.startsWith("/") ? this.path.slice(1) : this.path;

        return path.split("/").map((part) => {
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

    convert(): FernRegistry.api.latest.EndpointDefinition | undefined {
        if (this.path == null) {
            return undefined;
        }

        const endpointId = this.path;

        const environments = this.servers?.map((server) => server.convert()).filter(isNonNullish);
        const pathParts = this.convertPathToPathParts();
        if (pathParts == null) {
            return undefined;
        }

        // TODO: revisit fdr shape to suport multiple responses
        const { responses, errors } = this.responses?.convert() ?? { responses: undefined, errors: undefined };

        return {
            description: this.description,
            availability: this.availability?.convert(),
            namespace: undefined,
            id: FernRegistry.EndpointId(endpointId),
            method: this.method,
            path: pathParts,
            // TODO: auth
            auth: undefined,
            defaultEnvironment: environments?.[0]?.id,
            environments,
            pathParameters: convertToObjectProperties(this.pathParameters),
            queryParameters: convertToObjectProperties(this.queryParameters),
            requestHeaders: convertToObjectProperties(this.requestHeaders),
            responseHeaders: responses?.[0]?.headers,
            // TODO: revisit fdr shape to suport multiple requests
            request: this.requests?.convert()[0],
            response: responses?.[0]?.response,
            errors,
            examples: [],
            snippetTemplates: undefined,
        };
    }
}
