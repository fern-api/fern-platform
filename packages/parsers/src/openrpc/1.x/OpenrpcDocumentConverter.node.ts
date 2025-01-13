import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { v4 } from "uuid";
import { FernRegistry } from "../../client/generated";
import { ComponentsConverterNode } from "../../openapi/3.1/schemas/ComponentsConverter.node";
import {
  BaseOpenrpcConverterNode,
  BaseOpenrpcConverterNodeConstructorArgs,
} from "../BaseOpenrpcConverter.node";

export class OpenrpcDocumentConverterNode extends BaseOpenrpcConverterNode<
  OpenrpcDocument,
  FernRegistry.api.latest.ApiDefinition
> {
  components: ComponentsConverterNode | undefined;

  constructor(args: BaseOpenrpcConverterNodeConstructorArgs<OpenrpcDocument>) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.context.document.components != null) {
      this.components = new ComponentsConverterNode({
        input: this.context.document.components,
        context: this.context,
        accessPath: this.accessPath,
        pathId: "components",
      });
    }
  }

  convert(): FernRegistry.api.latest.ApiDefinition | undefined {
    const apiDefinitionId = v4();
    const types = this.components?.convert();

    return {
      id: FernRegistry.ApiDefinitionId(apiDefinitionId),
      types: Object.fromEntries(
        Object.entries(types ?? {}).map(([id, type]) => [id, type])
      ),
      endpoints: {},
      websockets: {},
      webhooks: {},
      subpackages: {},
      auths: {},
      globalHeaders: [],
    };
  }
}
