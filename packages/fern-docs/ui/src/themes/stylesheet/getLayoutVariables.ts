import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

const CSS_VARIABLES = {
    SPACING_PAGE_WIDTH: "--spacing-page-width",
    SPACING_CONTENT_WIDTH: "--spacing-content-width",
    SPACING_CONTENT_WIDE_WIDTH: "--spacing-content-wide-width",
    SPACING_SIDEBAR_WIDTH: "--spacing-sidebar-width",
    SPACING_HEADER_HEIGHT: "--spacing-header-height",
    SPACING_HEADER_HEIGHT_PADDED: "--spacing-header-height-padded",
    SPACING_HEADER_HEIGHT_REAL: "--spacing-header-height-real",
};

type Breakpoint = "root" | "max-lg";

export function getLayoutVariables(
    layout: DocsV1Read.DocsLayoutConfig | undefined,
    hasTabs: boolean
): Record<Breakpoint, Record<string, string>> {
    const pageWidth =
        layout?.pageWidth == null
            ? "88rem"
            : visitDiscriminatedUnion(layout.pageWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  full: () => "100%",
                  _other: () => "88rem",
              });

    const contentWidthRem =
        layout?.contentWidth == null
            ? 44
            : visitDiscriminatedUnion(layout.contentWidth, "type")._visit({
                  px: (px) => px.value / 16,
                  rem: (rem) => rem.value,
                  _other: () => 44,
              });

    const contentWideWidthRem = (contentWidthRem * 3) / 2 + 0.5;

    const sidebarWidth =
        layout?.sidebarWidth == null
            ? "18rem"
            : visitDiscriminatedUnion(layout.sidebarWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  _other: () => "18rem",
              });

    const headerHeightRem =
        layout?.headerHeight == null
            ? 4
            : visitDiscriminatedUnion(layout.headerHeight, "type")._visit({
                  px: (px) => px.value / 16,
                  rem: (rem) => rem.value,
                  _other: () => 4,
              });

    const headerTabsHeightRem =
        hasTabs &&
        layout?.tabsPlacement === "HEADER" &&
        layout?.disableHeader !== true
            ? 44 / 16
            : 0;

    const headerHeight = `${headerHeightRem + headerTabsHeightRem}rem`;

    const headerHeightPadded =
        layout?.headerHeight == null
            ? "5rem"
            : visitDiscriminatedUnion(layout.headerHeight, "type")._visit({
                  px: (px) => `${px.value + 16}px`,
                  rem: (rem) => `${rem.value + 1}rem`,
                  _other: () => "5rem",
              });

    return {
        root: {
            [CSS_VARIABLES.SPACING_PAGE_WIDTH]: pageWidth,
            [CSS_VARIABLES.SPACING_CONTENT_WIDTH]: `${contentWidthRem}rem`,
            [CSS_VARIABLES.SPACING_CONTENT_WIDE_WIDTH]: `${contentWideWidthRem}rem`,
            [CSS_VARIABLES.SPACING_SIDEBAR_WIDTH]: sidebarWidth,
            [CSS_VARIABLES.SPACING_HEADER_HEIGHT]: layout?.disableHeader
                ? "0px"
                : headerHeight,
            [CSS_VARIABLES.SPACING_HEADER_HEIGHT_PADDED]: layout?.disableHeader
                ? "1rem"
                : headerHeightPadded,
            [CSS_VARIABLES.SPACING_HEADER_HEIGHT_REAL]: `${headerHeightRem}rem`,
        },
        "max-lg": {
            [CSS_VARIABLES.SPACING_HEADER_HEIGHT]: headerHeight,
            [CSS_VARIABLES.SPACING_HEADER_HEIGHT_PADDED]: headerHeightPadded,
        },
    };
}
