import type { Meta, StoryObj } from "@storybook/react";

import { HttpMethodBadge, HttpMethodOrder } from "./http-method-badge";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof HttpMethodBadge> = {
    title: "Badges/HttpMethodBadge",
    component: HttpMethodBadge,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: "centered",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ["autodocs"],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        method: {
            control: {
                type: "select",
            },
            options: HttpMethodOrder,
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
    },
    // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
        rounded: false,
        skeleton: false,
        variant: "subtle",
        size: "sm",
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    argTypes: {
        method: {
            control: {
                disable: true,
            },
        },
    },
    render: ({ ref, ...args }) => {
        return (
            <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
                <div
                    className="light"
                    style={{
                        padding: "2rem",
                        display: "flex",
                        gap: "0.5rem",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "0.5rem",
                        border: "1px solid #e0e0e0",
                    }}
                >
                    {HttpMethodOrder.map((method) => (
                        <HttpMethodBadge key={method} {...args} method={method} />
                    ))}
                </div>
                <div
                    className="dark"
                    style={{
                        padding: "2rem",
                        display: "flex",
                        gap: "0.5rem",
                        backgroundColor: "#222425",
                        borderRadius: "0.5rem",
                    }}
                >
                    {HttpMethodOrder.map((method) => (
                        <HttpMethodBadge key={method} {...args} method={method} />
                    ))}
                </div>
            </div>
        );
    },
};
