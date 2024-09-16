/** @type {import('prettier').Config} */
module.exports = {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    overrides: [
        {
            files: "**/*.{yml,yaml,json,md,mdx}",
            options: {
                tabWidth: 2
            }
        },
        {
            files: "**/*.{json,cjs}",
            options: {
                trailingComma: "none"
            }
        }
    ],
    plugins: ["prettier-plugin-packagejson", "prettier-plugin-tailwindcss"]
};
