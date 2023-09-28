import { ThemeProviderWithLayout } from "@fern-ui/theme";
import { PropsWithChildren } from "react";
import { MobileSidebarContextProvider } from "./mobile-sidebar-context/MobileSidebarContextProvider";
import { NavigationContextProvider } from "./navigation-context/NavigationContextProvider";
import { SearchContextProvider } from "./search-context/SearchContextProvider";

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <NavigationContextProvider>{children}</NavigationContextProvider>,
    ({ children }: PropsWithChildren): JSX.Element => (
        <MobileSidebarContextProvider>{children}</MobileSidebarContextProvider>
    ),
    ({ children }: PropsWithChildren): JSX.Element => <SearchContextProvider>{children}</SearchContextProvider>,
    ({ children }: PropsWithChildren): JSX.Element => <ThemeProviderWithLayout>{children}</ThemeProviderWithLayout>,
];
