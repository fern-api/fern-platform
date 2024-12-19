import type { MarkdownText } from "../docs";
import type { Availability, TypeId } from "../navigation";
import { coalesceAvailability } from "./availability";
import { LARGE_LOOP_TOLERANCE } from "./const";
import type { ObjectProperty, TypeDefinition } from "./latest";
import type { TypeShapeOrReference } from "./types";
import { unwrapObjectType, unwrapReference } from "./unwrap";

/**
 * A path through the type tree, used to identify a type definition.
 *
 * i.e. it may be represented as a jq:
 *
 * - a.b.c.d
 * - a[].b.c
 * - a.b[key].c
 *
 * We collect the true shape of the path here so that the frontend can determine how to render it.
 */
export type KeyPathItem =
    | { type: "meta"; value: string; displayName: string | undefined }
    | { type: "objectProperty"; key: string; optional: boolean | undefined }
    | {
          type: "undiscriminatedUnionVariant";
          displayName: string | undefined;
          idx: number;
      }
    | {
          type: "discriminatedUnionVariant";
          discriminant: string;
          discriminantDisplayName: string | undefined;
          discriminantValue: string;
      }
    | { type: "list" | "set" | "mapValue" | "extra" }
    | { type: "enumValue"; value: string };

export interface TypeDefinitionTreeItem {
    /**
     * The path to the type definition
     */
    path: KeyPathItem[];
    descriptions: MarkdownText[];
    availability: Availability | undefined;
}

interface CollectTypeDefinitionTreeOptions {
    path?: KeyPathItem[];
    availability?: Availability;
    maxDepth?: number;
}

/**
 * This function is intended to be used to generate a tree of all type definitions, and is intended to be used
 * for indexing the type tree and their descriptions into algolia.
 */
export function collectTypeDefinitionTree(
    type: TypeShapeOrReference,
    types: Record<TypeId, TypeDefinition>,
    {
        availability: rootAvailability,
        maxDepth = 5,
        path: rootpath = [],
    }: CollectTypeDefinitionTreeOptions = {}
): TypeDefinitionTreeItem[] {
    const toRet: TypeDefinitionTreeItem[] = [];

    const stack: {
        type: TypeShapeOrReference;
        path: KeyPathItem[];
        descriptions: MarkdownText[];
        availability: Availability | undefined;
        visitedTypeIds: Set<TypeId>;
    }[] = [
        {
            type,
            path: rootpath,
            availability: rootAvailability,
            descriptions: [],
            visitedTypeIds: new Set(),
        },
    ];

    let loop = 0;
    while (stack.length > 0) {
        if (loop++ > LARGE_LOOP_TOLERANCE) {
            // eslint-disable-next-line no-console
            console.error(
                "Infinite loop detected when traversing type definitions"
            );
            break;
        }

        const {
            type: last,
            path: parentpath,
            descriptions: parentDescriptions,
            visitedTypeIds: parentVisitedTypeIds,
            availability: parentAvailability,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        } = stack.pop()!;

        if (parentpath.length > maxDepth) {
            continue;
        }

        const unwrapped = unwrapReference(last, types);

        // the child's availability must be the least stable availability of the parent and the child
        const availability = coalesceAvailability([
            parentAvailability,
            unwrapped.availability,
        ]);
        const descriptions = [...parentDescriptions, ...unwrapped.descriptions];

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

        const visitedTypeIds = new Set([
            ...parentVisitedTypeIds,
            ...unwrapped.visitedTypeIds,
        ]);

        if (unwrapped.shape.type === "object") {
            const obj = unwrapObjectType(unwrapped.shape, types);
            descriptions.push(...obj.descriptions);

            obj.visitedTypeIds.forEach((typeId) => visitedTypeIds.add(typeId));

            obj.properties.forEach((property) => {
                stack.push({
                    type: property.valueShape,
                    path: [
                        ...parentpath,
                        {
                            type: "objectProperty",
                            key: property.key,
                            optional: unwrapReference(
                                property.valueShape,
                                types
                            ).isOptional,
                        },
                    ],
                    descriptions: property.description
                        ? [property.description]
                        : [],
                    visitedTypeIds,
                    availability,
                });
            });

            if (obj.extraProperties) {
                stack.push({
                    type: obj.extraProperties,
                    path: [...parentpath, { type: "extra" }],
                    descriptions: [],
                    visitedTypeIds,
                    availability,
                });
            }
        }

        toRet.push({
            path: parentpath,
            descriptions,
            availability,
        });

        if (unwrapped.shape.type === "undiscriminatedUnion") {
            unwrapped.shape.variants.forEach((variant, idx) => {
                stack.push({
                    type: variant.shape,
                    path: [
                        ...parentpath,
                        {
                            type: "undiscriminatedUnionVariant",
                            displayName: variant.displayName,
                            idx,
                        },
                    ],
                    descriptions: variant.description
                        ? [variant.description]
                        : [],
                    visitedTypeIds,
                    availability: coalesceAvailability([
                        availability,
                        variant.availability,
                    ]),
                });
            });
        } else if (unwrapped.shape.type === "discriminatedUnion") {
            const discriminant = unwrapped.shape.discriminant;

            unwrapped.shape.variants.forEach((variant) => {
                const path: KeyPathItem[] = [
                    ...parentpath,
                    {
                        type: "discriminatedUnionVariant",
                        discriminant,
                        discriminantDisplayName: variant.displayName,
                        discriminantValue: variant.discriminantValue,
                    },
                ];
                stack.push({
                    type: { ...variant, type: "object" },
                    path,
                    descriptions: variant.description
                        ? [variant.description]
                        : [],
                    visitedTypeIds,
                    availability: coalesceAvailability([
                        availability,
                        variant.availability,
                    ]),
                });
            });
        } else if (
            unwrapped.shape.type === "list" ||
            unwrapped.shape.type === "set"
        ) {
            stack.push({
                type: unwrapped.shape.itemShape,
                path: [...parentpath, { type: unwrapped.shape.type }],
                descriptions,
                visitedTypeIds,
                availability,
            });
        } else if (unwrapped.shape.type === "map") {
            stack.push({
                type: unwrapped.shape.valueShape,
                path: [...parentpath, { type: "mapValue" }],
                // we don't need to add the descriptions of the key shape here, but the descriptions from the key are appended here:
                descriptions: [
                    ...descriptions,
                    ...unwrapReference(unwrapped.shape.keyShape, types)
                        .descriptions,
                ],
                visitedTypeIds,
                availability,
            });
        } else if (unwrapped.shape.type === "enum") {
            unwrapped.shape.values.forEach((value) => {
                toRet.push({
                    path: [
                        ...parentpath,
                        { type: "enumValue", value: value.value },
                    ],
                    descriptions: value.description ? [value.description] : [],
                    availability,
                });
            });
        }
    }

    return toRet;
}

export function collectTypeDefinitionTreeForObjectProperty(
    property: ObjectProperty,
    types: Record<TypeId, TypeDefinition>,
    rootPath: KeyPathItem[] = [],
    maxDepth = 5
): TypeDefinitionTreeItem[] {
    return [
        {
            path: [
                ...rootPath,
                {
                    type: "objectProperty",
                    key: property.key,
                    optional: unwrapReference(property.valueShape, types)
                        .isOptional,
                },
            ],
            descriptions: property.description ? [property.description] : [],
            availability: property.availability,
        },
        ...collectTypeDefinitionTree(property.valueShape, types, {
            maxDepth: maxDepth - 1,
            availability: property.availability,
            path: [
                ...rootPath,
                {
                    type: "objectProperty",
                    key: property.key,
                    optional: unwrapReference(property.valueShape, types)
                        .isOptional,
                },
            ],
        }),
    ];
}
