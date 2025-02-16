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
            "--tw-prose-bullets": "var(--grayscale-a8)",
            "--tw-prose-counters": "var(--grayscale-a9)",
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
            color: "var(--grayscale-a11)",
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
            "--tw-prose-invert-bullets": "var(--grayscale-a8)",
            "--tw-prose-invert-counters": "var(--grayscale-a9)",
          },
        },
        "invert-sm": {
          css: {
            color: "var(--grayscale-a11)",
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
        // Border
        ".border-primary": {
          "@apply border-border-primary": {},
        },
        ".border-concealed": {
          "@apply border-border-concealed": {},
        },
        ".border-default": {
          "@apply border-border-default": {},
        },
        ".border-success": {
          "@apply border-border-success": {},
        },
        ".border-warning": {
          "@apply border-border-warning": {},
        },
        ".border-danger": {
          "@apply border-border-danger": {},
        },
        ".divide-default": {
          "@apply divide-border-default": {},
        },
        ".ring-default": {
          "@apply ring-border-default": {},
        },
        ".ring-concealed": {
          "@apply ring-border-concealed": {},
        },
        ".animate-popover": {
          "@apply data-[side=top]:animate-slide-down-and-fade data-[side=right]:animate-slide-left-and-fade data-[side=bottom]:animate-slide-up-and-fade data-[side=left]:animate-slide-right-and-fade":
            {},
        },

        ".callout-soft": {
          "@apply bg-tag-default ring-0": {},
        },
        ".callout-soft-success": {
          "@apply bg-tag-success ring-0": {},
        },
        ".callout-soft-warning": {
          "@apply bg-tag-warning ring-0": {},
        },
        ".callout-soft-danger": {
          "@apply bg-tag-danger ring-0": {},
        },

        ".callout-outlined": {
          "@apply bg-tag-default-soft ring-1 ring-inset ring-border-default-soft":
            {},
        },
        ".callout-outlined-success, .callout-outlined-tip, .callout-outlined-check":
          {
            "@apply bg-tag-success-soft ring-1 ring-inset ring-border-success-soft":
              {},
          },
        ".callout-outlined-warning": {
          "@apply bg-tag-warning-soft ring-1 ring-inset ring-border-warning-soft":
            {},
        },
        ".callout-outlined-danger": {
          "@apply bg-tag-danger-soft ring-1 ring-inset ring-border-danger-soft":
            {},
        },
        ".callout-outlined-primary": {
          "@apply bg-tag-primary-soft ring-1 ring-inset ring-border-primary-soft":
            {},
        },
        ".callout-outlined-info": {
          "@apply bg-tag-info-soft ring-1 ring-inset ring-border-info-soft": {},
        },

        ".callout-outlined-ghost": {
          "@apply ring-1 ring-inset ring-border-default-soft": {},
        },
        ".callout-outlined-ghost-success": {
          "@apply ring-1 ring-inset ring-border-success-soft": {},
        },
        ".callout-outlined-ghost-warning": {
          "@apply ring-1 ring-inset ring-border-warning-soft": {},
        },
        ".callout-outlined-ghost-danger": {
          "@apply ring-1 ring-inset ring-border-danger-soft": {},
        },
        ".shadow-default": {
          "@apply shadow-border-default": {},
        },
        ".shadow-card": {
          "@apply shadow-card-light": {},
        },
        ".shadow-card-elevated": {
          "@apply shadow-card-light-elevated dark:shadow-card-dark-elevated":
            {},
        },
      });
    }),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
