import "server-only";

import { UnreachableCaseError } from "ts-essentials";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

import { MdxSerializer } from "@/server/mdx-serializer";

import { DiscriminatedUnionVariant } from "./DiscriminatedUnionVariant";
import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { EnumValue } from "./EnumValue";
import { FernCollapseWithButtonUncontrolled } from "./FernCollapseWithButtonUncontrolled";
import { ObjectProperty } from "./ObjectProperty";
import { TypeDefinitionPathPart } from "./TypeDefinitionContext";
import { WithSeparator } from "./TypeDefinitionDetails";
import { UndiscriminatedUnionVariant } from "./UndiscriminatedUnionVariant";

export declare namespace InternalTypeDefinition {
  export interface Props {
    shape: ApiDefinition.TypeShapeOrReference;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
  }
}

export function InternalTypeDefinition({
  serialize,
  shape,
  types,
}: {
  serialize: MdxSerializer;
  shape:
    | ApiDefinition.TypeShape.Enum
    | ApiDefinition.TypeShape.UndiscriminatedUnion
    | ApiDefinition.TypeShape.DiscriminatedUnion
    | ApiDefinition.TypeShape.Object_
    | ApiDefinition.TypeReference.Primitive;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  switch (shape.type) {
    case "enum": {
      return (
        <EnumTypeDefinition
          elements={shape.values.map((value) => (
            <EnumValue
              key={value.value}
              serialize={serialize}
              enumValue={value}
            />
          ))}
        />
      );
    }
    case "undiscriminatedUnion":
      return (
        <FernCollapseWithButtonUncontrolled
          showText={`Show ${shape.variants.length} variants`}
          hideText={`Hide ${shape.variants.length} variants`}
        >
          <WithSeparator separatorText="OR">
            {shape.variants.map((variant, idx) => (
              <UndiscriminatedUnionVariant
                serialize={serialize}
                key={variant.displayName}
                unionVariant={variant}
                idx={idx}
                types={types}
              />
            ))}
          </WithSeparator>
        </FernCollapseWithButtonUncontrolled>
      );
    case "discriminatedUnion":
      return (
        <FernCollapseWithButtonUncontrolled
          showText={`Show ${shape.variants.length} variants`}
          hideText={`Hide ${shape.variants.length} variants`}
        >
          <WithSeparator separatorText="OR">
            {shape.variants.map((variant) => (
              <DiscriminatedUnionVariant
                discriminant={shape.discriminant}
                serialize={serialize}
                key={variant.displayName}
                unionVariant={variant}
                types={types}
              />
            ))}
          </WithSeparator>
        </FernCollapseWithButtonUncontrolled>
      );
    case "object": {
      const properties = ApiDefinition.unwrapObjectType(
        shape,
        types
      ).properties;
      return (
        <FernCollapseWithButtonUncontrolled
          showText={`Show ${properties.length} properties`}
          hideText={`Hide ${properties.length} properties`}
        >
          <WithSeparator>
            {properties.map((property) => (
              <TypeDefinitionPathPart
                key={property.key}
                part={{ type: "objectProperty", propertyName: property.key }}
              >
                <ObjectProperty
                  property={property}
                  types={types}
                  serialize={serialize}
                />
              </TypeDefinitionPathPart>
            ))}
          </WithSeparator>
        </FernCollapseWithButtonUncontrolled>
      );
    }
    case "primitive":
      return null;
    default:
      throw new UnreachableCaseError(shape);
  }
}
