import type { Meta, StoryObj } from "@storybook/react";

import { fn } from "@storybook/test";
import { DesktopCommand } from "./desktop-command";
const meta: Meta<typeof DesktopCommand> = {
    title: "Desktop/DesktopCommand",
    component: DesktopCommand,
    args: {
        filters: [],
        onSubmit: fn(),
        refine: fn(),
        query: "",
        clear: fn(),
        items: [],
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
