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
                "sidebar-width": "var(--spacing-sidebar-width)",
                "header-height": "var(--spacing-header-height)",
                "header-height-padded": "calc(var(--spacing-header-height) + 1rem)",
                "vh-minus-header": "calc(100vh - var(--spacing-header-height))",
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
                header: "0px 4px 24px 0px rgba(var(--accent-primary), 10%)",
                "header-dark": "0px 4px 24px 0px rgba(var(--accent-primary-dark), 10%)",
                "card-light": "0 1px 2px rgba(17,20,24,.06)",
                "card-light-elevated": "0 1px 2px rgba(17,20,24,.1), 0 3px 6px rgba(17,20,24,.06)",
                "card-dark": "0 2px 4px rgba(221, 243, 255,.07)",
                "card-dark-elevated": "0 2px 4px rgba(221, 243, 255,.1), 0 2px 24px rgba(221, 243, 255,.07)",
            },

            colors: {
                "accent-primary-light": withOpacity("--accent-primary"),
                "accent-primary-darkened": withOpacity("--accent-primary-darkened"),
                "accent-primary-dark": withOpacity("--accent-primary-dark"),
                "accent-primary-dark-lightened": withOpacity("--accent-primary-dark-lightened"),
                "accent-primary-contrast": withOpacity("--accent-primary-contrast"),
                "accent-primary-dark-contrast": withOpacity("--accent-primary-dark-contrast"),
                "accent-highlight": "rgba(var(--accent-primary), 10%)",
                "accent-highlight-dark": "rgba(var(--accent-primary-dark), 10%)",
                background: withOpacity("--background"),
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

                "intent-default": "rgba(0, 0, 0, 0.5)",
                "intent-default-dark": "rgba(255, 255, 255, 0.6)",
                "intent-warning-dark": "#F8D26F",
                "intent-warning-dark-lightened": "#F8D476",
                "intent-warning-light": "#D97706",
                "intent-warning-light-darkened": "#CE7106",
                "intent-success-dark": "#4ADE80",
                "intent-success-dark-lightened": "#53E186",
                "intent-success-light": "#16A34A",
                "intent-success-light-darkened": "#159B46",
                "intent-danger-dark": "#F87171",
                "intent-danger-dark-lightened": "#F87878",
                "intent-danger-light": "#DC2626",
                "intent-danger-light-darkened": "#D12424",

                "background-primary-dark": "rgb(3, 7, 18)",
                "background-primary-light": "rgb(255, 255, 255)",
                "background-secondary-dark": "rgb(17, 24, 39)",
                "background-secondary-light": "rgb(249, 250, 251)",
                "background-tertiary-dark": "rgb(31, 41, 55)",
                "background-tertiary-light": "rgb(243, 244, 246)",

                "background-hover-dark": "rgba(151, 90, 90, 0.05)",
                "background-hover-light": "rgba(3, 7, 18, 0.05)",

                "border-default-dark": "rgba(221, 243, 255, 0.18)",
                "border-default-light": "rgba(2, 2, 44, 0.15)",
                "border-concealed-dark": "rgba(156, 163, 175, 0.15)",
                "border-concealed-light": "rgba(72, 72, 72, 0.10)",
                "border-primary": "rgba(var(--accent-primary), 0.30)",
                "border-primary-dark": "rgba(var(--accent-primary-dark), 0.30)",
                "border-warning-dark": "rgba(251, 191, 36, 0.30)",
                "border-warning-light": "rgba(217, 119, 6, 0.30)",
                "border-success-dark": "rgba(74, 222, 128, 0.30)",
                "border-success-light": "rgba(22, 163, 74, 0.30)",
                "border-danger-dark": "rgba(248, 113, 113, 0.30)",
                "border-danger-light": "rgba(220, 38, 38, 0.30)",

                "text-default-dark": "rgb(255, 255, 255)",
                "text-default-light": "rgb(3,7,18)",
                "text-muted-light": "rgb(0, 0, 0, 0.52)",
                "text-muted-dark": "rgb(255, 255, 255, 0.68)",
                "text-disabled-light": "rgb(209, 213, 219)",
                "text-disabled-dark": "rgb(107, 114, 128)",

                "tag-default-dark": "rgba(255, 255, 255, 10%)",
                "tag-default-light": "rgba(3, 7, 18, 5%)",
                "tag-primary-light": "rgba(var(--accent-primary), 15%)",
                "tag-primary-dark": "rgba(var(--accent-primary-dark), 15%)",
                "tag-warning-dark": "rgba(251, 190, 36, 0.15)",
                "tag-warning-light": "rgba(217, 119, 6, 0.10)",
                "tag-success-dark": "rgba(74, 222, 128, 0.15)",
                "tag-success-light": "rgba(22, 163, 74, 0.15)",
                "tag-danger-light": "rgba(220, 38, 38, 0.10)",
                "tag-danger-dark": "rgba(248, 113, 113, 0.15)",
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        // Defining the classes here to get proper intellisense
        // https://github.com/tailwindlabs/tailwindcss-intellisense/issues/227#issuecomment-1269592872
        plugin(({ addComponents }) => {
            addComponents({
                // Text
                ".t-default": {
                    "@apply text-text-default-light dark:text-text-default-dark": {},
                },
                ".t-muted": {
                    "@apply text-intent-default dark:text-intent-default-dark": {},
                },
                ".text-accent-primary": {
                    "@apply text-accent-primary-light dark:text-accent-primary-dark": {},
                },
                ".t-primary": {
                    "@apply text-accent-primary-light dark:text-accent-primary-dark": {},
                },
                ".t-success": {
                    "@apply text-intent-success-light dark:text-intent-success-dark": {},
                },
                ".t-warning": {
                    "@apply text-intent-warning-light dark:text-intent-warning-dark": {},
                },
                ".t-danger": {
                    "@apply text-intent-danger-light dark:text-intent-danger-dark": {},
                },
                // Background
                ".bg-accent-primary": {
                    "@apply bg-accent-primary-light dark:bg-accent-primary-dark": {},
                },
                ".bg-tag-default": {
                    "@apply bg-tag-default-light dark:bg-tag-default-dark": {},
                },
                ".bg-tag-primary": {
                    "@apply bg-tag-primary-light dark:bg-tag-primary-dark": {},
                },
                ".bg-tag-success": {
                    "@apply bg-tag-success-light dark:bg-tag-success-dark": {},
                },
                ".bg-tag-warning": {
                    "@apply bg-tag-warning-light dark:bg-tag-warning-dark": {},
                },
                ".bg-tag-danger": {
                    "@apply bg-tag-danger-light dark:bg-tag-danger-dark": {},
                },
                // Border
                ".border-accent-primary": {
                    "@apply border-accent-primary-light dark:border-accent-primary-dark": {},
                },
                ".border-concealed": {
                    "@apply border-border-concealed-light dark:border-border-concealed-dark": {},
                },
                ".border-default": {
                    "@apply border-border-default-light dark:border-border-default-dark": {},
                },
                ".border-success": {
                    "@apply border-border-success-light dark:border-border-success-dark": {},
                },
                ".border-warning": {
                    "@apply border-border-warning-light dark:border-border-warning-dark": {},
                },
                ".border-danger": {
                    "@apply border-border-danger-light dark:border-border-danger-dark": {},
                },
                ".outline-accent-primary": {
                    "@apply outline-accent-primary-light dark:outline-accent-primary-dark": {},
                },
                ".ring-accent-primary": {
                    "@apply ring-accent-primary-light dark:ring-accent-primary-dark": {},
                },
                ".decoration-accent-primary": {
                    "@apply decoration-accent-primary-light dark:decoration-accent-primary-dark": {},
                },
            });
        }),
    ],
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
