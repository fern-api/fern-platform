const baseConfig = require("../tailwind.config.cjs");

/** @type {import('tailwindcss').Config} */
export default {
    ...baseConfig,
    darkMode: ["class"],
    content: ["./src/**/*.{ts,tsx}", "./node_modules/@fern-ui/components/src/**/*.{ts,tsx}"],
    theme: {
        ...baseConfig.theme,
        extend: {
            ...baseConfig.theme.extend,
            colors: {
                ...baseConfig.theme.extend.colors,
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "#FBFFFA",
                foreground: "#081008",
                black: "#081008",
                primary: {
                    DEFAULT: "#FBFFFA",
                    foreground: "#FBFFFA",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "#1EA32A",
                    foreground: "#1EA32A",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
        },
    },
    plugins: [...baseConfig.plugins, require("tailwindcss-animate")],
};
