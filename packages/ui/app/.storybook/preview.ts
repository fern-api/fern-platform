import type { Preview } from "@storybook/react";
import "../src/next-app/globals.scss";
import "./variables.css";

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
