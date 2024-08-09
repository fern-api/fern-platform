import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,ts,tsx}", "../components/src/FernScrollArea.tsx"],
    theme: {
        colors: {
            current: "currentColor",
            transparent: "transparent",
            white: "#ffffff",
            black: "#000000",
            tag: {
                default: "var(--tag-default)",
            },
            border: {
                accent: {
                    muted: "var(--border-accent-muted)",
                },
            },
            grayscale: {
                1: "var(--gray-1)",
                2: "var(--gray-2)",
                3: "var(--gray-3)",
                4: "var(--gray-4)",
                5: "var(--gray-5)",
                6: "var(--gray-6)",
                7: "var(--gray-7)",
                8: "var(--gray-8)",
                9: "var(--gray-9)",
                10: "var(--gray-10)",
                11: "var(--gray-11)",
                12: "var(--gray-12)",
                a1: "var(--gray-a1)",
                a2: "var(--gray-a2)",
                a3: "var(--gray-a3)",
                a4: "var(--gray-a4)",
                a5: "var(--gray-a5)",
                a6: "var(--gray-a6)",
                a7: "var(--gray-a7)",
                a8: "var(--gray-a8)",
                a9: "var(--gray-a9)",
                a10: "var(--gray-a10)",
                a11: "var(--gray-a11)",
                a12: "var(--gray-a12)",
            },
        },
        extend: {},
    },
    plugins: [typography],
    future: {
        hoverOnlyWhenSupported: true,
    },
    darkMode: "class",
};
