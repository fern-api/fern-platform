import { useInitializeTheme } from "@/atoms";
import { ReactElement } from "react";
import { ThemeStylesheet } from "./stylesheet";

export function InitializeTheme(): ReactElement {
    useInitializeTheme();
    return <ThemeStylesheet />;
}
