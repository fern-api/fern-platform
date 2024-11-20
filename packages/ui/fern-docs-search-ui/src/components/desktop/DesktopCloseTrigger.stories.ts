import type { Meta, StoryObj } from "@storybook/react";

import { fn } from "@storybook/test";
import { DesktopCloseTrigger } from "./DesktopCloseTrigger";

const meta: Meta<typeof DesktopCloseTrigger> = {
    title: "Desktop/DesktopCloseTrigger",
    component: DesktopCloseTrigger,
    args: {
        onClose: fn(),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
