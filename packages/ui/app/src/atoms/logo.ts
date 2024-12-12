import { FileIdOrUrl, Logo, LogoConfiguration } from "@fern-api/fdr-sdk/docs";
import { atom, useAtomValue } from "jotai";
import { DOCS_ATOM } from "./docs";
import { FEATURE_FLAGS_ATOM } from "./flags";

export const LOGO_TEXT_ATOM = atom<string | undefined>((get) =>
    get(FEATURE_FLAGS_ATOM).isDocsLogoTextEnabled ? "docs" : undefined,
);
LOGO_TEXT_ATOM.debugLabel = "LOGO_TEXT_ATOM";

export const LOGO_HREF_ATOM = atom<string | undefined>((get) => get(DOCS_ATOM).logoHref);
LOGO_HREF_ATOM.debugLabel = "LOGO_HREF_ATOM";

const DEFAULT_LOGO_HEIGHT = 20;
export const LOGO_HEIGHT_ATOM = atom<number>((get) => get(DOCS_ATOM).logoHeight ?? DEFAULT_LOGO_HEIGHT);
LOGO_HEIGHT_ATOM.debugLabel = "LOGO_HEIGHT_ATOM";

export function useLogoHeight(): number {
    return useAtomValue(LOGO_HEIGHT_ATOM);
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

export const LOGO_OVERRIDE_ATOM = atom<LogoConfiguration | undefined>((get) => {
    const logo = get(DOCS_ATOM).frontmatterLogoOverride ?? undefined;
    console.log("frontmatter logo", logo);

    if (logo != null && typeof logo === "object") {
        if ("light" in logo && "dark" in logo && isFileIdOrUrl(logo.light) && isFileIdOrUrl(logo.dark)) {
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
    return undefined;
});
