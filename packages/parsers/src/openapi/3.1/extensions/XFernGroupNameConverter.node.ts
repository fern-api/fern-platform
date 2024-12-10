import { FernRegistry } from "../../../client/generated";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";
import { xFernGroupNameKey } from "./fernExtension.consts";

export declare namespace XFernGroupNameConverterNode {
    export interface Input {
        [xFernGroupNameKey]?: string | string[];
    }
}

export class XFernGroupNameConverterNode extends BaseOpenApiV3_1ConverterNode<
    unknown,
    FernRegistry.api.latest.SubpackageId[]
> {
    groupName?: string | string[];

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown>) {
        super(args);
        this.safeParse();
    }

    // This would be used to set a member on the node
    parse(): void {
        this.groupName = extendType<XFernGroupNameConverterNode.Input>(this.input)[xFernGroupNameKey];
    }

    convert(): FernRegistry.api.latest.SubpackageId[] | undefined {
        if (this.groupName == null) {
            return undefined;
        }

        let subpackagePath: string[];
        if (Array.isArray(this.groupName)) {
            subpackagePath = this.groupName;
        } else {
            subpackagePath = [this.groupName];
        }

        return subpackagePath.map((path) => FernRegistry.api.v1.SubpackageId(path));
    }
}
