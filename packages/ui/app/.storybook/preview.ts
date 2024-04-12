import type { Preview } from "@storybook/react";
import { createElement } from "react";
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
        backgrounds: {
            default: "light",
            values: [
                {
                    name: "light",
                    value: "#f5f5f5",
                },
                {
                    name: "dark",
                    value: "#000",
                },
            ],
        },
    },
    decorators: [
        (Story, c) => {
            // if (
            //     c.globals.backgrounds.value !== "transparent" &&
            //     tinycolor(c.globals.backgrounds.value ?? "white").isDark()
            // ) {
            //     document.body.classList.add("dark");
            // } else {
            //     document.body.classList.remove("dark");
            // }
            return createElement(Story);
        },
    ],
};

export default preview;
