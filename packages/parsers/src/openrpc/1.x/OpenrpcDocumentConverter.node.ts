import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { v4 } from "uuid";

import { isNonNullish } from "@fern-api/ui-core-utils";

import { FernRegistry } from "../../client/generated";
import { ServerObjectConverterNode } from "../../openapi";
import { ComponentsConverterNode } from "../../openapi/3.1/schemas/ComponentsConverter.node";
import { coalesceServers } from "../../openapi/utils/3.1/coalesceServers";
import { computeSubpackages } from "../../utils/computeSubpackages";
import {
  BaseOpenrpcConverterNode,
  BaseOpenrpcConverterNodeConstructorArgs,
} from "../BaseOpenrpcConverter.node";
import { resolveMethodReference } from "../utils/resolveMethodReference";
import { MethodConverterNode } from "./MethodConverter.node";

export class OpenrpcDocumentConverterNode extends BaseOpenrpcConverterNode<
  OpenrpcDocument,
  FernRegistry.api.latest.ApiDefinition
> {
  servers: ServerObjectConverterNode[] = [];
  methods: MethodConverterNode[] = [];
  components: ComponentsConverterNode | undefined;

  constructor(args: BaseOpenrpcConverterNodeConstructorArgs<OpenrpcDocument>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.context.openrpc.servers != null) {
      this.servers = coalesceServers(
        this.servers,
        this.input.servers,
        this.context,
        this.accessPath
      );
    }

    if (this.input.methods != null) {
      for (const method of this.input.methods) {
        const resolvedMethod = resolveMethodReference(
          method,
          this.context.openrpc
        );
        if (resolvedMethod == null) {
          continue;
        }
        this.methods.push(
          new MethodConverterNode(
            {
              input: resolvedMethod,
              context: this.context,
              accessPath: this.accessPath,
              pathId: "methods",
            },
            this.servers
          )
        );
      }
    }

    if (this.context.openrpc.components != null) {
      this.components = new ComponentsConverterNode({
        input: this.context.openrpc.components,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "components",
      });
    }
  }

  convert(): FernRegistry.api.latest.ApiDefinition | undefined {
    const apiDefinitionId = v4();
    const types = this.components?.convert();

    const methods = this.methods
      ?.map((method) => {
        return method.convert();
      })
      .filter(isNonNullish);

    const endpoints = Object.fromEntries(
      methods?.map((method) => [method.id, method]) ?? []
    );

    const subpackages = computeSubpackages({ endpoints });

    return {
      id: FernRegistry.ApiDefinitionId(apiDefinitionId),
      types: Object.fromEntries(
        Object.entries(types ?? {}).map(([id, type]) => [id, type])
      ),
      endpoints,
      websockets: {},
      webhooks: {},
      subpackages,
      auths: {},
      globalHeaders: [],
    };
  }
}
