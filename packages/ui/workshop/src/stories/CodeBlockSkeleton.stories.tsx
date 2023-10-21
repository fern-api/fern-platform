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
    decorators: [
        (Story) => (
            <div style={{ padding: "10px", backgroundColor: "rgb(25,27,36)" }}>
                {/* Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
                <Story />
            </div>
        ),
    ],
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
