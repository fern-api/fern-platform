// This is not a real OAS type, but is used in multiple places, so it is abstracted

import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { XFernBearerFormatConverterNode } from "../extensions/auth/XFernBearerFormatConverter.node";
import { XFernHeaderAuthConverterNode } from "../extensions/auth/XFernHeaderAuthConverter.node";
import { XFernHeaderVariableNameConverterNode } from "../extensions/auth/XFernHeaderVariableNameConverter.node";
import { isApiKeySecurityScheme } from "../guards/isApiKeySecurityScheme";

export declare namespace HeaderSecuritySchemeConverterNode {
    export interface Input extends OpenAPIV3_1.ApiKeySecurityScheme {
        in: "header";
    }
}

export class HeaderSecuritySchemeConverterNode extends BaseOpenApiV3_1ConverterNode<
    HeaderSecuritySchemeConverterNode.Input | OpenAPIV3_1.OAuth2SecurityScheme,
    FernRegistry.api.v1.read.ApiAuth.Header
> {
    headerName: string | undefined;
    // x-bearer-format
    headerBearerFormatNode: XFernBearerFormatConverterNode | undefined;
    // x-fern-header
    headerAuthNode: XFernHeaderAuthConverterNode | undefined;
    // x-fern-header-variable-name
    headerVariableNameNode: XFernHeaderVariableNameConverterNode | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
            HeaderSecuritySchemeConverterNode.Input | OpenAPIV3_1.OAuth2SecurityScheme
        >,
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        if (isApiKeySecurityScheme(this.input)) {
            this.headerName = this.input.name;
        }
        this.headerAuthNode = new XFernHeaderAuthConverterNode({
            input: this.input,
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
        });
        this.headerVariableNameNode = new XFernHeaderVariableNameConverterNode({
            input: this.input,
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
        });
        this.headerBearerFormatNode = new XFernBearerFormatConverterNode({
            input: this.input,
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
        });
    }

    convert(): FernRegistry.api.v1.read.ApiAuth.Header | undefined {
        const headerAuth = this.headerAuthNode?.convert();
        if (headerAuth == null) {
            return undefined;
        }

        return {
            type: "header",
            nameOverride: headerAuth?.name,
            headerWireValue: this.headerName ?? "Authorization",
            prefix: headerAuth?.prefix ?? this.headerBearerFormatNode?.convert(),
        };
    }
}
