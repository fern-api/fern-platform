import { CodeBlockSkeleton } from "@fern-ui/ui/src/components";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
    title: "Example/CodeBlockSkeleton",
    component: CodeBlockSkeleton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
} satisfies Meta<typeof CodeBlockSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        theme: "dark",
        language: "js",
        content: 'console.log("Hello World!")',
        fontSize: "lg",
    },
};
