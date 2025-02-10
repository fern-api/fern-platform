import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";

import { ObjectFlattener } from "./ResolutionUtilities";
import { accessByPathNonNull } from "./accessByPath";
import { isPlainObject } from "./isPlainObject";

export class UnionMatcher {
  constructor(
    private readonly apiDefinition: FernRegistry.api.v1.read.ApiDefinition,
    private readonly objectFlattener: ObjectFlattener
  ) {}

  // Evaluating a primitive:
  // Check if the values can be cast to the primitive type, if it cannot: -10, otherwise: +1
  //   Note: we only attempt to coerce types for booleans, dates and numbers
  private scorePrimitive({
    primitive,
    payloadOverride,
  }: {
    primitive: FernRegistry.api.v1.read.PrimitiveType;
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
      case "long":
      case "uint":
      case "uint64":
      case "bigInteger": {
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
          return payloadOverride.toLowerCase() === "true" ||
            payloadOverride.toLowerCase() === "false"
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
    typeReference: FernRegistry.api.v1.read.TypeReference;
    payloadOverride: unknown;
  }): number {
    // If the payload is not present (e.g. you got a null), then any template works
    if (payloadOverride == null) {
      return 0;
    }

    switch (typeReference.type) {
      // This is actually a typeId, despite it's name as a "typeReferenceId"
      // So we delegate to scoreObject
      case "id":
        return this.scoreType({
          typeId: typeReference.value,
          payloadOverride,
        });

      // Evaluating an Optional:
      // Strip the optional and evaluate the score of the inner type.
      case "optional":
        return this.scoreTypeReference({
          typeReference: typeReference.itemType,
          payloadOverride,
        });
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
        if (
          !Array.isArray(payloadOverride) &&
          !(payloadOverride instanceof Set)
        ) {
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
        return this.scorePrimitive({
          primitive: typeReference.value,
          payloadOverride,
        });

      // Evaluating a Literal:
      // 0. If the payload is not a string or boolean, then it should not be a literal type: -10
      // 1. If the payload matches the literal value: +1
      // 2. If the payload does not match the literal value, but has the appropriate type: -5
      case "literal": {
        const literalValue = typeReference.value.value;

        if (
          typeof literalValue !== "string" &&
          typeof literalValue !== "boolean"
        ) {
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
    values: FernRegistry.api.v1.read.EnumValue[];
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
    variants: FernRegistry.api.v1.read.UndiscriminatedUnionVariant[];
    payloadOverride: unknown;
  }): number {
    return Math.max(
      ...variants.map((variant) =>
        this.scoreTypeReference({
          typeReference: variant.type,
          payloadOverride,
        })
      )
    );
  }

  // Evaluating an Object:
  // Sum the fit scores for each property in the object
  // 0. If the property is not present in the payload but it's required: -1
  // 1. If the property is not present in the payload but it's optional: 1
  // 2. If the property is present in the payload, score it with scoreTypeReference
  private scoreObject({
    object,
    payloadOverride,
  }: {
    object: FernRegistry.api.v1.read.ObjectType;
    payloadOverride: unknown;
  }): number {
    // If the payload is not present (e.g. you got a null), then any template works
    if (payloadOverride == null) {
      return 0;
    }

    // Flatten properties and score each property with scoreObjectProperty
    const properties =
      this.objectFlattener.getFlattenedObjectPropertiesFromObjectType(object);

    return properties.reduce((acc, property) => {
      // Get the payload for the property
      const propertyPayload = accessByPathNonNull(
        payloadOverride,
        property.key
      );
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
    union: FernRegistry.api.v1.read.DiscriminatedUnionType;
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
        const valudDiscriminants = union.variants.map(
          (variant) => variant.discriminantValue
        );
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
    typeShape,
    payloadOverride,
  }: {
    typeShape: FernRegistry.api.v1.read.TypeShape;
    payloadOverride?: unknown;
  }): number {
    // If the payload is not present (e.g. you got a null), then any template works
    if (payloadOverride == null) {
      return 0;
    }

    switch (typeShape.type) {
      case "alias":
        return this.scoreTypeReference({
          typeReference: typeShape.value,
          payloadOverride,
        });
      case "enum":
        return this.scoreEnum({
          values: typeShape.values,
          payloadOverride,
        });
      case "undiscriminatedUnion":
        return this.scoreUndiscriminatedUnion({
          variants: typeShape.variants,
          payloadOverride,
        });
      case "discriminatedUnion":
        return this.scoreDiscriminatedUnion({
          union: typeShape,
          payloadOverride,
        });
      case "object":
        return this.scoreObject({ object: typeShape, payloadOverride });
    }
  }

  private scoreType({
    typeId,
    payloadOverride,
  }: {
    typeId: FernRegistry.TypeId;
    payloadOverride?: unknown;
  }): number {
    const maybeType = this.apiDefinition.types[typeId];
    if (maybeType == null) {
      // If the type doesn't even exist, it shouldn't be an option. We only
      // return undefined if the type could not be found in the definition.
      return -9999;
    }

    return this.scoreTypeShape({
      typeShape: maybeType.shape,
      payloadOverride,
    });
  }

  public getBestFitTemplate({
    members,
    payloadOverride,
  }: {
    members: FernRegistry.UnionTemplateMember[];
    payloadOverride?: unknown;
  }): FernRegistry.Template | undefined {
    if (members.length > 0) {
      // Score each template against the payload
      const scoredTemplates = members.map((member) => ({
        template: member.template,
        score: this.scoreTypeReference({
          typeReference: member.type,
          payloadOverride,
        }),
      }));

      // Return the template with the highest score
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return scoredTemplates.sort((a, b) => b.score - a.score)[0]!.template;
      // This is a safe assertion given templates length > 0
    }

    // If you didn't get any templates, then you don't get one back
    return;
  }
}
