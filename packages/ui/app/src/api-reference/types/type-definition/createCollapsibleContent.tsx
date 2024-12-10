import {
    TypeDefinition,
    TypeId,
    TypeShapeOrReference,
    unwrapObjectType,
    unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { ReactElement } from "react";
import { Chip } from "../../../components/Chip";
import { AnchorProvider } from "../../endpoints/AnchorIdParts";
import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { ObjectProperty } from "../object/ObjectProperty";
import { UndiscriminatedUnionVariant } from "../undiscriminated-union/UndiscriminatedUnionVariant";

interface CollapsibleContent {
    elements: ReactElement[];
    elementNameSingular: string;
    elementNamePlural: string;
    separatorText?: string;
}

export function createCollapsibleContent(
    shape: TypeShapeOrReference,
    types: Record<TypeId, TypeDefinition>,
    // anchorIdParts: readonly string[],
    // slug: Slug,
): CollapsibleContent | undefined {
    const unwrapped = unwrapReference(shape, types);

    switch (unwrapped.shape.type) {
        case "discriminatedUnion": {
            const union = unwrapped.shape;
            return {
                elements: union.variants.map((variant) => (
                    <AnchorProvider key={variant.discriminantValue} parts={variant.discriminantValue}>
                        <DiscriminatedUnionVariant
                            discriminant={union.discriminant}
                            unionVariant={variant}
                            types={types}
                        />
                    </AnchorProvider>
                )),
                elementNameSingular: "variant",
                elementNamePlural: "variants",
                separatorText: "OR",
            };
        }
        case "enum": {
            return {
                elements: unwrapped.shape.values.map((enumValue) => (
                    <Chip key={enumValue.value} name={enumValue.value} description={enumValue.description} />
                    // <EnumValue key={enumValue.value} enumValue={enumValue} />
                )),
                elementNameSingular: "enum value",
                elementNamePlural: "enum values",
            };
        }
        case "object": {
            const { properties } = unwrapObjectType(unwrapped.shape, types);
            return {
                elements: properties.map((property) => (
                    <AnchorProvider key={property.key} parts={property.key}>
                        <ObjectProperty property={property} types={types} applyErrorStyles />
                    </AnchorProvider>
                )),
                elementNameSingular: "property",
                elementNamePlural: "properties",
            };
        }
        case "undiscriminatedUnion": {
            return {
                elements: unwrapped.shape.variants.map((variant, variantIdx) => (
                    <AnchorProvider key={variantIdx} parts={variant.displayName ?? variantIdx.toString()}>
                        <UndiscriminatedUnionVariant
                            unionVariant={variant}
                            applyErrorStyles={false}
                            idx={variantIdx}
                            types={types}
                        />
                    </AnchorProvider>
                )),
                elementNameSingular: "variant",
                elementNamePlural: "variants",
                separatorText: "OR",
            };
        }
        default:
            return undefined;
    }
}
