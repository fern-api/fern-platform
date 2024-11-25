import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseOpenApiV3_1Node, BaseOpenApiV3_1NodeConstructorArgs } from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/3.1/getSchemaIdFromReference";

export class ReferenceConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ReferenceObject,
    FdrAPI.api.latest.TypeShape.Alias
> {
    schemaId: string | undefined;

    constructor(...args: BaseOpenApiV3_1NodeConstructorArgs<OpenAPIV3_1.ReferenceObject>) {
        super(...args);
        this.safeParse();
    }

    parse(): void {
        this.schemaId = getSchemaIdFromReference(this.input);

        if (this.schemaId == null) {
            this.context.errors.error({
                message: `Unprocessable reference: ${this.input.$ref}`,
                path: this.accessPath,
            });
        }
    }

    convert(): FdrAPI.api.latest.TypeShape.Alias | undefined {
        if (this.schemaId == null) {
            return undefined;
        }

        return {
            type: "alias",
            value: {
                type: "id",
                id: FdrAPI.TypeId(this.schemaId),
                // TODO: figure out how to handle default
                default: undefined,
            },
        };
    }
}
