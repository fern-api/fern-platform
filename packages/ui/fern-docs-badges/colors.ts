export type SemanticColor = "error" | "success" | "warning" | "info";

export type GrayscaleColor = "gray" | "mauve" | "slate" | "sage" | "olive" | "sand";
export type RadixColor =
    | "tomato"
    | "red"
    | "ruby"
    | "crimson"
    | "pink"
    | "plum"
    | "purple"
    | "violet"
    | "iris"
    | "indigo"
    | "blue"
    | "cyan"
    | "teal"
    | "jade"
    | "green"
    | "grass"
    | "bronze"
    | "gold"
    | "brown"
    | "orange"
    | "amber"
    | "yellow"
    | "lime"
    | "mint"
    | "sky";

export type UIColor = RadixColor | "gray" | "accent";

export const GrayscaleColor: Record<Capitalize<GrayscaleColor>, GrayscaleColor> = {
    Gray: "gray",
    Mauve: "mauve",
    Slate: "slate",
    Sage: "sage",
    Olive: "olive",
    Sand: "sand",
} as const;

export const RadixColor: Record<Capitalize<RadixColor>, RadixColor> = {
    Tomato: "tomato",
    Red: "red",
    Ruby: "ruby",
    Crimson: "crimson",
    Pink: "pink",
    Plum: "plum",
    Purple: "purple",
    Violet: "violet",
    Iris: "iris",
    Indigo: "indigo",
    Blue: "blue",
    Cyan: "cyan",
    Teal: "teal",
    Jade: "jade",
    Green: "green",
    Grass: "grass",
    Bronze: "bronze",
    Gold: "gold",
    Brown: "brown",
    Orange: "orange",
    Amber: "amber",
    Yellow: "yellow",
    Lime: "lime",
    Mint: "mint",
    Sky: "sky",
} as const;

export const RadixColorOrder = [
    RadixColor.Tomato,
    RadixColor.Red,
    RadixColor.Ruby,
    RadixColor.Crimson,
    RadixColor.Pink,
    RadixColor.Plum,
    RadixColor.Purple,
    RadixColor.Violet,
    RadixColor.Iris,
    RadixColor.Indigo,
    RadixColor.Blue,
    RadixColor.Cyan,
    RadixColor.Teal,
    RadixColor.Jade,
    RadixColor.Green,
    RadixColor.Grass,
    RadixColor.Bronze,
    RadixColor.Gold,
    RadixColor.Brown,
    RadixColor.Orange,
    RadixColor.Amber,
    RadixColor.Yellow,
    RadixColor.Lime,
    RadixColor.Mint,
    RadixColor.Sky,
] as const;

export const UIColor: Record<Capitalize<UIColor>, UIColor> = {
    ...RadixColor,
    Gray: "gray",
    Accent: "accent",
} as const;

export const UIColorOrder = ["gray", "accent", ...RadixColorOrder] as const;

export const SemanticColor: Record<Capitalize<SemanticColor>, SemanticColor> = {
    Error: "error",
    Success: "success",
    Warning: "warning",
    Info: "info",
} as const;

export const SemanticColorOrder = [
    SemanticColor.Info,
    SemanticColor.Success,
    SemanticColor.Warning,
    SemanticColor.Error,
] as const;

export const SemanticColorMap: Record<SemanticColor, UIColor> = {
    error: "red",
    success: "green",
    warning: "amber",
    info: "blue",
} as const;
