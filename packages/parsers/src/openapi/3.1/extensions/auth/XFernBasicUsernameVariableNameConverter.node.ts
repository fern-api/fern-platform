import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";

const basicUsernameVariableNameExtensionKey = "x-fern-username-variable-name";

export declare namespace XFernBasicUsernameVariableNameConverterNode {
    export interface Input {
        [basicUsernameVariableNameExtensionKey]?: string;
    }
}

export class XFernBasicUsernameVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    usernameVariableName: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.usernameVariableName = extendType<XFernBasicUsernameVariableNameConverterNode.Input>(this.input)[
            basicUsernameVariableNameExtensionKey
        ];
    }

    convert(): string | undefined {
        return this.usernameVariableName;
    }
}
