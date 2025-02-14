import "server-only";

import { compact } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import titleCase from "@fern-api/ui-core-utils/titleCase";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { addLeadingSlash } from "@fern-docs/utils";

import { MdxServerComponentProse } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

import { FernAnchor } from "../../../components/FernAnchor";
import { getAnchorId } from "../../../util/anchor";
import { TypeDefinitionPathPart } from "../context/TypeDefinitionContext";
import { PropertyWrapper } from "../object/PropertyWrapper";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";

export function DiscriminatedUnionVariant({
  loader,
  discriminant,
  unionVariant,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  discriminant: ApiDefinition.PropertyKey;
  unionVariant: ApiDefinition.DiscriminatedUnionVariant;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  const anchorId = getAnchorId(anchorIdParts);

  // const [isActive, setIsActive] = useState(false);
  // const isPaginated = true; // TODO: useIsApiReferencePaginated();
  // useRouteListener(slug, (anchor) => {
  //   const isActive = anchor === anchorId;
  //   setIsActive(isActive);
  //   if (isActive) {
  //     setTimeout(() => {
  //       ref.current?.scrollIntoView({
  //         block: "start",
  //         behavior: isPaginated ? "smooth" : "instant",
  //       });
  //     }, 450);
  //   }
  // });

  const unwrapped = ApiDefinition.unwrapDiscriminatedUnionVariant(
    { discriminant },
    unionVariant,
    types
  );

  const shape = {
    type: "object" as const,
    properties: unwrapped.properties,
    extends: [],
    extraProperties: unwrapped.extraProperties,
  };

  // const contextValue = useTypeDefinitionContext();
  // const newContextValue = useCallback(
  //   (): TypeDefinitionContextValue => ({
  //     ...contextValue,
  //     jsonPropertyPath: [
  //       ...contextValue.jsonPropertyPath,
  //       {
  //         type: "objectFilter",
  //         propertyName: discriminant,
  //         requiredStringValue: unionVariant.discriminantValue,
  //       },
  //     ],
  //   }),
  //   [contextValue, discriminant, unionVariant.discriminantValue]
  // );

  const href = `${addLeadingSlash(slug)}#${anchorId}`;
  const descriptions = compact([
    unionVariant.description,
    ...unwrapped.descriptions,
  ]);
  return (
    <PropertyWrapper id={href} className="flex flex-col gap-2 py-3">
      <TypeDefinitionPathPart
        part={{
          type: "objectFilter",
          propertyName: discriminant,
          requiredStringValue: unionVariant.discriminantValue,
        }}
      >
        <div className="fern-api-property-header">
          <FernAnchor href={href} sideOffset={6}>
            <span className="fern-api-property-key">
              {unionVariant.displayName ??
                titleCase(unionVariant.discriminantValue)}
            </span>
          </FernAnchor>
        </div>

        {unionVariant.availability != null && (
          <AvailabilityBadge
            availability={unionVariant.availability}
            size="sm"
            rounded
          />
        )}
        <div className="flex flex-col">
          <MdxServerComponentProse
            loader={loader}
            mdx={descriptions[0]}
            size="sm"
          />
          <InternalTypeDefinition
            loader={loader}
            shape={shape}
            isCollapsible={true}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        </div>
      </TypeDefinitionPathPart>
    </PropertyWrapper>
  );
}
