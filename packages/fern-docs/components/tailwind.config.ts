import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const round = (num: number): string =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, "$1")
    .replace(/\.0$/, "");

const em = (px: number, base: number): string => `${round(px / base)}em`;

export default {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: "#000000",
            maxWidth: "unset",
            "--tw-prose-bold": "inherit",
            "--tw-prose-links": "inherit",
            "--tw-prose-hr": "var(--border)",
            "--tw-prose-body": "inherit",
            "--tw-prose-headings": "inherit",
            "--tw-prose-pre-bg": "initial",
            "--tw-prose-th-borders": "var(--border)",
            "--tw-prose-td-borders": "var(--border)",
            "--tw-prose-bullets": "var(color:--grayscale-a8)",
            "--tw-prose-counters": "var(color:--grayscale-a9)",
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
        invert: {
          css: {
            color: "#ffffff",
            "--tw-prose-invert-bold": "inherit",
            "--tw-prose-invert-links": "inherit",
            "--tw-prose-invert-hr": "var(--border)",
            "--tw-prose-invert-body": "inherit",
            "--tw-prose-invert-headings": "inherit",
            "--tw-prose-invert-pre-bg": "initial",
            "--tw-prose-invert-th-borders": "var(--border)",
            "--tw-prose-invert-td-borders": "var(--border)",
            "--tw-prose-invert-bullets": "var(color:--grayscale-a8)",
            "--tw-prose-invert-counters": "var(color:--grayscale-a9)",
          },
        },
        "invert-sm": {
          css: {
            color: "var(color:--grayscale-a11)",
          },
        },
      },
    },
  },
  plugins: [
    // Defining the classes here to get proper intellisense
    // https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1269592872
    plugin(({ addComponents }) => {
      addComponents({
        ".animate-popover": {
          "@apply data-[side=top]:animate-slide-down-and-fade data-[side=right]:animate-slide-left-and-fade data-[side=bottom]:animate-slide-up-and-fade data-[side=left]:animate-slide-right-and-fade":
            {},
        },
      });
    }),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
