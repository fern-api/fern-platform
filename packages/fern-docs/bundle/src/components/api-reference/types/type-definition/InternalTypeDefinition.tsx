import "server-only";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";

import { DocsLoader } from "@/server/docs-loader";

import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { FernCollapseWithButtonUncontrolled } from "./FernCollapseWithButtonUncontrolled";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";
import { createCollapsibleContent } from "./createCollapsibleContent";

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
  loader,
  shape,
  isCollapsible,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  shape: ApiDefinition.TypeShapeOrReference;
  isCollapsible: boolean;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  const collapsableContent = createCollapsibleContent(
    loader,
    shape,
    types,
    anchorIdParts,
    slug
  );

  // const anchorIdSoFar = getAnchorId(anchorIdParts);
  // const {
  //   value: isCollapsed,
  //   toggleValue: toggleIsCollapsed,
  //   setValue: setCollapsed,
  // } = useBooleanState(true);

  // useRouteListener(slug, (anchor) => {
  //   const isActive = anchor?.startsWith(anchorIdSoFar + ".") ?? false;
  //   if (isActive) {
  //     setCollapsed(false);
  //   }
  // });

  // const { isHovering, ...containerCallbacks } = useIsHovering();

  // const contextValue = useTypeDefinitionContext();
  // const collapsibleContentContextValue = useCallback(
  //   (): TypeDefinitionContextValue => ({
  //     ...contextValue,
  //     isRootTypeDefinition: false,
  //   }),
  //   [contextValue]
  // );

  if (collapsableContent == null || collapsableContent.elements.length === 0) {
    return null;
  }

  if (!isCollapsible) {
    // TODO: (rohin) Refactor this
    // if (collapsableContent.elementNameSingular === "literal") {
    //     return null;
    // }
    return (
      <TypeDefinitionDetails
        elements={collapsableContent.elements}
        separatorText={collapsableContent.separatorText}
      />
    );
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
    <div
      className={cn(
        "internal-type-definition-container text-sm",
        collapsableContent.elementNameSingular === "enum value"
          ? "enum-container"
          : undefined
      )}
    >
      {collapsableContent.elementNameSingular !== "enum value" ? (
        collapsableContent.elements.length === 0 ? null : (
          <FernCollapseWithButtonUncontrolled
            showText={showText}
            hideText={hideText}
          >
            <TypeDefinitionDetails
              elements={collapsableContent.elements}
              separatorText={collapsableContent.separatorText}
            />
          </FernCollapseWithButtonUncontrolled>
        )
      ) : (
        <EnumTypeDefinition
          elements={collapsableContent.elements}
          showText={showText}
        />
      )}
    </div>
  );
}
