import type { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { FileIdOrUrl, Frontmatter } from "@fern-api/fdr-sdk/docs";
import { isPlainObject } from "@fern-api/ui-core-utils/isPlainObject";
import { DEFAULT_LOGO_HEIGHT } from "./constants";
import { addLeadingSlash } from "./leading-slash";
import { conformTrailingSlash } from "./trailing-slash";
import { ImageData } from "./types";

export interface LogoConfiguration {
  height: number;
  href: string;
  light: ImageData | undefined;
  dark: ImageData | undefined;
}

export function withLogo(
  definition: FdrAPI.docs.v1.read.DocsDefinition,
  found: FernNavigation.utils.Node.Found,
  frontmatter: Frontmatter | undefined,
  resolveFileSrc: (src: string | undefined) => ImageData | undefined
): LogoConfiguration {
  const height = definition.config.logoHeight;
  const href =
    definition.config.logoHref ??
    encodeURI(
      conformTrailingSlash(
        addLeadingSlash(
          found.landingPage?.canonicalSlug ??
            found.root.slug ??
            found.root.canonicalSlug ??
            found.root.slug
        )
      )
    );

  const frontmatterLogo = getLogoFromFrontmatter(frontmatter);

  const lightDocsYmlLogo =
    definition.config.colorsV3?.type === "light"
      ? definition.config.colorsV3.logo
      : definition.config.colorsV3?.type === "darkAndLight"
        ? definition.config.colorsV3.light.logo
        : undefined;
  const darkDocsYmlLogo =
    definition.config.colorsV3?.type === "dark"
      ? definition.config.colorsV3.logo
      : definition.config.colorsV3?.type === "darkAndLight"
        ? definition.config.colorsV3.dark.logo
        : undefined;

  return {
    height: height ?? DEFAULT_LOGO_HEIGHT,
    href,
    light: resolveFileSrc(frontmatterLogo.light ?? lightDocsYmlLogo),
    dark: resolveFileSrc(frontmatterLogo.dark ?? darkDocsYmlLogo),
  };
}

/**
 * Extracts the logo from the frontmatter, which will override the logo defined in docs.yml
 *
 * @param frontmatter - The frontmatter to extract the logo from.
 * @returns The logo.
 */
function getLogoFromFrontmatter(frontmatter: Frontmatter | undefined): {
  light?: string;
  dark?: string;
} {
  if (frontmatter == null) {
    return { light: undefined, dark: undefined };
  }
  const { logo } = frontmatter;
  const defaultSrc = toSrcValue(logo);
  const lightSrc = isPlainObject(logo) ? toSrcValue(logo.light) : undefined;
  const darkSrc = isPlainObject(logo) ? toSrcValue(logo.dark) : undefined;
  if (lightSrc && darkSrc) {
    return { light: lightSrc, dark: darkSrc };
  }
  const src = lightSrc ?? darkSrc ?? defaultSrc;
  return { light: src, dark: src };
}

/**
 * Checks if a logo definition uses the legacy file ID or URL format.
 */
function isLegacyFileIdOrUrl(logo: unknown | undefined): logo is FileIdOrUrl {
  if (logo == null) {
    return false;
  }
  if (typeof logo !== "object") {
    return false;
  }
  if (!("type" in logo && "value" in logo)) {
    return false;
  }
  if (typeof logo.type !== "string" || typeof logo.value !== "string") {
    return false;
  }
  return logo.type === "fileId" || logo.type === "url";
}

/**
 * Converts a logo definition to a src value.
 *
 * @param unknown - The logo definition to convert.
 * @returns The src value.
 */
function toSrcValue(unknown: unknown): string | undefined {
  if (typeof unknown === "string") {
    return unknown;
  }
  // note: this is a legacy implementation.
  if (isLegacyFileIdOrUrl(unknown)) {
    return unknown.value;
  }
  return undefined;
}
