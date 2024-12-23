import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react";
import React from "react";
import { Toaster } from "../src/FernToast";
import { FernTooltipProvider } from "../src/FernTooltip";
import "./styles.scss";

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

  tags: ["autodocs"],
};

export default preview;
