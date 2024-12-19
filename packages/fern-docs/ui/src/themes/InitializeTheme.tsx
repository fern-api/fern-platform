import { ReactElement } from "react";
import { useInitializeTheme } from "../atoms";
import { ThemeStylesheet } from "./stylesheet";

export function InitializeTheme(): ReactElement {
  useInitializeTheme();
  return <ThemeStylesheet />;
}
