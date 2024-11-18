import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { AvailabilityNode } from "../../shared/temporary/demo";
import { chooseReferenceOrSchemaNode } from "../../utils/chooseReferenceObjectOrSchema";
import { ReferenceConverterNode } from "./ReferenceConverter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export class ObjectPropertyConverterNode extends BaseOpenApiV3_1Node<
    OpenAPIV3_1.SchemaObject,
    FdrAPI.api.latest.ObjectProperty
> {
    valueShape: SchemaConverterNode | ReferenceConverterNode | undefined;
    description: string | undefined;
    availability: AvailabilityNode | undefined;

    constructor(
        readonly propertyKey: string,
        input: OpenAPIV3_1.SchemaObject,
        context: BaseAPIConverterNodeContext,
        readonly accessPath: string[],
        readonly pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.valueShape = chooseReferenceOrSchemaNode(input, context, accessPath, pathId);

        // unique to OAS 3.1, properties can also live alongside $ref, so we will use this to determine the description and availability
        this.description = input.description;

        // TODO: add availability
        // this.availability = input.availability;

        if (this.valueShape == null) {
            this.context.errors.error({
                message: `Unprocessable type shape: ${this.propertyKey}`,
                path: this.accessPath,
            });
        }
    }

    convert(): FdrAPI.api.latest.ObjectProperty | undefined {
        const valueShape = this.valueShape?.convert();
        if (valueShape == null) {
            return undefined;
        }
        return {
            key: FdrAPI.PropertyKey(this.propertyKey),
            valueShape,
            description: this.description,
            // availability: this.availability?.convert(),
            availability: undefined,
        };
    }
}
