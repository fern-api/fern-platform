import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../../utils/extendType";

const headerVariableNameExtensionKey = "x-fern-header-variable-name";

export declare namespace XFernHeaderVariableNameConverterNode {
    export interface Input {
        [headerVariableNameExtensionKey]?: string;
    }
}

export class XFernHeaderVariableNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    headerVariableName: string | undefined;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.headerVariableName = extendType<XFernHeaderVariableNameConverterNode.Input>(this.input)[
            headerVariableNameExtensionKey
        ];
    }

    convert(): string | undefined {
        return this.headerVariableName;
    }
}
