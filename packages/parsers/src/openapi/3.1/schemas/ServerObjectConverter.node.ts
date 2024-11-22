import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";

export class ServerObjectConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ServerObject,
    FdrAPI.api.latest.Environment
> {
    id: string | undefined;
    url: string | undefined;

    constructor(args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.ServerObject>) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.url = this.input.url;

        // TODO: url validation here

        // x-fern-server-name here
        this.id = "";
    }
    convert(): FdrAPI.api.latest.Environment | undefined {
        if (this.id == null || this.url == null) {
            return undefined;
        }

        return {
            id: FdrAPI.EnvironmentId(this.id),
            baseUrl: this.url,
        };
    }
}
