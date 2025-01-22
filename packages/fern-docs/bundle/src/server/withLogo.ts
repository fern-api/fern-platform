import type { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { ImageData, LogoConfiguration } from "@fern-docs/ui";
import { addLeadingSlash } from "@fern-docs/utils";
import { conformTrailingSlash } from "./trailingSlash";

export function withLogo(
  definition: FdrAPI.docs.v1.read.DocsDefinition,
  found: FernNavigation.utils.Node.Found,
  resolveFileSrc: (
    fileId: FernNavigation.FileId | undefined
  ) => ImageData | undefined
): LogoConfiguration {
  const height = definition.config.logoHeight;
  const href =
    definition.config.logoHref ??
    encodeURI(
      conformTrailingSlash(
        addLeadingSlash(found.root.canonicalSlug ?? found.root.slug)
      )
    );

  const light = resolveFileSrc(
    definition.config.colorsV3?.type === "light"
      ? definition.config.colorsV3.logo
      : definition.config.colorsV3?.type === "darkAndLight"
        ? definition.config.colorsV3.light.logo
        : undefined
  );
  const dark = resolveFileSrc(
    definition.config.colorsV3?.type === "dark"
      ? definition.config.colorsV3.logo
      : definition.config.colorsV3?.type === "darkAndLight"
        ? definition.config.colorsV3.dark.logo
        : undefined
  );

  return {
    height,
    href,
    light,
    dark,
  };
}
