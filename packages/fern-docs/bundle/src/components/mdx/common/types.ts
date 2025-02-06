import type { Hast } from "@fern-docs/mdx";

export interface CodeBlockItem {
  // language: string;
  title?: string;
  code: string | undefined;
  hast: Hast.Root | undefined;
  // highlightLines?: (number | [number, number])[];
  // highlightStyle?: "highlight" | "focus";
}
