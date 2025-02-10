import { FernTooltipProvider, Toaster } from "@fern-docs/components";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview } from "@storybook/react";

import "../src/css/globals.scss";
import "./variables.css";

const globalDecorator = (Story: any) => (
  <FernTooltipProvider>
    <Story />
    <Toaster />
  </FernTooltipProvider>
);
export const decorators: Decorator[] = [
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
