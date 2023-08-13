import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";
import { SearchContextProvider } from "./search-context/SearchContextProvider";

type Theme = "dark" | "light";
const DEFAULT_THEME: Theme = "dark";
const THEMES: Theme[] = ["dark", "light"];

export const CONTEXTS = [
    ({ children }: PropsWithChildren): JSX.Element => <SearchContextProvider>{children}</SearchContextProvider>,
    ({ children }: PropsWithChildren): JSX.Element => (
        <ThemeProvider defaultTheme={DEFAULT_THEME} enableSystem={false} themes={THEMES} attribute="class">
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </ThemeProvider>
    ),
];
