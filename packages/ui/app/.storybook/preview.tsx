import type { Preview } from "@storybook/react";
import React from "react";
import { Toaster } from "../src/components/FernToast";
import "../src/next-app/globals.scss";
import "./variables.css";

const globalDecorator = (Story) => (
    <React.Fragment>
        <Story />
        <Toaster />
    </React.Fragment>
);
export const decorators = [globalDecorator];

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
