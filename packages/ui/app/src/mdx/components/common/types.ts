export interface CodeBlockItem {
    language: string;
    title: string;
    content: string;
    highlightLines?: (number | [number, number])[];
    highlightStyle?: "highlight" | "focus";
}
