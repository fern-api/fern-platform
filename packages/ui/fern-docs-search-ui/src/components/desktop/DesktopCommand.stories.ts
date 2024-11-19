import type { Meta, StoryObj } from "@storybook/react";

import { fn } from "@storybook/test";
import { DesktopCommand } from "./DesktopCommand";
const meta: Meta<typeof DesktopCommand> = {
    title: "Desktop/DesktopCommand",
    component: DesktopCommand,
    args: {
        filters: [],
        onSubmit: fn(),
        refine: fn(),
        query: "",
        clear: fn(),
        groups: [],
        facets: [],
        preload: fn(),
        error: null,
        isLoading: false,
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Query: Story = {
    args: {
        query: "hello",
    },
};
