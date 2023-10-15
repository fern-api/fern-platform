import { ThemeProviderWithLayout } from "@fern-ui/theme";
import { PropsWithChildren } from "react";
import { CacheContextProvider } from "./cache-context/CacheContextProvider";
import { MobileSidebarContextProvider } from "./mobile-sidebar-context/MobileSidebarContextProvider";
import { SearchContextProvider } from "./search-context/SearchContextProvider";
import { ViewportContextProvider } from "./viewport-context/ViewportContextProvider";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => (
        <MobileSidebarContextProvider>{children}</MobileSidebarContextProvider>
    ),
    ({ children }: PropsWithChildren): JSX.Element => <ViewportContextProvider>{children}</ViewportContextProvider>,
    ({ children }: PropsWithChildren): JSX.Element => <SearchContextProvider>{children}</SearchContextProvider>,
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProviderWithLayout>{children}</ThemeProviderWithLayout>,
    ({ children }: PropsWithChildren): JSX.Element => <CacheContextProvider>{children}</CacheContextProvider>,
];
