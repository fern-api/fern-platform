const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        "turbo",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:prettier/recommended",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-namespace": [
            "error",
            {
                allowDeclarations: true,
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            1,
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            },
        ],
    },
};
