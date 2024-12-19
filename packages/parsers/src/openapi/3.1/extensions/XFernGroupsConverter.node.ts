import { noop } from "ts-essentials";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { xFernGroupsKey } from "./fernExtension.consts";

export declare namespace XFernGroupsConverterNode {
    export interface Group {
        description?: string;
        summary?: string;
    }

    export interface Input {
        [xFernGroupsKey]?: Record<string, Group>[];
    }
}

export class XFernGroupsConverterNode extends BaseOpenApiV3_1ConverterNode<
    unknown,
    void
> {
    groups?: Record<string, XFernGroupsConverterNode.Group>[];

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.groups = extendType<XFernGroupsConverterNode.Input>(this.input)[
            xFernGroupsKey
        ];
    }

    convert(): void | undefined {
        noop();
    }
}
