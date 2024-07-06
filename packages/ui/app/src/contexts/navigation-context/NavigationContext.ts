import { FernNavigation } from "@fern-api/fdr-sdk";
import { noop } from "@fern-ui/core-utils";
import { SidebarVersionInfo } from "@fern-ui/fdr-utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    activeVersion: undefined,
    activeNavigatable: undefined,
    onScrollToPath: noop,
    unversionedSlug: "",
});

export interface NavigationContextValue {
    activeVersion: SidebarVersionInfo | undefined;
    activeNavigatable: FernNavigation.NavigationNodeWithMetadata | undefined;
    onScrollToPath: (slug: string) => void;
    unversionedSlug: string;
}
