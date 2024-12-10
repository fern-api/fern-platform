import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { xFernServerNameKey } from "./fernExtension.consts";

export declare namespace XFernServerNameConverterNode {
    export type Input = {
        [xFernServerNameKey]: string;
    };
}

export class XFernServerNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string> {
    serverName?: string;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.serverName = extendType<XFernServerNameConverterNode.Input>(this.input)[xFernServerNameKey];
    }

    convert(): string | undefined {
        if (this.serverName == null) {
            return undefined;
        }

        return this.serverName;
    }
}
