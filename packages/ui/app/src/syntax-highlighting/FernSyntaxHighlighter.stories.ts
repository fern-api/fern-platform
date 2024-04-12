import type { Meta, StoryObj } from "@storybook/react";
import { FernSyntaxHighlighter } from "./FernSyntaxHighlighter";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof FernSyntaxHighlighter> = {
    title: "FernSyntaxHighlighter",
    component: FernSyntaxHighlighter,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: "centered",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ["autodocs"],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        className: { control: "text", description: "CSS class name of the component" },
        code: { control: "text", description: "Code to be highlighted" },
        language: { control: "text", description: "Language of the supplied code" },
        fontSize: {
            control: { type: "select", options: ["sm", "base", "lg"] },
            description: "Font size of the highlighted code",
        },
        highlightLines: {
            control: "object",
            description: "Lines to be highlighted, either a single number or a range in an array form",
        },
        highlightStyle: {
            control: { type: "select", options: ["highlight", "focus"] },
            description: "Style of highlight to use",
        },
        viewportRef: {
            control: "object",
            description: "Ref object for scrolling to handle",
        },
        maxLines: {
            control: "number",
            description: "Maximum lines of code to display",
        },
    },
    args: {
        code: "This is a test code snippet.",
        language: "plaintext",
        fontSize: "base",
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Typescript: Story = {
    args: {
        language: "typescript",
        code: "const a = 1;",
    },
};

export const Golang: Story = {
    args: {
        language: "golang",
        code: "package main",
    },
};

export const Curl: Story = {
    args: {
        language: "curl",
        code: `
curl -X GET https://example.com \\
    -H "Authorization: Bearer token" \\
    -H "Content-Type: application/json" \\
    -d '{"key": "value"}'
`,
    },
};

export const TypescriptWithHighlight: Story = {
    args: {
        language: "typescript",
        code: `
const a = 1;
const b = 2; // [!code highlight]
console.log(a + b);
`,
    },
};
