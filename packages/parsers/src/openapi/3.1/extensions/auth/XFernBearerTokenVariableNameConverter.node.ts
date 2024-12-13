import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { X_FERN_BEARER_TOKEN_NAME } from "../fernExtension.consts";

export declare namespace XFernBearerTokenVariableNameConverterNode {
    export interface Input {
        [X_FERN_BEARER_TOKEN_NAME]?: string;
    }
}

export class XFernBearerTokenVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    tokenVariableName: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.tokenVariableName = extendType<XFernBearerTokenVariableNameConverterNode.Input>(this.input)[
            X_FERN_BEARER_TOKEN_NAME
        ];
    }

    convert(): string | undefined {
        return this.tokenVariableName;
    }
}
