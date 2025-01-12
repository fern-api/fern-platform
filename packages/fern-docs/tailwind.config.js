const plugin = require("tailwindcss/plugin");

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, "$1")
    .replace(/\.0$/, "");
const em = (px, base) => `${round(px / base)}em`;

const generateScale = (name) => {
  let scale = Array.from({ length: 12 }, (_, i) => {
    let id = i + 1;
    return [
      [id, `var(--${name}-${id})`],
      [`a${id}`, `var(--${name}-a${id})`],
    ];
  }).flat();

  return Object.fromEntries(scale);
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        mono: "var(--typography-code-font-family)",
      },
      spacing: {
        "page-width": "var(--spacing-page-width)",
        "content-width": "var(--spacing-content-width)",
        "content-wide-width": "var(--spacing-content-wide-width)",
        "endpoint-width": "calc(var(--spacing-content-width) * 2 + 3rem)",
        "sidebar-width": "var(--spacing-sidebar-width)",
        "header-height-real": "var(--spacing-header-height-real)",
        "header-height": "var(--spacing-header-height)",
        "header-height-padded": "calc(var(--spacing-header-height) + 1rem)",
        "header-offset": "var(--header-offset, 0)",
        "header-offset-padded": "calc(var(--header-offset, 0) + 1rem)",
        "vh-minus-header":
          "calc(100vh - var(--header-offset, var(--spacing-header-height)))",
        "vh-minus-header-padded":
          "calc(100vh - var(--header-offset, var(--spacing-header-height)) - 2rem)",
        "dvh-minus-header":
          "calc(100dvh - var(--header-offset, var(--spacing-header-height)))",
        "dvh-minus-header-padded":
          "calc(100dvh - var(--header-offset, var(--spacing-header-height)) - 2rem)",
        icon: "1rem",
        "icon-sm": "0.75rem",
        "icon-md": "1.25rem",
        "icon-lg": "1.5rem",
        "icon-xl": "2rem",
      },
      flex: {
        2: "2 2 0%",
      },
      minWidth: {
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      boxShadow: {
        header: "0px 4px 24px 0px rgba(var(--accent), 10%)",
        "header-dark": "0px 4px 24px 0px rgba(var(--accent), 10%)",
        "card-light": "0 1px 2px rgba(17,20,24,.06)",
        "card-light-elevated":
          "0 1px 2px rgba(17,20,24,.2), 0 3px 6px rgba(17,20,24,.06)",
        "card-dark": "0 2px 4px rgba(221, 243, 255,.07)",
        "card-dark-elevated":
          "0 2px 4px rgba(221, 243, 255,.05), 0 2px 24px rgba(221, 243, 255,.05)",
      },

      colors: {
        fern: "#1BA32A",
        air: "#FBFFFA",
        ground: "#081008",

        /* Radix palettes */
        green: generateScale("green"),
        "green-dark": generateScale("green-dark"),
        amber: generateScale("amber"),
        "amber-dark": generateScale("amber-dark"),
        red: generateScale("red"),
        "red-dark": generateScale("red-dark"),
        blue: generateScale("blue"),
        "blue-dark": generateScale("blue-dark"),
        /* End of Radix palettes */

        /* Full custom scale */
        grayscale: generateScale("grayscale"),
        accented: generateScale("accent"),

        /* Tokens */
        accent: withOpacity("--accent"),
        "accent-aa": withOpacity("--accent-aa"),
        "accent-aaa": withOpacity("--accent-aaa"),
        "accent-tinted": "var(--accent-10)",
        "accent-contrast": "var(--accent-contrast)",
        "accent-muted": `var(--accent-6)`,
        "accent-highlight": "var(--accent-3)",
        "accent-highlight-faded": "var(--accent-2)",
        background: withOpacity("--background"),

        "method-get": "var(--green-a10)",
        "method-post": "var(--blue-a10)",
        "method-delete": "var(--red-a10)",
        "method-put": "var(--amber-a10)",
        "method-patch": "var(--amber-a10)",
        "text-method-get": "var(--green-a11)",
        "text-method-post": "var(--blue-a11)",
        "text-method-delete": "var(--red-a11)",
        "text-method-put": "var(--amber-a11)",
        "text-method-patch": "var(--amber-a11)",
        "tag-method-get": "var(--green-a3)",
        "tag-method-post": "var(--blue-a3)",
        "tag-method-delete": "var(--red-a3)",
        "tag-method-put": "var(--amber-a3)",
        "tag-method-patch": "var(--amber-a3)",

        "intent-default": "var(--grayscale-a11)",
        "intent-default-lightened": "var(--grayscale-a12)",
        "intent-warning": "var(--amber-a11)",
        "intent-warning-lightened": "var(--amber-a12)",
        "intent-success": "var(--green-a11)",
        "intent-success-lightened": "var(--green-a12)",
        "intent-danger": "var(--red-a11)",
        "intent-danger-lightened": "var(--red-a12)",
        "intent-info": "var(--blue-a11)",
        "intent-info-lightened": "var(--blue-a12)",

        "background-primary": {
          light: "rgb(3, 7, 18)",
          dark: "rgb(255, 255, 255)",
        },
        "background-secondary": {
          light: "rgb(17, 24, 39)",
          dark: "rgb(249, 250, 251)",
        },
        "background-tertiary": {
          light: "rgb(243, 244, 246)",
          dark: "rgb(31, 41, 55)",
        },

        "background-hover": {
          light: "rgba(3, 7, 18, 0.05)",
          dark: "rgba(151, 90, 90, 0.05)",
        },

        "card-background": "var(--bg-color-card)",
        "card-solid": "var(--bg-color-card-solid)",
        "sidebar-background": "var(--sidebar-background)",
        "header-background": "var(--header-background)",

        // "border-default": "var(--grayscale-a5)",
        "border-default": "var(--border)",
        "border-concealed": "var(--border-concealed)",
        "card-border": "var(--border-color-card, var(--border))",
        "border-accent-muted": "rgba(var(--accent), 0.50)",
        "border-warning": "var(--amber-a8)",
        "border-success": "var(--green-a8)",
        "border-danger": "var(--red-a8)",
        "border-info": "var(--blue-a8)",

        "border-default-soft": "var(--grayscale-a6)",
        "border-primary-soft": "rgba(var(--accent), 30%)",
        "border-warning-soft": "var(--amber-a6)",
        "border-success-soft": "var(--green-a6)",
        "border-danger-soft": "var(--red-a6)",
        "border-info-soft": "var(--blue-a6)",

        "text-default": withOpacity("--body-text"),
        "text-default-inverted": withOpacity("--body-text-inverted"),
        "text-muted": "var(--grayscale-a11)",
        "text-disabled": "var(--grayscale-a10)",
        faded: "var(--grayscale-a9)",

        "tag-default-soft": "var(--grayscale-a2)",
        "tag-primary-soft": "rgba(var(--accent), 10%)",
        "tag-warning-soft": "var(--amber-a2)",
        "tag-success-soft": "var(--green-a2)",
        "tag-danger-soft": "var(--red-a2)",
        "tag-info-soft": "var(--blue-a2)",

        "tag-default": "var(--grayscale-a3)",
        "tag-default-solid": "var(--grayscale-3)",
        "tag-default-hover": "var(--grayscale-a4)",
        "tag-primary": "rgba(var(--accent), 15%)",
        "tag-warning": "var(--amber-a3)",
        "tag-success": "var(--green-a3)",
        "tag-danger": "var(--red-a3)",
        "tag-info": "var(--blue-a3)",
      },
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
      keyframes: {
        "slide-down-and-fade": {
          from: { opacity: 0, transform: "translateY(-2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-left-and-fade": {
          from: { opacity: 0, transform: "translateX(2px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "slide-up-and-fade": {
          from: { opacity: 0, transform: "translateY(2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-right-and-fade": {
          from: { opacity: 0, transform: "translateX(-2px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        shine: {
          "0%": {
            opacity: "0.5",
            transform: "translateX(-100px) skewX(-15deg)",
          },
          "33%": {
            opacity: "0.6",
            transform: "translateX(300px) skewX(-15deg)",
          },
          "100%": {
            opacity: "0.6",
            transform: "translateX(300px) skewX(-15deg)",
          },
        },
        "thumb-rock": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "30%": {
            transform: "rotate(15deg)",
          },
          "80%": {
            transform: "rotate(-10deg)",
          },
          "100%": {
            transform: "rotate(0deg)",
          },
        },
        "overlay-show": {
          from: { opacity: "0", backdropFilter: "blur(0)" },
          to: { opacity: "1", backdropFilter: "blur(4px)" },
        },
        "content-show": {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)",
          },
        },
        "content-show-from-bottom": {
          from: { opacity: "0", transform: "translate(0, 48%)" },
          to: { opacity: "1", transform: "translate(0, 0)" },
        },
        "content-show-from-left": {
          from: { opacity: "0", transform: "translate(-100%, 0)" },
          to: { opacity: "1", transform: "translate(0, 0)" },
        },
        "content-dismiss-to-left": {
          from: { opacity: "1", transform: "translate(0, 0)" },
          to: { opacity: "0", transform: "translate(-100%, 0)" },
        },
      },
      transitionTimingFunction: {
        shift: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "slide-down-and-fade":
          "slide-down-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-left-and-fade":
          "slide-left-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up-and-fade":
          "slide-up-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-right-and-fade":
          "slide-right-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        shine: "shine 5s ease-in-out infinite",
        "slide-down": "slide-down 400ms cubic-bezier(0.87, 0, 0.13, 1)",
        "slide-up": "slide-up 400ms cubic-bezier(0.87, 0, 0.13, 1)",
        "thumb-rock": "thumb-rock 500ms both",
        "overlay-show": "overlay-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "content-show": "content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "content-show-from-bottom":
          "content-show-from-bottom 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        "content-show-from-left":
          "content-show-from-left 500ms cubic-bezier(0.16, 1, 0.3, 1)",
        "content-dismiss-to-left":
          "content-dismiss-to-left 500ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
    // Defining the classes here to get proper intellisense
    // https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1269592872
    plugin(({ addBase, addComponents }) => {
      addBase({
        '[type="search"]::-webkit-search-decoration': {
          display: "none",
        },
        '[type="search"]::-webkit-search-cancel-button': {
          display: "none",
        },
        '[type="search"]::-webkit-search-results-button': {
          display: "none",
        },
        '[type="search"]::-webkit-search-results-decoration': {
          display: "none",
        },
      });
      addComponents({
        // Text
        ".t-default": {
          "@apply text-text-default": {},
        },
        ".t-muted": {
          "@apply text-text-muted dark:text-text-muted dark:[text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]":
            {},
        },
        ".t-accent": {
          "@apply text-accent-aa": {},
        },
        ".t-accent-aaa": {
          "@apply text-accent-aaa": {},
        },
        ".t-accent-contrast": {
          "@apply text-accent-contrast": {},
        },
        ".t-success": {
          "@apply text-intent-success": {},
        },
        ".t-warning": {
          "@apply text-intent-warning": {},
        },
        ".t-danger": {
          "@apply text-intent-danger": {},
        },
        ".text-intent-default": {
          "@apply text-text-default": {},
        },
        ".text-intent-none": {
          "@apply text-text-default": {},
        },
        // Background
        // ".bg-background": {
        //     "@apply bg-background-light dark:bg-background-dark": {},
        // },
        ".bg-background-translucent": {
          "@apply bg-background/70": {},
        },
        ".bg-sidebar": {
          "@apply bg-sidebar-background": {},
        },
        ".bg-header": {
          "@apply bg-header-background": {},
        },
        ".bg-card": {
          "@apply bg-card-background": {},
        },
        ".bg-card-surface": {
          "@apply bg-card dark:bg-white/5": {},
        },
        ".bg-border-primary": {
          "@apply bg-border-accent-muted": {},
        },
        // Border
        ".border-primary": {
          "@apply border-border-accent-muted": {},
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
        ".ring-border-primary": {
          "@apply ring-border-accent-muted": {},
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
        // ".shadow-tag-primary": {
        //     "@apply shadow-tag-primary": {},
        // },
        ".shadow-border-primary": {
          "@apply shadow-border-accent-muted": {},
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
};

// https://stackoverflow.com/a/72831219/4238485
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}
