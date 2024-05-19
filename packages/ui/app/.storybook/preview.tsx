import { FernTooltipProvider, Toaster } from "@fern-ui/components";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import React from "react";
import "../src/next-app/globals.scss";
import "./variables.css";

const globalDecorator = (Story) => (
    <React.Fragment>
        <FernTooltipProvider>
            <Story />
            <Toaster />
        </FernTooltipProvider>
    </React.Fragment>
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
