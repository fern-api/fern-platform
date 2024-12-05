import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";

const bearerTokenVariableNameExtensionKey = "x-fern-token-variable-name";

export declare namespace XFernBearerTokenVariableNameConverterNode {
    export interface Input {
        [bearerTokenVariableNameExtensionKey]?: string;
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
            bearerTokenVariableNameExtensionKey
        ];
    }

    convert(): string | undefined {
        return this.tokenVariableName;
    }
}
