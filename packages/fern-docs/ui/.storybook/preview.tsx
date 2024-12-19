import { FernTooltipProvider, Toaster } from "@fern-docs/components";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import React from "react";
import "../src/css/globals.scss";
import "./variables.css";

const globalDecorator = (Story) => (
    <FernTooltipProvider>
        <Story />
        <Toaster />
    </FernTooltipProvider>
);
export const decorators = [
    globalDecorator,
    withThemeByClassName({
        themes: {
            light: "light",
            dark: "dark",
        },
        defaultTheme: "light",
    }),
];

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
