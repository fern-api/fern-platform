import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-platform/core-utils";
import { once } from "lodash-es";
import { serializeMdx } from "../mdx/bundler";
import { FernSerializeMdxOptions } from "../mdx/types";
import {
    NonOptionalTypeShapeWithReference,
    ResolvedObjectProperty,
    ResolvedReferenceShape,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
} from "./types";

export class ApiTypeResolver {
    public constructor(
        private types: Record<string, APIV1Read.TypeDefinition>,
        private mdxOptions: FernSerializeMdxOptions | undefined,
    ) {}

    public resolve = once(async (): Promise<Record<string, ResolvedTypeDefinition>> => {
        return Object.fromEntries(
            await Promise.all(
                Object.entries(this.types).map(async ([key, value]) => {
                    return [key, await this.resolveTypeDefinition(value)];
                }),
            ),
        );
    });

    public resolveTypeDefinition(typeDefinition: APIV1Read.TypeDefinition): Promise<ResolvedTypeDefinition> {
        return this.resolveTypeShape(
            typeDefinition.name,
            typeDefinition.shape,
            typeDefinition.description,
            typeDefinition.availability,
        );
    }

    public resolveTypeShape(
        name: string | undefined,
        typeShape: APIV1Read.TypeShape,
        description?: string,
        availability?: APIV1Read.Availability,
    ): Promise<ResolvedTypeDefinition> {
        return visitDiscriminatedUnion(typeShape, "type")._visit<Promise<ResolvedTypeDefinition>>({
            object: async (object) => ({
                type: "object",
                name,
                extends: object.extends,
                properties: await this.resolveObjectProperties(object),
                description: await serializeMdx(description, {
                    files: this.mdxOptions?.files,
                }),
                availability,
            }),
            enum: async (enum_) => ({
                type: "enum",
                name,
                values: await Promise.all(
                    enum_.values.map(async (enumValue) => ({
                        value: enumValue.value,
                        description: await serializeMdx(enumValue.description, {
                            files: this.mdxOptions?.files,
                        }),
                        availability: undefined,
                    })),
                ),
                description: await serializeMdx(description, {
                    files: this.mdxOptions?.files,
                }),
                availability,
                default: enum_.default,
            }),
            undiscriminatedUnion: async (undiscriminatedUnion) => ({
                type: "undiscriminatedUnion",
                name,
                variants: await Promise.all(
                    undiscriminatedUnion.variants.map(async (variant) => ({
                        displayName: variant.displayName,
                        shape: await this.resolveTypeReference(variant.type),
                        description: await serializeMdx(variant.description, {
                            files: this.mdxOptions?.files,
                        }),
                        availability: variant.availability,
                    })),
                ),
                description: await serializeMdx(description, {
                    files: this.mdxOptions?.files,
                }),
                availability,
            }),
            alias: async (alias) => ({
                type: "alias",
                name,
                shape: await this.resolveTypeReference(alias.value),
                description: await serializeMdx(description, {
                    files: this.mdxOptions?.files,
                }),
                availability,
            }),
            discriminatedUnion: async (discriminatedUnion) => {
                return {
                    type: "discriminatedUnion",
                    name,
                    discriminant: discriminatedUnion.discriminant,
                    variants: await Promise.all(
                        discriminatedUnion.variants.map(async (variant) => ({
                            discriminantValue: variant.discriminantValue,
                            extends: variant.additionalProperties.extends,
                            properties: await this.resolveObjectProperties(variant.additionalProperties),
                            description: await serializeMdx(variant.description, {
                                files: this.mdxOptions?.files,
                            }),
                            displayName: variant.displayName,
                            availability: variant.availability,
                        })),
                    ),
                    description: await serializeMdx(description, {
                        files: this.mdxOptions?.files,
                    }),
                    availability,
                };
            },
            _other: () =>
                Promise.resolve({
                    type: "unknown",
                    availability: undefined,
                    description: undefined,
                }),
        });
    }

    private typeRefCache = new WeakMap<APIV1Read.TypeReference, Promise<ResolvedTypeShape>>();

    public resolveTypeReference(typeReference: APIV1Read.TypeReference): Promise<ResolvedTypeShape> {
        const cached = this.typeRefCache.get(typeReference);
        if (cached) {
            return cached;
        }
        const uncached = Promise.resolve(
            visitDiscriminatedUnion(typeReference, "type")._visit<ResolvedTypeShape | Promise<ResolvedTypeShape>>({
                literal: (literal) => ({
                    type: "literal",
                    value: literal.value,
                    description: undefined,
                    availability: undefined,
                }),
                unknown: (unknown) => ({
                    ...unknown,
                    availability: undefined,
                    description: undefined,
                }),
                optional: async (optional) => ({
                    type: "optional",
                    shape: await this.unwrapOptionalRaw(await this.resolveTypeReference(optional.itemType)),
                    availability: undefined,
                    description: undefined,
                }),
                list: async (list) => ({
                    type: "list",
                    shape: await this.resolveTypeReference(list.itemType),
                    availability: undefined,
                    description: undefined,
                }),
                set: async (set) => ({
                    type: "set",
                    shape: await this.resolveTypeReference(set.itemType),
                    availability: undefined,
                    description: undefined,
                }),
                map: async (map) => ({
                    type: "map",
                    keyShape: await this.resolveTypeReference(map.keyType),
                    valueShape: await this.resolveTypeReference(map.valueType),
                    availability: undefined,
                    description: undefined,
                }),
                id: ({ value: typeId }): ResolvedReferenceShape | APIV1Read.TypeReference.Unknown => {
                    const typeDefinition = this.types[typeId];
                    if (typeDefinition == null) {
                        return { type: "unknown" };
                    }
                    return { type: "reference", typeId };
                },
                primitive: (primitive) => ({
                    type: "primitive",
                    value: primitive.value,
                    description: undefined,
                    availability: undefined,
                }),
                _other: () => ({ type: "unknown", availability: undefined, description: undefined }),
            }),
        );
        this.typeRefCache.set(typeReference, uncached);
        return uncached;
    }

    public resolveObjectProperties(object: APIV1Read.ObjectType): Promise<ResolvedObjectProperty[]> {
        return Promise.all(
            object.properties.map(async (property): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.resolveTypeReference(property.valueType),
                    serializeMdx(property.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: property.key,
                    valueShape,
                    description,
                    availability: property.availability,
                    hidden: false,
                };
            }),
        );
    }

    private async unwrapOptionalRaw(shape: ResolvedTypeShape): Promise<NonOptionalTypeShapeWithReference> {
        if (shape.type === "optional") {
            return this.unwrapOptionalRaw(shape.shape);
        }
        return shape;
    }

    public getTypes(): Record<string, APIV1Read.TypeDefinition> {
        return this.types;
    }
}
