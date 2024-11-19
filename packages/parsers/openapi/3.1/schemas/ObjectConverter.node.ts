import { FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { OpenAPIV3_1 } from "openapi-types";
import { BaseAPIConverterNodeContext } from "../../../BaseApiConverter.node";
import { BaseOpenApiV3_1Node } from "../../BaseOpenApiV3_1Converter.node";
import { SchemaConverterNode } from "./SchemaConverter.node";

export declare namespace ObjectConverterNode {
    interface Input extends OpenAPIV3_1.NonArraySchemaObject {
        type: "object";
    }
}

function convertExtraPropertiesBoolean(displayName: string | undefined): {
    convert: () => FdrAPI.api.latest.TypeShape.Alias;
} {
    return {
        convert: () => ({
            type: "alias",
            value: {
                type: "unknown",
                displayName,
            },
        }),
    };
}

export class ObjectConverterNode extends BaseOpenApiV3_1Node<
    ObjectConverterNode.Input,
    FdrAPI.api.latest.TypeShape.Object_
> {
    extends: string[] = [];
    properties: Record<string, SchemaConverterNode>;
    extraProperties: ReturnType<typeof convertExtraPropertiesBoolean> | SchemaConverterNode | undefined;

    constructor(
        input: ObjectConverterNode.Input,
        context: BaseAPIConverterNodeContext,
        accessPath: string[],
        pathId: string,
    ) {
        super(input, context, accessPath, pathId);

        this.extends = [];

        // TODO: discriminate between schemas and references. For schemas, we need to inline the properties for processing

        // if (input.allOf != null) {
        //     this.extends = input.allOf
        //         .map((type) => chooseReferenceOrSchemaNode(type, context, accessPath, pathId))
        //         .filter(isNonNullish);
        // }

        this.properties = Object.fromEntries(
            Object.entries(input.properties ?? {}).map(([key, property]) => {
                return [key, new SchemaConverterNode(property, context, accessPath, pathId)];
            }),
        );

        this.extraProperties =
            input.additionalProperties != null
                ? typeof input.additionalProperties === "boolean"
                    ? input.additionalProperties
                        ? convertExtraPropertiesBoolean(input.title)
                        : undefined
                    : new SchemaConverterNode(input.additionalProperties, context, accessPath, pathId)
                : undefined;
    }

    convert(): FdrAPI.api.latest.TypeShape.Object_ | undefined {
        const extraProperties = this.extraProperties?.convert();

        return {
            // extends: this.extends
            type: "object",
            extends: this.extends.map((id) => FdrAPI.TypeId(id)),
            properties: Object.entries(this.properties)
                .map(([key, node]) => {
                    const convertedShape = node.convert();
                    if (convertedShape == null) {
                        return undefined;
                    }
                    return {
                        key: FdrAPI.PropertyKey(key),
                        valueShape: convertedShape,
                        description: node.description,
                        // use Availability extension here
                        availability: undefined,
                    };
                })
                .filter(isNonNullish),
            extraProperties: extraProperties && extraProperties.type === "alias" ? extraProperties.value : undefined,
        };
    }
}
