import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { DesktopCloseTrigger } from "./DesktopCloseTrigger";

const meta: Meta<typeof DesktopCloseTrigger> = {
    title: "Desktop/DesktopCloseTrigger",
    component: DesktopCloseTrigger,
    args: {
        CloseTrigger: ({ children }) => React.createElement("button", {}, children),
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
