import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import {
    BaseOpenApiV3_1ConverterNode,
    BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../../BaseOpenApiV3_1Converter.node";
import { AvailabilityConverterNode } from "../../extensions/AvailabilityConverter.node";
import { isReferenceObject } from "../../guards/isReferenceObject";
import { SchemaConverterNode } from "../../schemas/SchemaConverter.node";

export class ParameterBaseObjectConverterNode extends BaseOpenApiV3_1ConverterNode<
    OpenAPIV3_1.ParameterBaseObject | OpenAPIV3_1.ReferenceObject,
    FdrAPI.api.latest.TypeShape
> {
    availability: AvailabilityConverterNode | undefined;
    required: boolean | undefined;
    schema: SchemaConverterNode | undefined;
    description: string | undefined;

    constructor(
        args: BaseOpenApiV3_1ConverterNodeConstructorArgs<
            OpenAPIV3_1.ParameterBaseObject | OpenAPIV3_1.ReferenceObject
        >,
    ) {
        super(args);
        this.safeParse();
    }

    parse(): void {
        this.description = this.input.description;

        if (isReferenceObject(this.input)) {
            this.schema = new SchemaConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: "schema",
            });
            this.availability = new AvailabilityConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: "availability",
            });
        } else {
            if (this.input.schema != null) {
                this.availability = new AvailabilityConverterNode({
                    input: this.input.schema,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "availability",
                });
                this.schema = new SchemaConverterNode({
                    input: this.input.schema,
                    context: this.context,
                    accessPath: this.accessPath,
                    pathId: "schema",
                });
                this.required = this.input.required;
            } else {
                this.context.logger.error(
                    `Expected reference or schema for parameter. Received: ${JSON.stringify(this.input)}`,
                );
            }
        }
    }

    convert(): FdrAPI.api.latest.TypeShape | undefined {
        return this.schema?.convert();
    }
}
