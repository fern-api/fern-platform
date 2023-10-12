import { ThemeProviderWithLayout } from "@fern-ui/theme";
import { PropsWithChildren } from "react";
import { CacheContextProvider } from "./cache-context/CacheContextProvider";
import { MobileSidebarContextProvider } from "./mobile-sidebar-context/MobileSidebarContextProvider";
import { SearchContextProvider } from "./search-context/SearchContextProvider";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => (
        <MobileSidebarContextProvider>{children}</MobileSidebarContextProvider>
    ),
    ({ children }: PropsWithChildren): JSX.Element => <SearchContextProvider>{children}</SearchContextProvider>,
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProviderWithLayout>{children}</ThemeProviderWithLayout>,
    ({ children }: PropsWithChildren): JSX.Element => <CacheContextProvider>{children}</CacheContextProvider>,
];
