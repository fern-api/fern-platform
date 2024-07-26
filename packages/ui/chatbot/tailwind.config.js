import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,ts,tsx}"],
    theme: {
        extend: {},
    },

    plugins: [typography],
};
