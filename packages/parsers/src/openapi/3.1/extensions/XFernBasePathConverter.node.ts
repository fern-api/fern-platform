import { OpenAPIV3_1 } from "openapi-types";
// import { UnreachableCaseError } from "ts-essentials";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { extendType } from "../../utils/extendType";

export class XFernBasePathConverterNode extends BaseOpenApiV3_1ConverterNode<OpenAPIV3_1.Document, string | undefined> {
    basePath?: string;

    constructor(args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.Document>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.basePath = extendType<{ "x-fern-base-path"?: string }>(this.input)["x-fern-base-path"];

        if (this.basePath) {
            if (this.basePath.startsWith("/")) {
                this.basePath = this.basePath.slice(1);
            }

            if (this.basePath.endsWith("/")) {
                this.basePath = this.basePath.slice(0, -1);
            }
        }
    }

    convert(): string | undefined {
        return this.basePath;
    }
}
