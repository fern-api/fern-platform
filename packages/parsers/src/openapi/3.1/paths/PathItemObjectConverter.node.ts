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

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.PathItemObject>,
    protected servers: ServerObjectConverterNode[] | undefined,
    protected globalAuth: SecurityRequirementObjectConverterNode | undefined,
    protected basePath: XFernBasePathConverterNode | undefined,
    protected isWebhook: boolean | undefined
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.description = this.input.description;
    this.servers = coalesceServers(
      this.servers,
      this.input.servers,
      this.context,
      this.accessPath
    );

    if (this.input.get != null) {
      this.get = new OperationObjectConverterNode(
        {
          input: this.input.get,
          context: this.context,
          accessPath: this.accessPath,
          pathId: "get",
        },
        this.servers,
        this.globalAuth,
        this.pathId,
        "GET",
        this.basePath,
        this.isWebhook
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
        this.globalAuth,
        this.pathId,
        "POST",
        this.basePath,
        this.isWebhook
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
        this.globalAuth,
        this.pathId,
        "PUT",
        this.basePath
      );
    }
    if (this.input.patch != null) {
      this.patch = new OperationObjectConverterNode(
        {
          input: this.input.patch,
          context: this.context,
          accessPath: this.accessPath,
          pathId: "patch",
        },
        this.servers,
        this.globalAuth,
        this.pathId,
        "PATCH",
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
        this.globalAuth,
        this.pathId,
        "DELETE",
        this.basePath
      );
    }
  }

  convert():
    | (
        | FernRegistry.api.latest.EndpointDefinition
        | FernRegistry.api.latest.WebhookDefinition
      )[]
    | undefined {
    return [
      this.get?.convert(),
      this.post?.convert(),
      this.put?.convert(),
      this.patch?.convert(),
      this.delete?.convert(),
    ].filter(isNonNullish);
  }
}
