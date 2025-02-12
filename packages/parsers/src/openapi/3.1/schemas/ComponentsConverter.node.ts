import { isNonNullish } from "@fern-api/ui-core-utils";
import { Components } from "@open-rpc/meta-schema";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveSecurityScheme } from "../../utils/3.1/resolveSecurityScheme";
import { maybeSingleValueToArray } from "../../utils/maybeSingleValueToArray";
import { SecuritySchemeConverterNode } from "../auth/SecuritySchemeConverter.node";
import { isReferenceObject } from "../guards/isReferenceObject";
import { SchemaConverterNode } from "./SchemaConverter.node";

export function hasOpenApiLikeSecurityScheme(
  input: OpenAPIV3_1.ComponentsObject | Components
): input is OpenAPIV3_1.ComponentsObject {
  return (
    typeof input.securitySchemes === "object" && input.securitySchemes != null
  );
}

declare namespace ComponentsConverterNode {
  interface Output {
    types: FernRegistry.api.latest.ApiDefinition["types"];
    auths: FernRegistry.api.latest.ApiDefinition["auths"];
  }
}

export class ComponentsConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.ComponentsObject | Components,
  ComponentsConverterNode.Output
> {
  typeSchemas: Record<string, SchemaConverterNode> | undefined;
  securitySchemes: Record<string, SecuritySchemeConverterNode> | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
      OpenAPIV3_1.ComponentsObject | Components
    >
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.input.schemas != null) {
      this.typeSchemas = Object.fromEntries(
        Object.entries(this.input.schemas).map(([key, value]) => {
          return [
            key,
            new SchemaConverterNode({
              input: value,
              context: this.context,
              accessPath: this.accessPath,
              pathId: key,
              seenSchemas: new Set(),
            }),
          ];
        })
      );
    }
    if (
      hasOpenApiLikeSecurityScheme(this.input) &&
      this.input.securitySchemes != null
    ) {
      this.securitySchemes = Object.fromEntries(
        Object.entries(this.input.securitySchemes ?? {})
          .map(([key, securityScheme], index) => {
            let resolvedScheme: OpenAPIV3_1.SecuritySchemeObject | undefined;
            if (isReferenceObject(securityScheme)) {
              resolvedScheme = resolveSecurityScheme(
                securityScheme.$ref,
                this.context.document
              );
            } else {
              resolvedScheme = securityScheme;
            }
            if (resolvedScheme == null) {
              return undefined;
            }
            return [
              key,
              new SecuritySchemeConverterNode({
                input: resolvedScheme,
                context: this.context,
                accessPath: this.accessPath,
                pathId: ["securitySchemes", `${index}`],
              }),
            ];
          })
          .filter(isNonNullish)
      );
    }
  }

  convert(): ComponentsConverterNode.Output | undefined {
    if (this.typeSchemas == null) {
      return undefined;
    }

    return {
      auths: Object.fromEntries(
        Object.entries(this.securitySchemes ?? {})
          .map(([key, value]) => {
            const maybeAuth = value.convert();
            if (maybeAuth == null) {
              return undefined;
            }
            return [FernRegistry.api.latest.AuthSchemeId(key), maybeAuth];
          })
          .filter(isNonNullish)
      ),
      types: Object.fromEntries(
        Object.entries(this.typeSchemas)
          .map(([key, value]) => {
            const name = value.name ?? key;
            const maybeShapes = maybeSingleValueToArray(value.convert());

            if (maybeShapes == null) {
              return [key, undefined];
            }

            return [
              FernRegistry.TypeId(key),
              {
                name,
                shape: maybeShapes[0],
                description: value.description,
                availability: undefined,
              },
            ];
          })
          .filter(([_, value]) => isNonNullish(value))
      ),
    };
  }
}
