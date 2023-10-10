import { DefinitionObjectFactory, PathResolver } from "@fern-ui/app-utils";
import { noop } from "@fern-ui/core-utils";
import React from "react";

export const NavigationContext = React.createContext<NavigationContextValue>({
    justNavigated: false,
    hasInitialized: false,
    userIsScrolling: () => false,
    observeDocContent: noop,
    resolver: new PathResolver({
        docsDefinition: DefinitionObjectFactory.createDocsDefinition(),
    }),
});

export interface NavigationContextValue {
    justNavigated: boolean;
    hasInitialized: boolean;
    userIsScrolling: () => boolean;
    observeDocContent: (element: HTMLDivElement) => void;
    resolver: PathResolver;
}
