import { ThemeProviderWithLayout } from "@fern-ui/theme";
import { PropsWithChildren, ReactElement } from "react";
import { CacheContextProvider } from "./cache-context/CacheContextProvider";
import { MobileSidebarContextProvider } from "./mobile-sidebar-context/MobileSidebarContextProvider";
import { SearchContextProvider } from "./search-context/SearchContextProvider";
import { ViewportContextProvider } from "./viewport-context/ViewportContextProvider";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): ReactElement => (
        <MobileSidebarContextProvider>{children}</MobileSidebarContextProvider>
    ),
    ({ children }: PropsWithChildren): ReactElement => <ViewportContextProvider>{children}</ViewportContextProvider>,
    ({ children }: PropsWithChildren): ReactElement => <SearchContextProvider>{children}</SearchContextProvider>,
    ({ children }: PropsWithChildren): ReactElement => <ThemeProviderWithLayout>{children}</ThemeProviderWithLayout>,
    ({ children }: PropsWithChildren): ReactElement => <CacheContextProvider>{children}</CacheContextProvider>,
];
