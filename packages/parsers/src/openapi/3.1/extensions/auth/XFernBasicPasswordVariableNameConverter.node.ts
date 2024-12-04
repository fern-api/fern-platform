import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";

const basicPasswordVariableNameExtensionKey = "x-fern-password-variable-name";

export declare namespace XFernBasicPasswordVariableNameConverterNode {
    export interface Input {
        [basicPasswordVariableNameExtensionKey]?: string;
    }
}

export class XFernBasicPasswordVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    passwordVariableName: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.passwordVariableName = extendType<XFernBasicPasswordVariableNameConverterNode.Input>(this.input)[
            basicPasswordVariableNameExtensionKey
        ];
    }

    convert(): string | undefined {
        return this.passwordVariableName;
    }
}
