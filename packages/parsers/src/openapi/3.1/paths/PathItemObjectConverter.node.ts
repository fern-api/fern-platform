import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { coalesceServers } from "../../utils/3.1/coalesceServers";
import { SecurityRequirementObjectConverterNode } from "../auth/SecurityRequirementObjectConverter.node";
import { XFernBasePathConverterNode } from "../extensions/XFernBasePathConverter.node";
import { OperationObjectConverterNode } from "./OperationObjectConverter.node";
import { ServerObjectConverterNode } from "./ServerObjectConverter.node";

type ConstructorArgs =
  BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.PathItemObject> & {
    servers: ServerObjectConverterNode[] | undefined;
    globalAuth: SecurityRequirementObjectConverterNode | undefined;
    basePath: XFernBasePathConverterNode | undefined;
    isWebhook: boolean | undefined;
  };

export class PathItemObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.PathItemObject,
  (
    | FernRegistry.api.latest.EndpointDefinition
    | FernRegistry.api.latest.WebhookDefinition
  )[]
> {
  description: string | undefined;
  get: OperationObjectConverterNode | undefined;
  post: OperationObjectConverterNode | undefined;
  put: OperationObjectConverterNode | undefined;
  patch: OperationObjectConverterNode | undefined;
  delete: OperationObjectConverterNode | undefined;
  path: string | undefined;

  constructor(args: ConstructorArgs) {
    super(args);
    this.safeParse(args);
  }

  parse({ servers, globalAuth, basePath, isWebhook }: ConstructorArgs): void {
    this.description = this.input.description;
    const coalescedServers = coalesceServers(
      servers,
      this.input.servers,
      this.context,
      this.accessPath
    );
    const path = Array.isArray(this.pathId)
      ? this.pathId.join("/")
      : this.pathId;

    if (this.input.get != null) {
      this.get = new OperationObjectConverterNode({
        input: this.input.get,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "get",
        servers: coalescedServers,
        globalAuth,
        path,
        method: "GET",
        basePath,
        isWebhook,
      });
    }
    if (this.input.post != null) {
      this.post = new OperationObjectConverterNode({
        input: this.input.post,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "post",
        servers: coalescedServers,
        globalAuth,
        path,
        method: "POST",
        basePath,
        isWebhook,
      });
    }
    if (this.input.put != null) {
      this.put = new OperationObjectConverterNode({
        input: this.input.put,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "put",
        servers: coalescedServers,
        globalAuth,
        path,
        method: "PUT",
        basePath,
        isWebhook: false,
      });
    }
    if (this.input.patch != null) {
      this.patch = new OperationObjectConverterNode({
        input: this.input.patch,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "patch",
        servers: coalescedServers,
        globalAuth,
        path,
        method: "PATCH",
        basePath,
        isWebhook: false,
      });
    }
    if (this.input.delete != null) {
      this.delete = new OperationObjectConverterNode({
        input: this.input.delete,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "delete",
        servers: coalescedServers,
        globalAuth,
        path,
        method: "DELETE",
        basePath,
        isWebhook: false,
      });
    }
  }

  convert():
    | (
        | FernRegistry.api.latest.EndpointDefinition
        | FernRegistry.api.latest.WebhookDefinition
      )[]
    | undefined {
    return [
      ...(this.get?.convert() ?? []),
      ...(this.post?.convert() ?? []),
      ...(this.put?.convert() ?? []),
      ...(this.patch?.convert() ?? []),
      ...(this.delete?.convert() ?? []),
    ].filter(isNonNullish);
  }
}
