import { MarkdownText } from "../docs";
import { TypeId } from "../navigation";
import { LARGE_LOOP_TOLERANCE } from "./const";
import { TypeDefinition } from "./latest";
import { TypeShapeOrReference } from "./types";
import { unwrapDiscriminatedUnionVariant, unwrapObjectType, unwrapReference } from "./unwrap";

export function traverseTypeDefinition(
    type: TypeShapeOrReference,
    types: Record<TypeId, TypeDefinition>,
    visitor: (parts: string[], descriptions: MarkdownText[]) => void,
    maxDepth = 5,
): void {
    const stack: {
        type: TypeShapeOrReference;
        parts: string[];
        descriptions: MarkdownText[];
        visitedTypeIds: Set<TypeId>;
    }[] = [{ type, parts: [], descriptions: [], visitedTypeIds: new Set() }];

    let loop = 0;
    while (stack.length > 0) {
        if (loop++ > LARGE_LOOP_TOLERANCE) {
            // eslint-disable-next-line no-console
            console.error("Infinite loop detected when traversing type definitions");
            break;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { type: last, parts: parentParts, descriptions, visitedTypeIds: parentVisitedTypeIds } = stack.pop()!;

        if (parentParts.length > maxDepth) {
            continue;
        }

        const unwrapped = unwrapReference(last, types);

        // check if this reference has been unwrapped already by its parents
        let circularReferenceDetected = false;
        unwrapped.visitedTypeIds.forEach((typeId) => {
            if (parentVisitedTypeIds.has(typeId)) {
                circularReferenceDetected = true;
            }
        });

        if (circularReferenceDetected) {
            continue;
        }

        const visitedTypeIds = new Set([...parentVisitedTypeIds, ...unwrapped.visitedTypeIds]);

        if (unwrapped.shape.type === "object") {
            const obj = unwrapObjectType(unwrapped.shape, types);

            visitor(parentParts, [...descriptions, ...unwrapped.descriptions, ...obj.descriptions]);

            obj.visitedTypeIds.forEach((typeId) => visitedTypeIds.add(typeId));

            obj.properties.forEach((property) => {
                stack.push({
                    type: property.valueShape,
                    parts: [...parentParts, property.key],
                    descriptions: property.description ? [property.description] : [],
                    visitedTypeIds,
                });
            });

            if (obj.extraProperties) {
                stack.push({
                    type: obj.extraProperties,
                    parts: [...parentParts, "extra"],
                    descriptions: [],
                    visitedTypeIds,
                });
            }
        } else if (unwrapped.shape.type === "undiscriminatedUnion") {
            visitor(parentParts, [...descriptions, ...unwrapped.descriptions]);

            unwrapped.shape.variants.forEach((variant) => {
                const parts = [...parentParts];
                if (variant.displayName) {
                    parts.push(variant.displayName);
                }

                stack.push({
                    type: variant.shape,
                    parts,
                    descriptions: variant.description ? [variant.description] : [],
                    visitedTypeIds,
                });
            });
        } else if (unwrapped.shape.type === "discriminatedUnion") {
            visitor(parentParts, [...descriptions, ...unwrapped.descriptions]);

            const discriminant = unwrapped.shape.discriminant;

            unwrapped.shape.variants.forEach((variant) => {
                const parts = [...parentParts, variant.discriminantValue];
                const obj = unwrapDiscriminatedUnionVariant({ discriminant }, variant, types);
                visitor(parts, [...descriptions, ...unwrapped.descriptions, ...obj.descriptions]);
                obj.visitedTypeIds.forEach((typeId) => visitedTypeIds.add(typeId));

                obj.properties.forEach((property) => {
                    stack.push({
                        type: property.valueShape,
                        parts: [...parentParts, property.key],
                        descriptions: property.description ? [property.description] : [],
                        visitedTypeIds,
                    });
                });

                if (obj.extraProperties) {
                    stack.push({
                        type: obj.extraProperties,
                        parts: [...parentParts, "extra"],
                        descriptions: [],
                        visitedTypeIds,
                    });
                }
            });
        } else if (unwrapped.shape.type === "list" || unwrapped.shape.type === "set") {
            stack.push({
                type: unwrapped.shape.itemShape,
                parts: parentParts,
                descriptions,
                visitedTypeIds,
            });
        } else if (unwrapped.shape.type === "map") {
            stack.push({
                type: unwrapped.shape.keyShape,
                parts: [...parentParts, "key"],
                descriptions,
                visitedTypeIds,
            });
            stack.push({
                type: unwrapped.shape.valueShape,
                parts: [...parentParts, "value"],
                descriptions,
                visitedTypeIds,
            });
        } else if (unwrapped.shape.type === "enum") {
            unwrapped.shape.values.forEach((value) => {
                visitor([...parentParts, value.value], value.description ? [value.description] : []);
            });
        }
    }
}
