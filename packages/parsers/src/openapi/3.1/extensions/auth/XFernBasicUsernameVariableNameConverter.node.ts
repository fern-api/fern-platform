import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";
import { xFernBasicUsernameVariableNameKey } from "../fernExtension.consts";

export declare namespace XFernBasicUsernameVariableNameConverterNode {
    export interface Input {
        [xFernBasicUsernameVariableNameKey]?: string;
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
            xFernBasicUsernameVariableNameKey
        ];
    }

    convert(): string | undefined {
        return this.usernameVariableName;
    }
}
