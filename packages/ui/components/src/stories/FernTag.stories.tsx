import type { Meta, StoryObj } from "@storybook/react";
import { FernTag, FernTagColorSchemes, FernTagSizes } from "../FernTag";

const methods = ["test", "get", "post", "put", "patch", "delete", "stream", "wss"];

const meta: Meta<typeof FernTag> = {
    title: "General/FernTag",
    component: FernTag,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    args: {
        children: "Test",
        size: "lg",
        variant: "subtle",
        colorScheme: "gray",
    },
    argTypes: {
        size: {
            options: ["sm", "lg"],
            control: { type: "select" },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const ColorSchemes: Story = {
    argTypes: {
        colorScheme: {
            control: false,
        },
    },
    render: (args: StoryObj<typeof meta>["args"]) => {
        const colorSchemes = Object.values(FernTagColorSchemes);
        return (
            <div className="flex flex-col gap-2">
                {colorSchemes.map((colorScheme, i) => (
                    <FernTag key={i} {...args} colorScheme={colorScheme} />
                ))}
            </div>
        );
    },
};

export const Sizes: Story = {
    argTypes: {
        size: {
            control: false,
        },
    },
    render: (args: StoryObj<typeof meta>["args"]) => {
        const sizes = Object.values(FernTagSizes);
        return (
            <div className="flex gap-2">
                {sizes.map((size, i) => (
                    <FernTag key={i} {...args} size={size} />
                ))}
            </div>
        );
    },
};

export const Solid: Story = {
    args: {
        variant: "solid",
    },
};

export const ClassNameOverrides: Story = {
    args: {
        size: "sm",
        className: "w-11 uppercase",
    },
    render: (args: StoryObj<typeof meta>["args"]) => {
        return (
            <div className="flex flex-col gap-2">
                {methods.map((method) => (
                    <FernTag
                        key={method}
                        {...args}
                        colorScheme={
                            method === "GET"
                                ? "green"
                                : method === "DELETE"
                                  ? "red"
                                  : method === "POST"
                                    ? "blue"
                                    : method === "STREAM" || method === "WSS"
                                      ? "accent"
                                      : method === "PUT" || method === "PATCH"
                                        ? "amber"
                                        : "gray"
                        }
                    >
                        {method === "DELETE" ? "DEL" : method}
                    </FernTag>
                ))}
            </div>
        );
    },
};
