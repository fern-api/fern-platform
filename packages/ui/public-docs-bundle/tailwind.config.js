const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */

module.exports = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "../app/src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            spacing: {
                "page-width": "var(--spacing-page-width)",
                "content-width": "var(--spacing-content-width)",
                "endpoint-width": "calc(var(--spacing-content-width) * 2 + 3rem)",
                "sidebar-width": "var(--spacing-sidebar-width)",
                "header-height": "var(--spacing-header-height)",
                "header-height-padded": "calc(var(--spacing-header-height) + 1rem)",
                "vh-minus-header": "calc(100vh - var(--spacing-header-height))",
                icon: "15px",
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
                header: "0px 4px 24px 0px rgba(var(--accent-primary-light), 10%)",
                "header-dark": "0px 4px 24px 0px rgba(var(--accent-primary-dark), 10%)",
                "card-light": "0 1px 2px rgba(17,20,24,.06)",
                "card-light-elevated": "0 1px 2px rgba(17,20,24,.1), 0 3px 6px rgba(17,20,24,.06)",
                "card-dark": "0 2px 4px rgba(221, 243, 255,.07)",
                "card-dark-elevated": "0 2px 4px rgba(221, 243, 255,.1), 0 2px 24px rgba(221, 243, 255,.07)",
            },

            colors: {
                "accent-primary-light": withOpacity("--accent-primary-light"),
                "accent-primary-dark": withOpacity("--accent-primary-dark"),
                "accent-primary-aa-light": withOpacity("--accent-primary-aa-light"),
                "accent-primary-aa-dark": withOpacity("--accent-primary-aa-dark"),
                "accent-primary-aaa-light": withOpacity("--accent-primary-aaa-light"),
                "accent-primary-aaa-dark": withOpacity("--accent-primary-aaa-dark"),
                "accent-primary-light-tinted": withOpacity("--accent-primary-light-tinted"),
                "accent-primary-dark-tinted": withOpacity("--accent-primary-dark-tinted"),
                "accent-primary-light-contrast": withOpacity("--accent-primary-light-contrast"),
                "accent-primary-dark-contrast": withOpacity("--accent-primary-dark-contrast"),
                "accent-highlight-light": "rgba(var(--accent-primary-light), 20%)",
                "accent-highlight-dark": "rgba(var(--accent-primary-dark), 20%)",
                "accent-highlight-faded-light": "rgba(var(--accent-primary-light), 10%)",
                "accent-highlight-faded-dark": "rgba(var(--accent-primary-dark), 10%)",
                "background-light": withOpacity("--background-light"),
                "background-dark": withOpacity("--background-dark"),

                "method-get": "#49A68C",
                "method-post": "#487FAB",
                "method-delete": "#E75B4D",
                "method-put": "#E99368",
                "method-patch": "#E99368",
                "method-get-dark": "#A7F3D0",
                "method-post-dark": "#70ABEC",
                "method-delete-dark": "#F87F71",
                "method-put-dark": "#FDBA74",
                "method-patch-dark": "#FDBA74",

                "intent-default": "var(--gray-a11)",
                "intent-default-lightened": "var(--gray-a12)",
                "intent-warning": "var(--amber-a11)",
                "intent-warning-lightened": "var(--amber-a12)",
                "intent-success": "var(--green-a11)",
                "intent-success-lightened": "var(--green-a12)",
                "intent-danger": "var(--red-a11)",
                "intent-danger-lightened": "var(--red-a12)",

                "background-primary-dark": "rgb(3, 7, 18)",
                "background-primary-light": "rgb(255, 255, 255)",
                "background-secondary-dark": "rgb(17, 24, 39)",
                "background-secondary-light": "rgb(249, 250, 251)",
                "background-tertiary-dark": "rgb(31, 41, 55)",
                "background-tertiary-light": "rgb(243, 244, 246)",

                "background-hover-dark": "rgba(151, 90, 90, 0.05)",
                "background-hover-light": "rgba(3, 7, 18, 0.05)",

                "border-default": "var(--gray-a5)",
                "border-concealed": "var(--gray-a3)",
                "border-accent-muted-light": "rgba(var(--accent-primary-light), 0.50)",
                "border-accent-muted-dark": "rgba(var(--accent-primary-dark), 0.50)",
                "border-warning": "var(--amber-a8)",
                "border-success": "var(--green-a8)",
                "border-danger": "var(--red-a8)",

                "border-default-soft": "var(--gray-a6)",
                "border-primary-light-soft": "rgba(var(--accent-primary-light), 30%)",
                "border-primary-dark-soft": "rgba(var(--accent-primary-dark), 30%)",
                "border-warning-soft": "var(--amber-a6)",
                "border-success-soft": "var(--green-a6)",
                "border-danger-soft": "var(--red-a6)",

                "text-default-dark": "#FFFFFF",
                "text-default-light": "#000000",
                "text-muted": "var(--gray-a11)",
                "text-disabled": "var(--gray-a10)",
                faded: "var(--gray-a9)",

                "tag-default-soft": "var(--gray-a2)",
                "tag-primary-soft-light": "rgba(var(--accent-primary-light), 10%)",
                "tag-primary-soft-dark": "rgba(var(--accent-primary-dark), 10%)",
                "tag-warning-soft": "var(--amber-a2)",
                "tag-success-soft": "var(--green-a2)",
                "tag-danger-soft": "var(--red-a2)",

                "tag-default": "var(--gray-a3)",
                "tag-default-hover": "var(--gray-a4)",
                "tag-primary-light": "rgba(var(--accent-primary-light), 15%)",
                "tag-primary-dark": "rgba(var(--accent-primary-dark), 15%)",
                "tag-warning": "var(--amber-a3)",
                "tag-success": "var(--green-a3)",
                "tag-danger": "var(--red-a3)",
            },
            typography: {
                DEFAULT: {
                    css: {
                        color: "#000000",
                        maxWidth: "var(--spacing-content-width)",
                        "--tw-prose-bold": "inherit",
                        "--tw-prose-links": "inherit",
                    },
                },
                sm: {
                    css: {
                        color: "var(--gray-a11)",
                    },
                },
                invert: {
                    css: {
                        color: "#ffffff",
                        "--tw-prose-bold": "inherit",
                        "--tw-prose-links": "inherit",
                    },
                },
                "invert-sm": {
                    css: {
                        color: "var(--gray-a11)",
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
                    "0%": { opacity: "0.5", transform: "translateX(-100px) skewX(-15deg)" },
                    "33%": { opacity: "0.6", transform: "translateX(300px) skewX(-15deg)" },
                    "100%": { opacity: "0.6", transform: "translateX(300px) skewX(-15deg)" },
                },
                "slide-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "slide-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
            },
            transitionTimingFunction: {
                shift: "cubic-bezier(0.16, 1, 0.3, 1)",
            },
            animation: {
                "slide-down-and-fade": "slide-down-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-left-and-fade": "slide-left-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-up-and-fade": "slide-up-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                "slide-right-and-fade": "slide-right-and-fade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
                shine: "shine 5s ease-in-out infinite",
                "slide-down": "slide-down 400ms cubic-bezier(0.87, 0, 0.13, 1)",
                "slide-up": "slide-up 400ms cubic-bezier(0.87, 0, 0.13, 1)",
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms"),
        // Defining the classes here to get proper intellisense
        // https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1269592872
        plugin(({ addComponents }) => {
            addComponents({
                // Text
                ".t-default": {
                    "@apply text-text-default-light dark:text-text-default-dark": {},
                },
                ".t-muted": {
                    "@apply text-text-muted dark:text-text-muted dark:[text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]": {},
                },
                ".text-accent-primary": {
                    "@apply text-accent-primary-light dark:text-accent-primary-dark": {},
                },
                ".t-accent": {
                    "@apply text-accent-primary-aa-light dark:text-accent-primary-aa-dark": {},
                },
                ".t-accent-aaa": {
                    "@apply text-accent-primary-aaa-light dark:text-accent-primary-aaa-dark": {},
                },
                ".t-accent-contrast": {
                    "@apply text-accent-primary-light-contrast dark:text-accent-primary-dark-contrast": {},
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
                // Background
                ".bg-background": {
                    "@apply bg-background-light dark:bg-background-dark": {},
                },
                ".bg-background-translucent": {
                    "@apply bg-background-light/70 dark:bg-background-dark/70": {},
                },
                ".bg-accent": {
                    "@apply bg-accent-primary-light dark:bg-accent-primary-dark": {},
                },
                ".bg-accent-muted": {
                    "@apply bg-accent-primary-light/70 dark:bg-accent-primary-dark/70": {},
                },
                ".bg-accent-aa": {
                    "@apply bg-accent-primary-aa-light dark:bg-accent-primary-aa-dark": {},
                },
                ".bg-accent-aaa": {
                    "@apply bg-accent-primary-aaa-light dark:bg-accent-primary-aaa-dark": {},
                },
                ".bg-accent-contrast": {
                    "@apply bg-accent-primary-light-contrast dark:bg-accent-primary-dark-contrast": {},
                },
                ".bg-accent-tinted": {
                    "@apply bg-accent-primary-light-tinted dark:bg-accent-primary-dark-tinted": {},
                },
                ".bg-accent-highlight": {
                    "@apply bg-accent-primary-light/20 dark:bg-accent-primary-dark/20": {},
                },
                ".bg-accent-highlight-faded": {
                    "@apply bg-accent-primary-light/10 dark:bg-accent-primary-dark/10": {},
                },
                // ".bg-tag-default": {
                //     "@apply bg-tag-default": {},
                // },
                ".bg-tag-primary": {
                    "@apply bg-tag-primary-light dark:bg-tag-primary-dark": {},
                },
                ".bg-border-primary": {
                    "@apply bg-border-accent-muted-light dark:bg-border-accent-muted-dark": {},
                },
                // ".bg-tag-success": {
                //     "@apply bg-tag-success-light dark:bg-tag-success-dark": {},
                // },
                // ".bg-tag-warning": {
                //     "@apply bg-tag-warning-light dark:bg-tag-warning-dark": {},
                // },
                // ".bg-tag-danger": {
                //     "@apply bg-tag-danger-light dark:bg-tag-danger-dark": {},
                // },
                // Border
                ".border-accent-primary": {
                    "@apply border-accent-primary-light dark:border-accent-primary-dark": {},
                },
                ".border-primary": {
                    "@apply border-border-accent-muted-light dark:border-border-accent-muted-dark": {},
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
                ".outline-accent-primary": {
                    "@apply outline-accent-primary-light dark:outline-accent-primary-dark": {},
                },
                ".outline-tag-primary": {
                    "@apply outline-tag-primary-light dark:outline-tag-primary-dark": {},
                },
                ".ring-default": {
                    "@apply ring-border-default": {},
                },
                ".ring-accent-primary": {
                    "@apply ring-accent-primary-light dark:ring-accent-primary-dark": {},
                },
                ".ring-border-primary": {
                    "@apply ring-border-accent-muted-light dark:ring-border-accent-muted-dark": {},
                },
                ".decoration-accent-primary": {
                    "@apply decoration-accent-primary-light dark:decoration-accent-primary-dark": {},
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
                    "@apply bg-tag-default-soft ring-1 ring-inset ring-border-default-soft": {},
                },
                ".callout-outlined-success": {
                    "@apply bg-tag-success-soft ring-1 ring-inset ring-border-success-soft": {},
                },
                ".callout-outlined-warning": {
                    "@apply bg-tag-warning-soft ring-1 ring-inset ring-border-warning-soft": {},
                },
                ".callout-outlined-danger": {
                    "@apply bg-tag-danger-soft ring-1 ring-inset ring-border-danger-soft": {},
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
                ".shadow-tag-primary": {
                    "@apply shadow-tag-primary-light dark:shadow-tag-primary-dark": {},
                },
                ".shadow-border-primary": {
                    "@apply shadow-border-accent-muted-light dark:shadow-border-accent-muted-dark": {},
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
