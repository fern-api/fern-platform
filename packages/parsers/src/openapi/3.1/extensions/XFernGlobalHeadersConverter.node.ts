import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { convertToObjectProperties } from "../../utils/3.1/convertToObjectProperties";
import { resolveParameterReference } from "../../utils/3.1/resolveParameterReference";
import { extendType } from "../../utils/extendType";
import { ParameterBaseObjectConverterNode } from "../paths";
import { X_FERN_GLOBAL_HEADERS } from "./fernExtension.consts";

export declare namespace XFernGlobalHeadersConverterNode {
  export interface Input {
    [X_FERN_GLOBAL_HEADERS]?: ((
      | OpenAPIV3_1.ParameterObject
      | OpenAPIV3_1.ReferenceObject
    ) & {
      header: string;
      optional?: boolean;
    })[];
  }
}

export class XFernGlobalHeadersConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  FernRegistry.api.latest.ObjectProperty[]
> {
  globalHeaders?: Record<string, ParameterBaseObjectConverterNode> | undefined;
  requiredProperties?: string[] | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  // This would be used to set a member on the node
  parse(): void {
    const headers = extendType<XFernGlobalHeadersConverterNode.Input>(
      this.input
    )[X_FERN_GLOBAL_HEADERS]?.map((header) => {
      const { header: headerName, ...schema } = header;
      if (
        (schema.optional != null && !schema.optional) ||
        resolveParameterReference(schema, this.context.document)?.required
      ) {
        this.requiredProperties ??= [];
        this.requiredProperties?.push(headerName);
      }
      return [
        headerName,
        new ParameterBaseObjectConverterNode({
          input: schema,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
        }),
      ];
    });
    if (headers != null) {
      this.globalHeaders = Object.fromEntries(headers);
    }
  }

  convert(): FernRegistry.api.latest.ObjectProperty[] | undefined {
    return convertToObjectProperties(
      this.globalHeaders,
      this.requiredProperties
    )?.flat();
  }
}
