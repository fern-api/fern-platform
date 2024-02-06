import { DocsV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";

const CSS_VARIABLES = {
    SPACING_PAGE_WIDTH: "--spacing-page-width",
    SPACING_CONTENT_WIDTH: "--spacing-content-width",
    SPACING_SIDEBAR_WIDTH: "--spacing-sidebar-width",
    SPACING_HEADER_HEIGHT: "--spacing-header-height",
    SPACING_HEADER_HEIGHT_PADDED: "--spacing-header-height-padded",
};

export function getLayoutVariables(layout: DocsV1Read.DocsLayoutConfig | undefined): Record<string, string> {
    const pageWidth =
        layout?.pageWidth == null
            ? "88rem"
            : visitDiscriminatedUnion(layout.pageWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  full: () => "100%",
                  _other: () => "88rem",
              });

    const contentWidth =
        layout?.contentWidth == null
            ? "44rem"
            : visitDiscriminatedUnion(layout.contentWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  _other: () => "44rem",
              });

    const sidebarWidth =
        layout?.sidebarWidth == null
            ? "18rem"
            : visitDiscriminatedUnion(layout.sidebarWidth, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  _other: () => "18rem",
              });

    const headerHeight =
        layout?.headerHeight == null
            ? "4rem"
            : visitDiscriminatedUnion(layout.headerHeight, "type")._visit({
                  px: (px) => `${px.value}px`,
                  rem: (rem) => `${rem.value}rem`,
                  _other: () => "4rem",
              });

    const headerHeightPadded =
        layout?.headerHeight == null
            ? "5rem"
            : visitDiscriminatedUnion(layout.headerHeight, "type")._visit({
                  px: (px) => `${px.value + 16}px`,
                  rem: (rem) => `${rem.value + 1}rem`,
                  _other: () => "5rem",
              });

    return {
        [CSS_VARIABLES.SPACING_PAGE_WIDTH]: pageWidth,
        [CSS_VARIABLES.SPACING_CONTENT_WIDTH]: contentWidth,
        [CSS_VARIABLES.SPACING_SIDEBAR_WIDTH]: sidebarWidth,
        [CSS_VARIABLES.SPACING_HEADER_HEIGHT]: headerHeight,
        [CSS_VARIABLES.SPACING_HEADER_HEIGHT_PADDED]: headerHeightPadded,
    };
}
