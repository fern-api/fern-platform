import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { v4 } from "uuid";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { PathItemObjectConverterNode } from "./PathItemObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export class PathsObjectConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.PathsObject,
    Record<FdrAPI.EndpointId, FdrAPI.api.latest.EndpointDefinition>
> {
    paths: PathItemObjectConverterNode[] | undefined;

    constructor(
        args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.PathsObject>,
        protected readonly servers: ServerObjectConverterNode[] | undefined,
    ) {
        super(args);
        this.safeParse();
    }
    parse(): void {
        this.paths = Object.entries(this.input)
            .map(([path, pathItem]) => {
                if (pathItem == null) {
                    return undefined;
                }
                return new PathItemObjectConverterNode(
                    {
                        input: pathItem,
                        context: this.context,
                        accessPath: this.accessPath,
                        pathId: path,
                    },
                    coalesceServers(this.servers, pathItem.servers, this.context, this.accessPath),
                );
            })
            .filter(isNonNullish);
    }

    convert(): Record<FdrAPI.EndpointId, FdrAPI.api.latest.EndpointDefinition> | undefined {
        if (this.paths == null) {
            return undefined;
        }

        return Object.fromEntries(
            Object.values(this.paths)
                .flatMap((pathItem) => {
                    const endpointDefinitions = pathItem.convert();
                    if (endpointDefinitions == null) {
                        return undefined;
                    }

                    return endpointDefinitions.map((endpointDefinition) => [
                        FdrAPI.EndpointId(v4()),
                        endpointDefinition,
                    ]);
                })
                .filter(isNonNullish),
        );
    }
}
