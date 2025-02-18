import "server-only";

import { ReactElement } from "react";
import React from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { MdxSerializer } from "@/server/mdx-serializer";

import { PropertyWithShape } from "./ObjectProperty";

type IconInfo = {
  content: string;
  size: number;
};

function getIconInfoForTypeReference(
  typeRef: ApiDefinition.TypeShapeOrReference,
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
): IconInfo | null {
  return visitDiscriminatedUnion(
    ApiDefinition.unwrapReference(typeRef, types).shape
  )._visit<IconInfo | null>({
    primitive: (primitive) =>
      visitDiscriminatedUnion(primitive.value, "type")._visit<IconInfo | null>({
        string: () => ({ content: "abc", size: 6 }),
        boolean: () => ({ content: "true", size: 6 }),
        integer: () => ({ content: "123", size: 6 }),
        uint: () => ({ content: "123", size: 6 }),
        uint64: () => ({ content: "123", size: 6 }),
        double: () => ({ content: "1.2", size: 6 }),
        long: () => ({ content: "123", size: 6 }),
        datetime: () => ({ content: "abc", size: 6 }),
        uuid: () => ({ content: "abc", size: 6 }),
        base64: () => ({ content: "abc", size: 6 }),
        date: () => ({ content: "abc", size: 6 }),
        bigInteger: () => ({ content: "123", size: 6 }),
        _other: () => null,
      }),
    literal: () => ({ content: "!", size: 6 }),
    object: () => null,
    undiscriminatedUnion: () => null,
    discriminatedUnion: () => null,
    enum: () => null,
    list: (list) => getIconInfoForTypeReference(list.itemShape, types),
    set: (set) => getIconInfoForTypeReference(set.itemShape, types),
    map: () => ({ content: "{}", size: 9 }),
    unknown: () => ({ content: "{}", size: 6 }),
    _other: () => null,
  });
}

function getIconForTypeReference(
  typeRef: ApiDefinition.TypeShapeOrReference,
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
): ReactElement<any> | null {
  const info = getIconInfoForTypeReference(typeRef, types);
  if (info == null) {
    return null;
  }
  const { content, size } = info;
  return (
    <div
      className="border-default flex size-6 items-center justify-center self-center rounded border"
      style={{ fontSize: size }}
    >
      {content}
    </div>
  );
}

export declare namespace UndiscriminatedUnionVariant {
  export interface Props {
    unionVariant: ApiDefinition.UndiscriminatedUnionVariant;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
    idx: number;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
  }
}

export function UndiscriminatedUnionVariant({
  serialize,
  unionVariant,
  types,
}: {
  serialize: MdxSerializer;
  unionVariant: ApiDefinition.UndiscriminatedUnionVariant;
  idx: number;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  return (
    <PropertyWithShape
      serialize={serialize}
      icon={getIconForTypeReference(unionVariant.shape, types)}
      name={unionVariant.displayName}
      availability={unionVariant.availability}
      description={unionVariant.description}
      shape={unionVariant.shape}
      types={types}
    />
  );
}
