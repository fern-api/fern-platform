import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";

export declare namespace XFernGroupNameConverterNode {
    export interface Input {
        "x-fern-group-name"?: string;
    }
}

export class XFernGroupNameConverterNode<T> extends BaseOpenApiV3_1ConverterNode<T, string | undefined> {
    groupName?: string;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<T>) {
        super(args);
        this.safeParse();
    }

    // This would be used to set a member on the node
    parse(): void {
        this.groupName = (this.input as T & { "x-fern-group-name"?: string })["x-fern-group-name"];
    }

    convert(): string | undefined {
        return this.groupName;
    }
}
