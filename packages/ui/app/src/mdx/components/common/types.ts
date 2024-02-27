import { ReactNode } from "react";

export interface CodeBlockItem {
    // language: string;
    title?: string;
    code: string | undefined;
    children: ReactNode | undefined;
    // highlightLines?: (number | [number, number])[];
    // highlightStyle?: "highlight" | "focus";
}
