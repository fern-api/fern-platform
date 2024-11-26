import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { isReferenceObject } from "../guards/isReferenceObject";
import { convertProperties } from "../schemas/ObjectConverter.node";
import { SchemaConverterNode } from "../schemas/SchemaConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export class OperationObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.OperationObject,
    FdrAPI.api.latest.EndpointDefinition
> {
    description: string | undefined;
    pathParameters: Record<string, SchemaConverterNode> | undefined;
    queryParameters: Record<string, SchemaConverterNode> | undefined;
    requestHeaders: Record<string, SchemaConverterNode> | undefined;
    // availability: AvailabilityConverterNode | undefined;

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
        this.servers = coalesceServers(this.servers, this.input.servers, this.context, this.accessPath);

        this.input.parameters?.map((parameter, index) => {
            if (isReferenceObject(parameter)) {
                // return new ParameterReferenceConverterNode({
                //     input: parameter,
                //     context: this.context,
                //     accessPath: this.accessPath,
                //     pathId: `parameters[${index}]`,
                // });
            } else if (parameter.in === "path") {
                if (parameter.schema != null) {
                    this.pathParameters ??= {};
                    this.pathParameters[parameter.name] = new SchemaConverterNode({
                        input: parameter.schema,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: `parameters[${index}]`,
                    });
                }
                // this.pathParameters.push(parameter.name);
            } else if (parameter.in === "query") {
                if (parameter.schema != null) {
                    this.queryParameters ??= {};
                    this.queryParameters[parameter.name] = new SchemaConverterNode({
                        input: parameter.schema,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: `parameters[${index}]`,
                    });
                }
            } else if (parameter.in === "header") {
                if (parameter.schema != null) {
                    this.requestHeaders ??= {};
                    this.requestHeaders[parameter.name] = new SchemaConverterNode({
                        input: parameter.schema,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: `parameters[${index}]`,
                    });
                }
            }
        });
        // validate path parts
    }

    convertPathToPathParts(): FdrAPI.api.latest.PathPart[] | undefined {
        if (this.path === undefined) {
            return undefined;
        }

        const path = this.path.startsWith("/") ? this.path.slice(1) : this.path;

        return path.split("/").map((part) => {
            if (part.startsWith("{") && part.endsWith("}")) {
                return {
                    type: "pathParameter" as const,
                    value: FdrAPI.PropertyKey(part.slice(1, -1).trim()),
                };
            }
            return {
                type: "literal" as const,
                value: part,
            };
        });
    }

    convert(): FdrAPI.api.latest.EndpointDefinition | undefined {
        if (this.path == null) {
            return undefined;
        }

        const endpointId = this.path;

        const environments = this.servers?.map((server) => server.convert()).filter(isNonNullish);
        const pathParts = this.convertPathToPathParts();
        if (pathParts == null) {
            return undefined;
        }

        return {
            description: this.description,
            // TODO: availability
            availability: undefined,
            namespace: undefined,
            id: FdrAPI.EndpointId(endpointId),
            method: this.method,
            path: pathParts,
            // TODO: auth
            auth: undefined,
            // TODO: environments
            defaultEnvironment: environments?.[0]?.id,
            environments,
            pathParameters: convertProperties(this.pathParameters),
            queryParameters: convertProperties(this.queryParameters),
            requestHeaders: convertProperties(this.requestHeaders),
            responseHeaders: [],
            request: undefined,
            response: undefined,
            errors: [],
            examples: [],
            snippetTemplates: undefined,
        };
    }
}
