import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

const round = (num: number): string =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, "$1")
    .replace(/\.0$/, "");

const em = (px: number, base: number): string => `${round(px / base)}em`;

const config: Config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: "inherit",
            maxWidth: "unset",
            "--tw-prose-bold": "inherit",
            "--tw-prose-body": "inherit",
            "--tw-prose-bullets": "var(--grayscale-a9)",
            "--tw-prose-captions": "var(--grayscale-a11)",
            "--tw-prose-code": "var(--accent-a11)",
            "--tw-prose-counters": "var(--grayscale-a10)",
            "--tw-prose-headings": "inherit",
            "--tw-prose-th-borders": "var(--color-border-default)",
            "--tw-prose-hr": "var(--color-border-default)",
            "--tw-prose-kbd": "var(--grayscale-a11)",
            "--tw-prose-kbd-shadows": "var(--color-border-default)",
            "--tw-prose-lead": "var(--grayscale-a11)",
            "--tw-prose-links": "var(--accent-a11)",
            "--tw-prose-pre-bg": "initial",
            "--tw-prose-pre-code": "inherit",
            "--tw-prose-quote-borders": "var(--accent-a6)",
            "--tw-prose-quotes": "var(--grayscale-a11)",
            "--tw-prose-td-borders": "var(--color-border-default)",

            "tbody td[rowspan]:first-child, tfoot td[rowspan]:first-child": {
              paddingRight: em(8, 14),
            },
            "tbody td[rowspan]:first-child + td, tfoot td[rowspan]:first-child + td":
              {
                paddingLeft: 0,
              },

            // remove quotes from code blocks
            "code::before": {
              content: "",
            },
            "code::after": {
              content: "",
            },

            // remove opening and closing quotes
            "blockquote p:first-of-type::before": {
              content: "",
            },
            "blockquote p:last-of-type::after": {
              content: "",
            },
          },
        },
        sm: {
          css: {
            color: "var(color:--grayscale-a11)",
            p: {
              marginTop: "0.25rem",
            },
            "tbody td[rowspan]:first-child, tfoot td[rowspan]:first-child": {
              paddingRight: em(12, 12),
            },
            "tbody td[rowspan]:first-child + td, tfoot td[rowspan]:first-child + td":
              {
                paddingLeft: 0,
              },
          },
        },
      },
    },
  },
  plugins: [typography],
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
