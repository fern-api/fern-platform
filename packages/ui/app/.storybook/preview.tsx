import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Toaster } from "../src/components/FernToast";
import { FernTooltipProvider } from "../src/components/FernTooltip";
import "../src/next-app/globals.scss";
import "./variables.css";

const globalDecorator = (Story) => (
    <React.Fragment>
        <ThemeProvider>
            <FernTooltipProvider>
                <Story />
                <Toaster />
            </FernTooltipProvider>
        </ThemeProvider>
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
