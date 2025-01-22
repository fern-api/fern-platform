import type { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { FileIdOrUrl, Frontmatter, Logo } from "@fern-api/fdr-sdk/docs";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";
import { atom } from "jotai";
import { selectAtom } from "jotai/utils";
import { DOCS_ATOM } from "./docs";
import { EDGE_FLAGS_ATOM } from "./flags";
import { BASEPATH_ATOM } from "./navigation";
import { ImageData } from "./types";

export const LOGO_TEXT_ATOM = atom<string | undefined>((get) =>
  get(EDGE_FLAGS_ATOM).isDocsLogoTextEnabled ? "docs" : undefined
);

const INTERNAL_LOGO_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.logo, isEqual);

interface LogoConfiguration {
  href: string;
  height: number;
  light: ImageData | undefined;
  dark: ImageData | undefined;
}

export const LOGO_ATOM = atom<LogoConfiguration>((get) => {
  const logo = get(INTERNAL_LOGO_ATOM);
  const basepath = get(BASEPATH_ATOM);
  return {
    href: logo.href ?? basepath ?? "/",
    height: logo.height && logo.height > 0 ? logo.height : 20,
    light: logo.light,
    dark: logo.dark,
  };
});

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
    height: height ?? 20,
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
