import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { SchemaConverterNode } from "../schemas";
import { X_FERN_GLOBAL_HEADERS } from "./fernExtension.consts";

export declare namespace XFernGlobalHeadersConverterNode {
  export interface Input {
    [X_FERN_GLOBAL_HEADERS]?: ((
      | OpenAPIV3_1.SchemaObject
      | OpenAPIV3_1.ReferenceObject
    ) & {
      header: string;
    })[];
  }
}

export class XFernGlobalHeadersConverterNode extends BaseOpenApiV3_1ConverterNode<
  unknown,
  FernRegistry.api.latest.ObjectProperty[]
> {
  globalHeaders?: Record<string, SchemaConverterNode> | undefined;

  constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
    super(args);
    this.safeParse();
  }

  // This would be used to set a member on the node
  parse(): void {
    extendType<XFernGlobalHeadersConverterNode.Input>(this.input)[
      X_FERN_GLOBAL_HEADERS
    ]?.forEach((header) => {
      const { header: headerName, ...schema } = header;
      this.globalHeaders ??= {};
      this.globalHeaders[headerName] = new SchemaConverterNode({
        input: schema,
        context: this.context,
        accessPath: this.accessPath,
        pathId: this.pathId,
      });
    });
  }

  convert(): FernRegistry.api.latest.ObjectProperty[] | undefined {
    return Object.entries(this.globalHeaders ?? {})
      .flatMap(([headerName, headerSchema]) => {
        const convertedSchema = maybeSingleValueToArray(headerSchema.convert());

        return convertedSchema?.map((schema) => ({
          key: FernRegistry.PropertyKey(headerName),
          valueShape: schema,
          description: headerSchema.description,
          availability: headerSchema.availability?.convert(),
        }));
      })
      .filter(isNonNullish);
  }
}
