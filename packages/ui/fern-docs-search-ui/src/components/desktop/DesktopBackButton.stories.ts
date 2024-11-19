import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { DesktopBackButton } from "./DesktopBackButton";

const meta: Meta<typeof DesktopBackButton> = {
    title: "Desktop/DesktopBackButton",
    component: DesktopBackButton,
    args: {
        pop: fn(),
        clear: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
