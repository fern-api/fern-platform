import { PropertyKey, TypeDefinition, TypeId, TypeReference } from "../latest";
import { TypeShapeOrReference } from "../types";
import { unwrapObjectType, unwrapReference } from "../unwrap";

const PRIMITIVE_SHAPE: TypeShapeOrReference = {
    type: "primitive" as const,
    value: {
        type: "string",
        regex: undefined,
        minLength: undefined,
        maxLength: undefined,
        default: undefined,
    },
};

describe("unwrapReference", () => {
    it("should noop for a non-reference", () => {
        expect(unwrapReference(PRIMITIVE_SHAPE, {})).toStrictEqual({
            shape: PRIMITIVE_SHAPE,
            availability: undefined,
            descriptions: [],
            isOptional: false,
            default: undefined,
        });
    });

    it("should unwrap a reference", () => {
        const shape: TypeShapeOrReference = {
            type: "id",
            id: TypeId("foo"),
            default: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("foo")]: {
                name: "foo",
                shape: { type: "alias", value: PRIMITIVE_SHAPE },
                description: undefined,
                availability: undefined,
            },
        };
        expect(unwrapReference(shape, types)).toStrictEqual({
            shape: PRIMITIVE_SHAPE,
            availability: undefined,
            descriptions: [],
            isOptional: false,
            default: undefined,
        });
    });

    it("should unwrap to unknown", () => {
        const shape: TypeShapeOrReference = {
            type: "id",
            id: TypeId("foo"),
            default: undefined,
        };
        expect(unwrapReference(shape, {})).toStrictEqual({
            shape: {
                type: "unknown",
                displayName: undefined,
            },
            availability: undefined,
            descriptions: [],
            isOptional: false,
            default: undefined,
        });
    });

    it("should unwrap optionals", () => {
        const shape: TypeShapeOrReference = {
            type: "id",
            id: TypeId("foo"),
            default: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("foo")]: {
                name: "foo",
                shape: {
                    type: "alias",
                    value: {
                        type: "optional",
                        shape: {
                            type: "alias",
                            value: PRIMITIVE_SHAPE,
                        },
                        default: undefined,
                    },
                },
                description: undefined,
                availability: undefined,
            },
        };
        expect(unwrapReference(shape, types)).toStrictEqual({
            shape: PRIMITIVE_SHAPE,
            availability: undefined,
            descriptions: [],
            isOptional: true,
            default: undefined,
        });
    });

    it("should unwrap optionals with defaults", () => {
        const shape: TypeShapeOrReference = {
            type: "id",
            id: TypeId("foo"),
            default: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("foo")]: {
                name: "foo",
                shape: {
                    type: "alias",
                    value: {
                        type: "optional",
                        shape: {
                            type: "alias",
                            value: PRIMITIVE_SHAPE,
                        },
                        default: "testing-a",
                    },
                },
                description: undefined,
                availability: undefined,
            },
        };
        expect(unwrapReference(shape, types).default).toBe("testing-a");
    });

    it("should prefer shallowest default value", () => {
        const shape: TypeShapeOrReference = {
            type: "optional",
            shape: {
                type: "alias",
                value: {
                    type: "id",
                    id: TypeId("foo"),
                    default: undefined,
                },
            },
            default: "testing-b",
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("foo")]: {
                name: "foo",
                shape: {
                    type: "alias",
                    value: {
                        type: "optional",
                        shape: {
                            type: "alias",
                            value: PRIMITIVE_SHAPE,
                        },
                        default: "testing-a", // this should be ignored
                    },
                },
                description: undefined,
                availability: undefined,
            },
        };
        expect(unwrapReference(shape, types).default).toBe("testing-b");
    });

    it("should return unknown on infinite circular reference", () => {
        const shape: TypeReference = {
            type: "id",
            id: TypeId("foo"),
            default: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("foo")]: {
                name: "foo",
                shape: { type: "alias", value: shape },
                description: undefined,
                availability: undefined,
            },
        };
        expect(unwrapReference(shape, types).shape.type).toBe("unknown");
    });

    it("should return the least stable availability level, and collect all descriptions", () => {
        const shape: TypeShapeOrReference = {
            type: "id",
            id: TypeId("a"),
            default: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("a")]: {
                name: "a",
                shape: {
                    type: "alias",
                    value: { type: "id", id: TypeId("b"), default: undefined },
                },
                description: "a",
                availability: "Stable",
            },
            [TypeId("b")]: {
                name: "b",
                shape: {
                    type: "alias",
                    value: {
                        type: "optional",
                        shape: {
                            type: "alias",
                            value: { type: "id", id: TypeId("c"), default: undefined },
                        },
                        default: undefined,
                    },
                },
                description: "b",
                availability: "Deprecated",
            },
            [TypeId("c")]: {
                name: "c",
                shape: { type: "alias", value: PRIMITIVE_SHAPE },
                description: "c",
                availability: "InDevelopment",
            },
        };
        const unwrapped = unwrapReference(shape, types);
        expect(unwrapped.shape).toStrictEqual(PRIMITIVE_SHAPE);
        expect(unwrapped.availability).toBe("Deprecated");
        expect(unwrapped.descriptions).toStrictEqual(["a", "b", "c"]);
        expect(unwrapped.isOptional).toBe(true);
    });

    it("should unwrap default value of enums", () => {
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("a")]: {
                name: "a",
                shape: {
                    type: "enum",
                    values: [
                        { value: "a", description: undefined, availability: undefined },
                        { value: "b", description: undefined, availability: undefined },
                    ],
                    default: "a",
                },
                description: undefined,
                availability: undefined,
            },
        };

        expect(
            unwrapReference(
                {
                    type: "id",
                    id: TypeId("a"),
                    default: undefined,
                },
                types,
            ).default,
        ).toBe("a");

        expect(
            unwrapReference(
                {
                    type: "id",
                    id: TypeId("a"),
                    // this default overrides the default set by the enum:
                    default: {
                        type: "enum",
                        value: "b",
                    },
                },
                types,
            ).default,
        ).toBe("b");
    });
});

describe("unwrapObjectType", () => {
    it("should unwrap and sort required before optionals, and preserve order otherwise", () => {
        const shape: TypeShapeOrReference = {
            type: "object",
            extends: [],
            properties: [
                {
                    key: PropertyKey("d"),
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: PRIMITIVE_SHAPE,
                            },
                            default: undefined,
                        },
                    },
                    description: undefined,
                    availability: undefined,
                },
                {
                    key: PropertyKey("a"),
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: PRIMITIVE_SHAPE,
                            },
                            default: undefined,
                        },
                    },
                    description: undefined,
                    availability: undefined,
                },
                {
                    key: PropertyKey("c"),
                    valueShape: {
                        type: "alias",
                        value: PRIMITIVE_SHAPE,
                    },
                    description: undefined,
                    availability: undefined,
                },
                {
                    key: PropertyKey("b"),
                    valueShape: {
                        type: "alias",
                        value: PRIMITIVE_SHAPE,
                    },
                    description: undefined,
                    availability: undefined,
                },
            ],
            extraProperties: undefined,
        };

        expect(unwrapObjectType(shape, {}).properties.map((p) => p.key)).toStrictEqual([
            PropertyKey("c"),
            PropertyKey("b"),
            PropertyKey("d"),
            PropertyKey("a"),
        ]);
    });

    it("should unwrap extended objects", () => {
        const shape: TypeShapeOrReference = {
            type: "object",
            extends: [TypeId("c"), TypeId("b")],
            properties: [
                {
                    key: PropertyKey("a"),
                    valueShape: {
                        type: "alias",
                        value: PRIMITIVE_SHAPE,
                    },
                    description: undefined,
                    availability: undefined,
                },
                {
                    key: PropertyKey("d"),
                    valueShape: {
                        type: "alias",
                        value: {
                            type: "optional",
                            shape: {
                                type: "alias",
                                value: PRIMITIVE_SHAPE,
                            },
                            default: undefined,
                        },
                    },
                    description: undefined,
                    availability: undefined,
                },
            ],
            extraProperties: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("b")]: {
                name: "b",
                shape: {
                    type: "object",
                    extends: [],
                    properties: [
                        {
                            key: PropertyKey("b"),
                            valueShape: {
                                type: "alias",
                                value: PRIMITIVE_SHAPE,
                            },
                            description: undefined,
                            availability: undefined,
                        },
                    ],
                    extraProperties: undefined,
                },
                description: undefined,
                availability: undefined,
            },
            [TypeId("c")]: {
                name: "c",
                shape: {
                    type: "object",
                    extends: [],
                    properties: [
                        {
                            key: PropertyKey("c"),
                            valueShape: {
                                type: "alias",
                                value: PRIMITIVE_SHAPE,
                            },
                            description: undefined,
                            availability: undefined,
                        },
                    ],
                    extraProperties: undefined,
                },
                description: undefined,
                availability: undefined,
            },
        };
        expect(unwrapObjectType(shape, types).properties.map((p) => p.key)).toStrictEqual([
            PropertyKey("a"),
            PropertyKey("b"),
            PropertyKey("c"),
            PropertyKey("d"),
        ]);
    });

    it("should mark properties of optional extended objects as optional", () => {
        const shape: TypeShapeOrReference = {
            type: "object",
            extends: [TypeId("b")],
            properties: [
                {
                    key: PropertyKey("a"),
                    valueShape: {
                        type: "alias",
                        value: PRIMITIVE_SHAPE,
                    },
                    description: undefined,
                    availability: undefined,
                },
            ],
            extraProperties: undefined,
        };
        const types: Record<TypeId, TypeDefinition> = {
            [TypeId("b")]: {
                name: "b",
                shape: {
                    type: "alias",
                    value: {
                        type: "optional",
                        shape: {
                            type: "alias",
                            value: {
                                type: "id",
                                id: TypeId("c"),
                                default: undefined,
                            },
                        },
                        default: undefined,
                    },
                },
                description: "description-1",
                availability: "GenerallyAvailable",
            },
            [TypeId("c")]: {
                name: "b",
                shape: {
                    type: "object",
                    extends: [],
                    properties: [
                        {
                            key: PropertyKey("b"),
                            valueShape: {
                                type: "alias",
                                value: {
                                    type: "optional",
                                    shape: {
                                        type: "alias",
                                        value: PRIMITIVE_SHAPE,
                                    },
                                    default: undefined,
                                },
                            },
                            description: undefined,
                            availability: "Deprecated",
                        },
                        {
                            key: PropertyKey("c"),
                            valueShape: {
                                type: "alias",
                                value: PRIMITIVE_SHAPE,
                            },
                            description: undefined,
                            availability: undefined,
                        },
                    ],
                    extraProperties: undefined,
                },
                description: "description-2",
                availability: undefined,
            },
        };

        const unwrapped = unwrapObjectType(shape, types);

        expect(unwrapped.properties).toStrictEqual([
            {
                key: PropertyKey("a"),
                valueShape: PRIMITIVE_SHAPE,
                description: undefined,
                availability: undefined,
            },
            {
                key: PropertyKey("c"),
                valueShape: {
                    type: "optional",
                    shape: PRIMITIVE_SHAPE,
                    default: undefined,
                },
                description: undefined,
                // availability is the least stable of the extended object
                availability: "GenerallyAvailable",
            },
            {
                key: PropertyKey("b"),
                valueShape: {
                    type: "optional",
                    shape: PRIMITIVE_SHAPE,
                    default: undefined,
                },
                description: undefined,
                // availability is the least stable of the extended object
                // and Deprecated is sorted after GenerallyAvailable
                availability: "Deprecated",
            },
        ]);

        expect(unwrapped.descriptions).toStrictEqual(["description-1", "description-2"]);
    });
});
