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
        "plugin:vitest/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:tailwindcss/recommended",
        "plugin:@next/next/recommended",
    ],
    plugins: ["deprecation", "import", "eslint-plugin-tailwindcss"],
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
                rootDir: "packages/docs-bundle/",
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
        "@typescript-eslint/explicit-module-boundary-types": ["off"],
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
        "linebreak-style": ["error", "unix"],
        "no-console": "error",
        "no-empty": [
            "error",
            {
                allowEmptyCatch: true,
            },
        ],
        "no-unused-vars": "off",
        "tailwindcss/classnames-order": "off",
        quotes: [
            "error",
            "double",
            {
                avoidEscape: true,
            },
        ],
        semi: ["error", "always"],
        indent: "off",
        "object-shorthand": ["error"],
        "deprecation/deprecation": "warn",
        // "import/no-internal-modules": ["error"],
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
        "react-hooks/exhaustive-deps": [
            "warn",
            {
                additionalHooks: "(useMemoOne|useCallbackOne)",
            },
        ],
    },
    overrides: [
        {
            // enable the rule specifically for TypeScript files
            files: ["*.ts", "*.mts", "*.cts", "*.tsx"],
            rules: {
                "@typescript-eslint/explicit-module-boundary-types": [
                    "error",
                    {
                        allowHigherOrderFunctions: false,
                    },
                ],
            },
        },
        {
            files: ["packages/fdr-sdk/**/*", "servers/fdr-deploy/**/*", "servers/fdr/**/*"],
            rules: {
                "@typescript-eslint/explicit-module-boundary-types": "off",
                "@typescript-eslint/no-explicit-any": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/no-floating-promises": "off",
                "@typescript-eslint/no-base-to-string": "off",
            },
        },
        {
            files: ["servers/fdr/**/*", "servers/fern-bot/**/*"],
            rules: {
                eqeqeq: "off",
                "no-console": "off",
            },
        },
        {
            files: ["packages/ui/**/*"],
            rules: {
                "@typescript-eslint/no-explicit-any": "off",
            },
        },
    ],
};
