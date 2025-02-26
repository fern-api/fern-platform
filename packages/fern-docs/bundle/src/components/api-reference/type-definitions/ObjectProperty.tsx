import "server-only";

import React from "react";

import { compact } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { AvailabilityBadge } from "@fern-docs/components/badges";

import { MdxServerComponentProseSuspense } from "@/mdx/components/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import {
  PropertyContainer,
  TypeDefinitionAnchor,
} from "../endpoints/TypeDefinitionAnchor";
import { PropertyKey } from "./PropertyKey";
import {
  TypeDefinitionAnchorPart,
  TypeDefinitionCollapsible,
} from "./TypeDefinitionContext";
import { TypeReferenceDefinitions } from "./TypeReferenceDefinitions";
import { TypeShorthand } from "./TypeShorthand";

export function ObjectProperty({
  serialize,
  property,
  types,
}: {
  serialize: MdxSerializer;
  property: ApiDefinition.ObjectProperty;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
  const description = compact([
    property.description,
    ...unwrapped.descriptions,
  ])[0];

  return (
    <PropertyWithShape
      serialize={serialize}
      name={property.key}
      availability={property.availability}
      description={description}
      shape={property.valueShape}
      types={types}
    />
  );
}

export function PropertyWithShape({
  serialize,
  name,
  description,
  shape,
  availability,
  types,
}: {
  serialize: MdxSerializer;
  icon?: React.ReactNode;
  name?: string;
  description: string | undefined;
  availability: ApiDefinition.Availability | null | undefined;
  shape: ApiDefinition.TypeShape;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return (
    <PropertyRenderer
      serialize={serialize}
      name={name}
      description={description}
      typeShorthand={<TypeShorthand shape={shape} />}
      availability={availability}
    >
      <TypeReferenceDefinitions
        serialize={serialize}
        shape={shape}
        types={types}
      />
    </PropertyRenderer>
  );
}

export function PropertyRenderer({
  serialize,
  icon,
  name,
  availability,
  description,
  typeShorthand,
  children,
}: {
  icon?: React.ReactNode;
  name?: string;
  description: string | undefined;
  typeShorthand: React.ReactNode;
  availability: ApiDefinition.Availability | null | undefined;
  serialize: MdxSerializer;
  children?: React.ReactNode;
}) {
  const child = (
    <PropertyContainer>
      <TypeDefinitionAnchor sideOffset={6}>
        {icon}
        {name != null && (
          <PropertyKey className="fern-api-property-key">{name}</PropertyKey>
        )}
        {typeShorthand}
        {availability != null && (
          <AvailabilityBadge availability={availability} size="sm" rounded />
        )}
      </TypeDefinitionAnchor>

      <MdxServerComponentProseSuspense
        serialize={serialize}
        mdx={description}
        size="sm"
        className="text-(color:--grayscale-a11)"
      />

      <TypeDefinitionCollapsible>{children}</TypeDefinitionCollapsible>
    </PropertyContainer>
  );

  if (name != null) {
    return (
      <TypeDefinitionAnchorPart part={name}>{child}</TypeDefinitionAnchorPart>
    );
  }

  return child;
}
