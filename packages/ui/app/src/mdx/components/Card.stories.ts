import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof Card> = {
    title: "MDX/Card",
    component: Card,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: "centered",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ["autodocs"],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        title: { control: "text" },
        icon: { control: "text" },
        iconSize: { control: "number" },
        color: { control: "color" },
        darkModeColor: { control: "color" },
        lightModeColor: { control: "color" },
        iconPosition: { control: "inline-radio", options: ["top", "left"] },
        href: { control: "text" },
        badge: { control: "text" },
    },
    args: {
        title: "Card Title",
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
    args: {},
};
