/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
    root: true,
    extends: [
        "prettier",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:jest/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:tailwindcss/recommended",
        "plugin:@next/next/recommended",
    ],
    plugins: ["jest", "deprecation", "import", "eslint-plugin-tailwindcss"],
    env: {
        browser: true,
        es2021: true,
    },
    settings: {
        react: {
            version: "^18.2.0",
        },
        settings: {
            next: {
                rootDir: "packages/public-docs-bundle/",
            },
        },
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
        project: ["./tsconfig.eslint.json", "./packages/**/tsconfig.json"],
        allowAutomaticSingleRunInference: true,
        tsconfigRootDir: __dirname,
    },
    env: {
        "jest/globals": true,
    },
    ignorePatterns: ["*.js", "*.jsx"],
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
                ignoreRestSiblings: true,
            },
        ],
        "@typescript-eslint/no-namespace": [
            "error",
            {
                allowDeclarations: true,
            },
        ],
        "@typescript-eslint/explicit-module-boundary-types": [
            "error",
            {
                allowHigherOrderFunctions: false,
            },
        ],
        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/no-empty-function": [
            "error",
            {
                allow: ["private-constructors", "protected-constructors", "decoratedFunctions"],
            },
        ],
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-base-to-string": "error",
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-invalid-void-type": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "jest/expect-expect": ["error", { assertFunctionNames: ["expect*"] }],
        "linebreak-style": ["error", "unix"],
        "no-console": "error",
        "no-empty": [
            "error",
            {
                allowEmptyCatch: true,
            },
        ],
        "no-unused-vars": "off",
        quotes: [
            "error",
            "double",
            {
                avoidEscape: true,
            },
        ],
        semi: ["error", "always"],
        indent: "off",
        "jest/unbound-method": ["error"],
        "object-shorthand": ["error"],
        "deprecation/deprecation": "error",
        "import/no-internal-modules": [
            "error",
            {
                forbid: ["@fern-ui/*/**"],
            },
        ],
        eqeqeq: [
            "error",
            "always",
            {
                null: "never",
            },
        ],
        curly: "error",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "tailwindcss/no-custom-classname": "off",
        "@next/next/no-html-link-for-pages": "off",
        "@next/next/no-img-element": "off",
    },
};
