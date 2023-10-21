import { CodeBlockSkeleton, type CodeBlockSkeletonProps } from "@fern-ui/ui/src/commons/CodeBlockSkeleton";
import type { Meta, StoryFn, StoryObj } from "@storybook/react";
import { RootStylesProvider } from "./RootProvider";
import { PYTHON_CODE_SNIPPET_1 } from "./snippets";

const meta = {
    title: "Example/CodeBlockSkeleton",
    component: CodeBlockSkeleton as StoryFn,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
    decorators: [
        (Story) => (
            <RootStylesProvider>
                <div style={{ width: "100%", padding: 100 }}>
                    {/* Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
                    <Story />
                </div>
            </RootStylesProvider>
        ),
    ],
} satisfies Meta<typeof CodeBlockSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        theme: "dark",
        language: "python",
        content: PYTHON_CODE_SNIPPET_1,
        fontSize: "lg",
    } satisfies CodeBlockSkeletonProps,
};
