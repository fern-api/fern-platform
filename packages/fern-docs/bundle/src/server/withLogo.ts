import type { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { FileIdOrUrl, Frontmatter, Logo } from "@fern-api/fdr-sdk/docs";
import type { ImageData, LogoConfiguration } from "@fern-docs/ui";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";

export function withLogo(
  definition: FdrAPI.docs.v1.read.DocsDefinition,
  found: FernNavigation.utils.Node.Found,
  frontmatter: Frontmatter | undefined,
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

  const frontmatterLogo = getLogoFromFrontmatter(frontmatter);

  const light =
    frontmatterLogo.light?.type === "url"
      ? { src: frontmatterLogo.light.value }
      : frontmatterLogo.light?.type === "fileId"
        ? resolveFileSrc(frontmatterLogo.light.value)
        : resolveFileSrc(
            definition.config.colorsV3?.type === "light"
              ? definition.config.colorsV3.logo
              : definition.config.colorsV3?.type === "darkAndLight"
                ? definition.config.colorsV3.light.logo
                : undefined
          );
  const dark =
    frontmatterLogo.dark?.type === "url"
      ? { src: frontmatterLogo.dark.value }
      : frontmatterLogo.dark?.type === "fileId"
        ? resolveFileSrc(frontmatterLogo.dark.value)
        : resolveFileSrc(
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

function getLogoFromFrontmatter(frontmatter: Frontmatter | undefined): {
  light?: FileIdOrUrl;
  dark?: FileIdOrUrl;
} {
  if (frontmatter == null) {
    return { light: undefined, dark: undefined };
  }
  const { logo } = frontmatter;
  if (logo != null && typeof logo === "object") {
    if (
      "light" in logo &&
      "dark" in logo &&
      isFileIdOrUrl(logo.light) &&
      isFileIdOrUrl(logo.dark)
    ) {
      return { light: logo.light, dark: logo.dark };
    }
    if ("light" in logo && isFileIdOrUrl(logo.light)) {
      return { light: logo.light, dark: logo.light };
    }
    if ("dark" in logo && isFileIdOrUrl(logo.dark)) {
      return { light: logo.dark, dark: logo.dark };
    }
    if (isFileIdOrUrl(logo)) {
      return { light: logo, dark: logo };
    }
  }
  return { light: undefined, dark: undefined };
}

function isFileIdOrUrl(logo: Logo | undefined): logo is FileIdOrUrl {
  if (logo == null) {
    return false;
  }
  if (typeof logo !== "object") {
    return false;
  }
  if (!("type" in logo && "value" in logo)) {
    return false;
  }
  return logo.type === "fileId" || logo.type === "url";
}
