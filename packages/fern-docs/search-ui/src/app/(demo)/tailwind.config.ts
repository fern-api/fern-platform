import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "unset",
          },
        },
      },
    },
  },
} satisfies Config;
