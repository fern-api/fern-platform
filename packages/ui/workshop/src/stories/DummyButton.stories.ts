import { DummyButton } from "@fern-ui/ui/src/components";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
    title: "Example/DummyButton",
    component: DummyButton,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {},
} satisfies Meta<typeof DummyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        primary: true,
        label: "DummyButton",
    },
};

export const Secondary: Story = {
    args: {
        label: "DummyButton",
    },
};

export const Large: Story = {
    args: {
        size: "large",
        label: "DummyButton",
    },
};

export const Small: Story = {
    args: {
        size: "small",
        label: "DummyButton",
    },
};
