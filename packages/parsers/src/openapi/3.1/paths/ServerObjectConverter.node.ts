import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";

export class ServerObjectConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ServerObject,
    FdrAPI.api.latest.Environment
> {
    url: string | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.ServerObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.url = this.input.url;
    }
    convert(): FdrAPI.api.latest.Environment | undefined {
        if (this.url == null) {
            return undefined;
        }

        return {
            // TODO: url validation here
            // x-fern-server-name here
            id: FdrAPI.EnvironmentId("x-fern-server-name"),
            baseUrl: this.url,
        };
    }
}
