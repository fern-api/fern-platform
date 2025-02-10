import type { FdrAPI, FernNavigation } from "@fern-api/fdr-sdk";
import type { Frontmatter } from "@fern-api/fdr-sdk/docs";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";
import { isEqual } from "es-toolkit/predicate";
import { atom } from "jotai";
import { selectAtom } from "jotai/utils";

import { FileData } from "@/server/types";
import { getLogoFromFrontmatter } from "@/server/withLogo";

import { DOCS_ATOM } from "./docs";
import { EDGE_FLAGS_ATOM } from "./flags";
import { BASEPATH_ATOM } from "./navigation";

const DEFAULT_LOGO_HEIGHT = 20;

export const LOGO_TEXT_ATOM = atom<string | undefined>((get) =>
  get(EDGE_FLAGS_ATOM).isDocsLogoTextEnabled ? "docs" : undefined
);

const INTERNAL_LOGO_ATOM = selectAtom(DOCS_ATOM, (docs) => docs.logo, isEqual);

interface LogoConfiguration {
  href: string;
  height: number;
  light: FileData | undefined;
  dark: FileData | undefined;
}

export const LOGO_ATOM = atom<LogoConfiguration>((get) => {
  const logo = get(INTERNAL_LOGO_ATOM);
  const basepath = get(BASEPATH_ATOM);
  return {
    href: logo.href ?? basepath ?? "/",
    height: logo.height && logo.height > 0 ? logo.height : DEFAULT_LOGO_HEIGHT,
    light: logo.light,
    dark: logo.dark,
  };
});

export function withLogo(
  definition: FdrAPI.docs.v1.read.DocsDefinition,
  found: FernNavigation.utils.Node.Found,
  frontmatter: Frontmatter | undefined,
  resolveFileSrc: (src: string | undefined) => FileData | undefined
): {
  height: number;
  href: string;
  light: FileData | undefined;
  dark: FileData | undefined;
} {
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
