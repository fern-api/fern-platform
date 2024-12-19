import type { Root } from "hast";

export interface CodeBlockItem {
  // language: string;
  title?: string;
  code: string | undefined;
  hast: Root | undefined;
  // highlightLines?: (number | [number, number])[];
  // highlightStyle?: "highlight" | "focus";
}
