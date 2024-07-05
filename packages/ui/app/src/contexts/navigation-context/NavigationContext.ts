import { FernNavigation } from "@fern-api/fdr-sdk";
import { noop } from "@fern-ui/core-utils";
import { SidebarVersionInfo } from "@fern-ui/fdr-utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    domain: "",
    basePath: undefined,
    activeVersion: undefined,
    selectedSlug: "",
    activeNavigatable: undefined,
    onScrollToPath: noop,
    unversionedSlug: "",
});

export interface NavigationContextValue {
    domain: string;
    basePath: string | undefined;
    activeVersion: SidebarVersionInfo | undefined;
    selectedSlug: string;
    activeNavigatable: FernNavigation.NavigationNodeWithMetadata | undefined;
    onScrollToPath: (slug: string) => void;
    unversionedSlug: string;
}
