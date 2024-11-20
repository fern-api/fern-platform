import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { getSchemaIdFromReference } from "../../utils/getSchemaIdFromReference";

export class ReferenceConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.ReferenceObject,
    FdrAPI.api.latest.TypeShape.Alias
> {
    schemaId: string | undefined;

    constructor(
        input: OpenAPIV3_1.ReferenceObject,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.schemaId = getSchemaIdFromReference(input);

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
