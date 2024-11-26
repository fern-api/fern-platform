import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";

export declare namespace XFernGroupNameConverterNode {
    export interface Input {
        "x-fern-group-name"?: string;
    }
}

export class XFernGroupNameConverterNode extends BaseOpenApiV3_1ConverterNode<unknown, string | undefined> {
    groupName?: string;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    // This would be used to set a member on the node
    parse(): void {
        this.groupName = extendType<{ "x-fern-group-name"?: string }>(this.input)["x-fern-group-name"];
    }

    convert(): string | undefined {
        return this.groupName;
    }
}
