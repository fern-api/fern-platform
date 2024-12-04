import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { OperationObjectConverterNode } from "./OperationObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

export class PathItemObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.PathItemObject,
    FernRegistry.api.latest.EndpointDefinition[]
> {
    description: string | undefined;
    // TODO: Implement this
    // availability: AvailabilityConverterNode | undefined;
    get: OperationObjectConverterNode | undefined;
    post: OperationObjectConverterNode | undefined;
    put: OperationObjectConverterNode | undefined;
    patch: OperationObjectConverterNode | undefined;
    delete: OperationObjectConverterNode | undefined;
    path: string | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.PathItemObject>,
        protected servers: ServerObjectConverterNode[] | undefined,
        protected basePath: XFernBasePathConverterNode | undefined
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.description = this.input.description;
        this.servers = coalesceServers(this.servers, this.input.servers, this.context, this.accessPath);

        if (this.input.get != null) {
            this.get = new OperationObjectConverterNode(
                {
                    input: this.input.get,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "get",
                },
                this.servers,
                this.pathId,
                "GET",
                this.basePath
            );
        }
        if (this.input.post != null) {
            this.post = new OperationObjectConverterNode(
                {
                    input: this.input.post,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "post",
                },
                this.servers,
                this.pathId,
                "POST",
                this.basePath
            );
        }
        if (this.input.put != null) {
            this.put = new OperationObjectConverterNode(
                {
                    input: this.input.put,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "put",
                },
                this.servers,
                this.pathId,
                "PUT",
                this.basePath
            );
        }
        if (this.input.delete != null) {
            this.delete = new OperationObjectConverterNode(
                {
                    input: this.input.delete,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "delete",
                },
                this.servers,
                this.pathId,
                "DELETE",
                this.basePath
            );
        }

        this.input.parameters;

        // validate if path parts and path parameters match
    }

    convert(): FernRegistry.api.latest.EndpointDefinition[] | undefined {
        return [this.get?.convert(), this.post?.convert(), this.put?.convert(), this.delete?.convert()].filter(
            isNonNullish,
        );
    }
}
