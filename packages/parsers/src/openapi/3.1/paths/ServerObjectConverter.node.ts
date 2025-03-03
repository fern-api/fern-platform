import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { XFernServerNameConverterNode } from "../extensions/XFernServerNameConverter.node";

export class ServerObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.ServerObject,
  FernRegistry.api.latest.Environment
> {
  url: string | undefined;
  serverName: XFernServerNameConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ServerObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    this.url =
      Object.entries(this.input.variables ?? {}).reduce((url, [key, value]) => {
        return url.replace(`{${key}}`, value.default);
      }, this.input.url) ?? this.input.url;
    this.serverName = new XFernServerNameConverterNode({
      input: this.input,
      context: this.context,
      accessPath: this.accessPath,
      pathId: this.pathId,
    });
  }

  convert(): FernRegistry.api.latest.Environment | undefined {
    const serverName = this.serverName?.convert() ?? this.url;
    if (this.url == null || serverName == null) {
      return undefined;
    }

    return {
      id: FernRegistry.EnvironmentId(serverName),
      baseUrl: this.url,
    };
  }
}
