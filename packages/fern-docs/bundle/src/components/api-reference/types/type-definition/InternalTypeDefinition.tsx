import "server-only";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";


import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { FernCollapseWithButtonUncontrolled } from "./FernCollapseWithButtonUncontrolled";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";
import { createCollapsibleContent } from "./createCollapsibleContent";
import { MdxSerializer } from "@/server/mdx-serializer";

export declare namespace InternalTypeDefinition {
  export interface Props {
    shape: ApiDefinition.TypeShapeOrReference;
    isCollapsible: boolean;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
  }
}

export function InternalTypeDefinition({
  serialize,
  shape,
  isCollapsible,
  anchorIdParts,
  slug,
  types,
}: {
  serialize: MdxSerializer;
  shape: ApiDefinition.TypeShapeOrReference;
  isCollapsible: boolean;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  const collapsableContent = createCollapsibleContent(
    serialize,
    shape,
    types,
    anchorIdParts,
    slug
  );

  if (collapsableContent == null || collapsableContent.elements.length === 0) {
    return null;
  }

  const showText =
    collapsableContent.elements.length === 1
      ? `Show ${collapsableContent.elementNameSingular}`
      : `Show ${collapsableContent.elements.length} ${collapsableContent.elementNamePlural}`;
  const hideText =
    collapsableContent.elements.length === 1
      ? `Hide ${collapsableContent.elementNameSingular}`
      : `Hide ${collapsableContent.elements.length} ${collapsableContent.elementNamePlural}`;

  return (
    <FernCollapseWithButtonUncontrolled
      isCollapsible={isCollapsible}
      showText={showText}
      hideText={hideText}
    >
      {collapsableContent.elementNameSingular?.includes("enum") ? (
        <EnumTypeDefinition
          elements={collapsableContent.elements}
          showText={showText}
        />
      ) : (
        <TypeDefinitionDetails
          elements={collapsableContent.elements}
          separatorText={collapsableContent.separatorText}
        />
      )}
    </FernCollapseWithButtonUncontrolled>
  );
}
