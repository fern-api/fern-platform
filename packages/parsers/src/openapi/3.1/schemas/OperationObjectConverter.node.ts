import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { v4 } from "uuid";
import { isNonNullish } from "../../../../../commons/core-utils/src/isNonNullish";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export class OperationObjectConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.OperationObject,
    FdrAPI.api.latest.EndpointDefinition
> {
    description: string | undefined;
    // availability: AvailabilityConverterNode | undefined;

    constructor(
        args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.OperationObject>,
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
                return new SchemaConverterNode({
                    input: parameter,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: `parameters[${index}]`,
                });
            } else if (parameter.in === "path") {
                // return new SchemaConverterNode({
                //     input: {
                //         type: "object",
                //         ...parameter,
                //     },
                //     context: this.context,
                //     accessPath: this.accessPath,
                //     pathId: `parameters[${index}]`,
                // });
                // this.pathParameters.push(parameter.name);
            } else if (parameter.in === "query") {
                // this.queryParameters.push(parameter.name);
            } else if (parameter.in === "header") {
                // this.requestHeaders.push(parameter.name);
            }
        });
        // validate path parts
    }

    convertPathToPathParts(): FdrAPI.api.latest.PathPart[] | undefined {
        if (this.path === undefined) {
            return undefined;
        }

        return this.path.split("/").map((part) => {
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

    public convert(): FdrAPI.api.latest.EndpointDefinition | undefined {
        const endpointId = v4();

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
            pathParameters: [],
            queryParameters: [],
            requestHeaders: [],
            responseHeaders: [],
            request: undefined,
            response: undefined,
            errors: [],
            examples: [],
            snippetTemplates: undefined,
        };
    }
}
