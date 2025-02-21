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

        ".callout-soft": {
          "@apply bg-(color:--grayscale-a3) ring-0": {},
        },
        ".callout-soft-success": {
          "@apply bg-(--green-a3) ring-0": {},
        },
        ".callout-soft-warning": {
          "@apply bg-(--amber-a3) ring-0": {},
        },
        ".callout-soft-danger": {
          "@apply bg-(--red-a3) ring-0": {},
        },

        ".callout-outlined": {
          "@apply bg-(color:--grayscale-a2) ring-1 ring-inset ring-border-default-soft":
            {},
        },
        ".callout-outlined-success, .callout-outlined-tip, .callout-outlined-check":
          {
            "@apply bg-(--green-a2) ring-1 ring-inset ring-(--green-a4)": {},
          },
        ".callout-outlined-warning": {
          "@apply bg-(--amber-a2) ring-1 ring-inset ring-(--amber-a4)": {},
        },
        ".callout-outlined-danger": {
          "@apply bg-(--red-a2) ring-1 ring-inset ring-(--red-a4)": {},
        },
        ".callout-outlined-primary": {
          "@apply bg-(color:--accent-a2) ring-1 ring-inset ring-(color:--accent-a4)":
            {},
        },
        ".callout-outlined-info": {
          "@apply bg-(--blue-a2) ring-1 ring-inset ring-(--info-a4)": {},
        },

        ".callout-outlined-ghost": {
          "@apply ring-1 ring-inset ring-border-default-soft": {},
        },
        ".callout-outlined-ghost-success": {
          "@apply ring-1 ring-inset ring-(--green-a4)": {},
        },
        ".callout-outlined-ghost-warning": {
          "@apply ring-1 ring-inset ring-(--amber-a4)": {},
        },
        ".callout-outlined-ghost-danger": {
          "@apply ring-1 ring-inset ring-(--red-a4)": {},
        },
      });
    }),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
