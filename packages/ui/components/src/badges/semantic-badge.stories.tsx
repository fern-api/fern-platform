import type { Meta, StoryObj } from "@storybook/react";

import { SemanticColorOrder } from "./colors";
import { SemanticBadge } from "./semantic-badge";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof SemanticBadge> = {
    title: "Badges/SemanticBadge",
    component: SemanticBadge,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: "centered",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ["autodocs"],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        intent: {
            control: {
                type: "select",
            },
            options: SemanticColorOrder,
        },
        grayscale: {
            control: {
                type: "select",
            },
            options: ["gray", "mauve", "slate", "sage", "olive", "sand"],
        },
        size: {
            control: {
                type: "inline-radio",
            },
            options: ["sm", "lg"],
        },
        variant: {
            control: {
                type: "inline-radio",
            },
            options: ["solid", "outlined", "subtle"],
        },
        rounded: {
            control: {
                type: "boolean",
            },
        },
        skeleton: {
            control: {
                type: "boolean",
            },
        },
        interactive: {
            control: {
                type: "boolean",
            },
        },
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
        rounded: true,
        skeleton: false,
        variant: "outlined",
        size: "lg",
        grayscale: "gray",
        interactive: false,
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    argTypes: {
        intent: {
            control: {
                disable: true,
            },
        },
    },
    render: (args) => (
        <div style={{ display: "flex", gap: "1rem" }}>
            <div
                className="light"
                style={{
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "0.5rem",
                    border: "1px solid #e0e0e0",
                }}
            >
                <SemanticBadge {...args}>None</SemanticBadge>
                <SemanticBadge {...args} intent="info">
                    Info
                </SemanticBadge>
                <SemanticBadge {...args} intent="success">
                    Success
                </SemanticBadge>
                <SemanticBadge {...args} intent="warning">
                    Warning
                </SemanticBadge>
                <SemanticBadge {...args} intent="error">
                    Error
                </SemanticBadge>
            </div>
            <div
                className="dark"
                style={{
                    padding: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "#222425",
                    borderRadius: "0.5rem",
                }}
            >
                <SemanticBadge {...args}>None</SemanticBadge>
                <SemanticBadge {...args} intent="info">
                    Info
                </SemanticBadge>
                <SemanticBadge {...args} intent="success">
                    Success
                </SemanticBadge>
                <SemanticBadge {...args} intent="warning">
                    Warning
                </SemanticBadge>
                <SemanticBadge {...args} intent="error">
                    Error
                </SemanticBadge>
            </div>
        </div>
    ),
};
