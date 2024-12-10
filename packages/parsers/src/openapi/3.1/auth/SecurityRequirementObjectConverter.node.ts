import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { resolveSecurityScheme } from "../../utils/3.1/resolveSecurityScheme";
import { SecuritySchemeConverterNode } from "./SecuritySchemeConverter.node";

export class SecurityRequirementObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.SecurityRequirementObject[],
    FernRegistry.api.latest.ApiDefinition["auths"]
> {
    authNodesMap: Record<string, SecuritySchemeConverterNode> | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SecurityRequirementObject[]>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.input.map((securityScheme, index) =>
            Object.keys(securityScheme).map((key) => {
                const resolvedSecurityScheme = resolveSecurityScheme(key, this.context.document);
                if (resolvedSecurityScheme == null) {
                    this.context.errors.warning({
                        message: `No auth scheme found for ${key}`,
                        path: this.accessPath,
                    });
                    return;
                }

                const resolvedAuthScheme = new SecuritySchemeConverterNode({
                    input: resolvedSecurityScheme,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: `security[${index}]`,
                });

                if (resolvedAuthScheme.convert() != null) {
                    this.authNodesMap ??= {};
                    this.authNodesMap[key] = resolvedAuthScheme;
                } else {
                    this.context.errors.warning({
                        message: `No auth scheme found for ${key}`,
                        path: this.accessPath,
                    });
                }
            }),
        );
    }

    convert(): FernRegistry.api.latest.ApiDefinition["auths"] | undefined {
        return Object.fromEntries(
            Object.entries(this.authNodesMap ?? {})
                .map(([key, value]) => {
                    const convertedValue = value.convert();
                    if (convertedValue == null) {
                        return undefined;
                    }
                    return [key, convertedValue];
                })
                .filter(isNonNullish),
        );
    }
}
