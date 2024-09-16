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
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@next/next/recommended",
        "plugin:storybook/recommended",
        "turbo",
    ],
    plugins: ["import", "tailwindcss", "vitest"], // "react-refresh", "deprecation",
    env: {
        browser: true,
        es2021: true,
    },
    settings: {
        react: {
            version: "^18.3.1",
        },
        next: {
            rootDir: ["apps/docs-bundle/", "apps/local-preview-bundle", "apps/icons-cdn/"],
        },
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./**/tsconfig.json",
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
        allowAutomaticSingleRunInference: true,
        tsconfigRootDir: __dirname,
    },
    rules: {
        "import/no-default-export": "off",
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
        // "deprecation/deprecation": "error",
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
        "react/display-name": "off",
        // "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
    overrides: [
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
                "@typescript-eslint/no-empty-object-type": "off",
            },
        },
        {
            files: ["**/__test__/**/*"],
            rules: {
                "no-console": "off",
                "no-empty": "off",
                "@typescript-eslint/no-empty-function": "off",
                "@typescript-eslint/no-namespace": "off",
                "@typescript-eslint/no-floating-promises": "off",
                "@typescript-eslint/no-unused-vars": "off",
                "@typescript-eslint/explicit-module-boundary-types": "off",
                "react/display-name": "off",
                "@typescript-eslint/no-require-imports": "off",
            },
        },
        {
            files: ["**/*.cjs"],
            env: {
                node: true,
            },
            rules: {
                "@typescript-eslint/no-require-imports": "off",
            },
        },
    ],
};
