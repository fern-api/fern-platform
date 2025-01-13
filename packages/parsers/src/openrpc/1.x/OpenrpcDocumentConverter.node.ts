import { OpenAPIV3_1 } from "openapi-types";
import { v4 } from "uuid";
import { FernRegistry } from "../../client/generated";
import { ComponentsConverterNode } from "../../openapi/3.1/schemas/ComponentsConverter.node";
import {
  BaseOpenrpcConverterNode,
  BaseOpenrpcConverterNodeConstructorArgs,
} from "../BaseOpenrpcV3_1Converter.node";

export class OpenApiDocumentConverterNode extends BaseOpenrpcConverterNode<
  OpenAPIV3_1.Document,
  FernRegistry.api.latest.ApiDefinition
> {
  components: ComponentsConverterNode | undefined;

  constructor(
    args: BaseOpenrpcConverterNodeConstructorArgs<OpenAPIV3_1.Document>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.context.document.components != null) {
      this.components = new ComponentsConverterNode({
        input: this.context.document.components,
        context: this.context, //
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
        Object.entries(types).map(([id, type]) => [id, type])
      ),
    };
  }
}
