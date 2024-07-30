import { APIV1Read } from "@fern-api/fdr-sdk";
import { ObjectFlattener } from "./ResolutionUtilities";
import { accessByPathNonNull } from "./accessByPath";
import { Template } from "./generated/api";
import { isPlainObject } from "./isPlainObject";

export class UnionMatcher {
    constructor(
        private readonly apiDefinition: APIV1Read.ApiDefinition,
        private readonly objectFlattener: ObjectFlattener,
    ) {}

    // Evaluating a primitive:
    // Check if the values can be cast to the primitive type, if it cannot: -10, otherwise: +1
    //   Note: we only attempt to coerce types for booleans, dates and numbers
    private scorePrimitive({
        primitive,
        payloadOverride,
    }: {
        primitive: APIV1Read.PrimitiveType;
        payloadOverride: unknown;
    }): number {
        if (payloadOverride == null) {
            return 0;
        }

        switch (primitive.type) {
            case "string":
            case "uuid":
            case "base64":
                return typeof payloadOverride === "string" ? 1 : -10;
            case "integer":
            case "double":
            case "long": {
                const coercedNumber = Number(payloadOverride);
                if (isNaN(coercedNumber)) {
                    return -10;
                }

                return 1;
            }
            case "date":
            case "datetime": {
                // Can we even attempt to coerce this to a date?
                if (
                    typeof payloadOverride !== "string" &&
                    typeof payloadOverride !== "number" &&
                    !(payloadOverride instanceof Date)
                ) {
                    return -10;
                }

                // Now see if it's actually a date
                const date = new Date(payloadOverride);
                return isNaN(date.getTime()) ? -10 : 1;
            }
            case "boolean": {
                if (typeof payloadOverride === "boolean") {
                    return 1;
                } else if (typeof payloadOverride === "string") {
                    return payloadOverride.toLowerCase() === "true" || payloadOverride.toLowerCase() === "false"
                        ? 1
                        : -10;
                }
                return -10;
            }
        }
    }

    private scoreTypeReference({
        typeReference,
        payloadOverride,
    }: {
        typeReference: APIV1Read.TypeReference;
        payloadOverride: unknown;
    }): number {
        // If the payload is not present (e.g. you got a null), then any template works
        if (payloadOverride == null) {
            return 0;
        }

        switch (typeReference.type) {
            case "id":
                throw new Error("This shouldn't happen");

            // Evaluating an Optional:
            // Strip the optional and evaluate the score of the inner type.
            case "optional":
                return this.scoreTypeReference({ typeReference: typeReference.itemType, payloadOverride });
            // Evaluating a List:
            // 0. If the payload is not an array, then it should not be a list type: -10
            // 1. If the payload is an array, score each element with scoreTypeReference and sum the scores
            //    Note: we do not deduct the full score if one element is not a match, we use an average
            case "list": {
                if (!Array.isArray(payloadOverride)) {
                    return -10;
                }
                let rollingScore = 0;
                for (const item of payloadOverride) {
                    rollingScore += this.scoreTypeReference({
                        typeReference: typeReference.itemType,
                        payloadOverride: item,
                    });
                }
                return rollingScore / payloadOverride.length;
            }
            // Evaluating a set: (same as List)
            case "set": {
                if (!Array.isArray(payloadOverride) && !(payloadOverride instanceof Set)) {
                    return -10;
                }

                let denominator;
                if (Array.isArray(payloadOverride)) {
                    denominator = payloadOverride.length;
                } else {
                    denominator = payloadOverride.size;
                }

                let rollingScore = 0;
                for (const item of payloadOverride) {
                    rollingScore += this.scoreTypeReference({
                        typeReference: typeReference.itemType,
                        payloadOverride: item,
                    });
                }
                return rollingScore / denominator;
            }
            // Evaluating a map: (same as List, except we score both the key and the value, and weight them equally)
            case "map": {
                if (!isPlainObject(payloadOverride)) {
                    return -10;
                }

                const payloadObject = Object.entries(payloadOverride);
                let rollingScore = 0;
                for (const [key, value] of payloadObject) {
                    const keyScore = this.scoreTypeReference({
                        typeReference: typeReference.keyType,
                        payloadOverride: key,
                    });
                    const valueScore = this.scoreTypeReference({
                        typeReference: typeReference.valueType,
                        payloadOverride: value,
                    });
                    rollingScore += (keyScore + valueScore) / 2;
                }
                return rollingScore / payloadObject.length;
            }
            case "primitive":
                return this.scorePrimitive({ primitive: typeReference.value, payloadOverride });

            // Evaluating a Literal:
            // 0. If the payload is not a string or boolean, then it should not be a literal type: -10
            // 1. If the payload matches the literal value: +1
            // 2. If the payload does not match the literal value, but has the appropriate type: -5
            case "literal": {
                const literalValue = typeReference.value.value;

                if (typeof literalValue !== "string" && typeof literalValue !== "boolean") {
                    return -10;
                }

                return literalValue === payloadOverride ? 1 : -5;
            }
            // Evaluating an Unknown:
            // It's always a match, woo!
            case "unknown":
                return 1;
        }
    }

    // Evaluating an Enum:
    // 0. If the payload is not a string, then it should not be an enum type: -10
    // 1. If the payload is a string, and is in the enum values: +1
    // 2. If the payload is a string, but not in the enum values: -5
    private scoreEnum({
        values,
        payloadOverride,
    }: {
        values: APIV1Read.EnumValue[];
        payloadOverride: unknown;
    }): number {
        if (typeof payloadOverride !== "string") {
            return -10;
        }

        if (values.some((ev) => ev.value === payloadOverride)) {
            return 1;
        }

        return -5;
    }

    // Evaluating an Undiscriminated Union:
    // Score each variant with scoreTypeReference and return the max score computed
    private scoreUndiscriminatedUnion({
        variants,
        payloadOverride,
    }: {
        variants: APIV1Read.UndiscriminatedUnionVariant[];
        payloadOverride: unknown;
    }): number {
        return Math.max(
            ...variants.map((variant) => this.scoreTypeReference({ typeReference: variant.type, payloadOverride })),
        );
    }

    // Evaluating an Object:
    // Sum the fit scores for each property in the object
    // 0. If the property is not present in the payload but it's required: -1
    // 1. If the property is not present in the payload but it's optional: 1
    // 2. If the property is present in the payload, score it with scoreTypeReference
    private scoreObject({
        typeId,
        object,
        payloadOverride,
    }: {
        typeId?: string;
        object?: APIV1Read.ObjectType;
        payloadOverride: unknown;
    }): number {
        // If the payload is not present (e.g. you got a null), then any template works
        if (payloadOverride == null) {
            return 0;
        }

        // Flatten properties and score each property with scoreObjectProperty
        let properties: APIV1Read.ObjectProperty[];
        if (typeId != null) {
            properties = this.objectFlattener.getFlattenedObjectProperties(typeId);
        } else if (object != null) {
            properties = this.objectFlattener.getFlattenedObjectPropertiesFromObjectType(object);
        } else {
            throw new Error("Must provide either typeId or object when scoring an object in Union evaluation");
        }

        return properties.reduce((acc, property) => {
            // Get the payload for the property
            const propertyPayload = accessByPathNonNull(payloadOverride, property.key);
            let score;

            if (propertyPayload == null) {
                // Missing a required property
                score = property.valueType.type !== "optional" ? -1 : 1;
            } else {
                // Score the found property
                score = this.scoreTypeReference({
                    typeReference: property.valueType,
                    payloadOverride: propertyPayload,
                });
            }
            return acc + score;
        }, 0);
    }

    // Evaluating a Discriminated Union:
    // 0. If the payload is not an object (e.g. a primitive), then it should not be a discriminated union type: -10
    // 1. If the discriminant is present, and valid according to the API definition: +1
    // 2. If the discriminant is present, but not valid according to the API definition OR the discriminant is not present:
    //    2a. We evaluate the rest of the object and use that score
    private scoreDiscriminatedUnion({
        union,
        payloadOverride,
    }: {
        union: APIV1Read.DiscriminatedUnionType;
        payloadOverride: unknown;
    }): number {
        // If the payload is not an object, then it should not be a discriminated union type
        if (!isPlainObject(payloadOverride)) {
            return -10;
        }

        if (union.discriminant in payloadOverride) {
            const payloadDiscriminantValue = payloadOverride[union.discriminant];
            if (typeof payloadDiscriminantValue === "string") {
                // If the discriminant is there and valid, this is a success
                // no need to check the rest of the object
                const valudDiscriminants = union.variants.map((variant) => variant.discriminantValue);
                if (valudDiscriminants.includes(payloadDiscriminantValue)) {
                    return 1;
                }
            }
        }

        // Otherwise, score each variant with scoreTypeShape
        // Note we start at -10 because we know the discriminant is not valid, so we want to penalize
        // if the rest of the object is not valid either.
        let maxVariantScore = -10;
        for (const variant of union.variants) {
            const variantScore = this.scoreObject({
                object: variant.additionalProperties,
                payloadOverride,
            });
            maxVariantScore = Math.max(maxVariantScore, variantScore);
        }

        return maxVariantScore;
    }

    private scoreTypeShape({
        typeId,
        typeShape,
        payloadOverride,
    }: {
        typeId: string;
        typeShape: APIV1Read.TypeShape;
        payloadOverride?: unknown;
    }): number {
        // If the payload is not present (e.g. you got a null), then any template works
        if (payloadOverride == null) {
            return 0;
        }

        switch (typeShape.type) {
            case "alias":
                return this.scoreTypeReference({ typeReference: typeShape.value, payloadOverride });
            case "enum":
                return this.scoreEnum({ values: typeShape.values, payloadOverride });
            case "undiscriminatedUnion":
                return this.scoreUndiscriminatedUnion({ variants: typeShape.variants, payloadOverride });
            case "discriminatedUnion":
                return this.scoreDiscriminatedUnion({ union: typeShape, payloadOverride });
            case "object":
                return this.scoreObject({ typeId, payloadOverride });
        }
    }

    private scoreTemplateFit({
        typeId,
        payloadOverride,
    }: {
        typeId: string;
        payloadOverride?: unknown;
    }): number | undefined {
        const maybeType = this.apiDefinition.types[typeId];
        if (maybeType == null) {
            return;
        }

        return this.scoreTypeShape({ typeId, typeShape: maybeType.shape, payloadOverride });
    }

    public getBestFitTemplate({
        templates,
        payloadOverride,
    }: {
        templates: Record<string, Template>;
        payloadOverride?: unknown;
    }): Template | undefined {
        const typeToTemplate = new Map(Object.entries(templates));
        if (typeToTemplate.size > 0) {
            // Score each template against the payload
            const scoredTemplates = Array.from(typeToTemplate.entries())
                .map(([typeId, template]) => ({
                    template,
                    score: this.scoreTemplateFit({ typeId, payloadOverride }),
                }))
                .filter(
                    // If the type doesn't even exist, it shouldn't be an option. We only
                    // return undefined if the type could not be found in the definition.
                    (scoredTemplate): scoredTemplate is { template: Template; score: number } =>
                        scoredTemplate.score != null,
                );

            // Return the template with the highest score
            return scoredTemplates.sort((a, b) => b.score - a.score)[0]!.template;
            // This is a safe assertion given templates length > 0
        }

        // If you didn't get any templates, then you don't get one back
        return;
    }
}
