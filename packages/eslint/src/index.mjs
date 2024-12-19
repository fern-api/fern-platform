import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import deprecation from "eslint-plugin-deprecation";
import _import from "eslint-plugin-import";
import tailwindcss from "eslint-plugin-tailwindcss";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/*.js", "**/*.jsx"],
}, ...fixupConfigRules(compat.extends(
    "prettier",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended",
    "plugin:@next/next/recommended",
)), {
    plugins: {
        deprecation,
        import: fixupPluginRules(_import),
        tailwindcss: fixupPluginRules(tailwindcss),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 12,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },

            project: ["./tsconfig.eslint.json", "./packages/**/tsconfig.json"],
            allowAutomaticSingleRunInference: true,
            tsconfigRootDir: "/Volumes/git/fern-platform/packages/eslint/src",
        },
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

    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],

        "@typescript-eslint/no-namespace": ["error", {
            allowDeclarations: true,
        }],

        "@typescript-eslint/explicit-module-boundary-types": ["error", {
            allowHigherOrderFunctions: false,
        }],

        "@typescript-eslint/no-floating-promises": ["error"],

        "@typescript-eslint/no-empty-function": ["error", {
            allow: ["private-constructors", "protected-constructors", "decoratedFunctions"],
        }],

        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-base-to-string": "error",
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-invalid-void-type": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "linebreak-style": ["error", "unix"],
        "no-console": "error",

        "no-empty": ["error", {
            allowEmptyCatch: true,
        }],

        "no-unused-vars": "off",

        quotes: ["error", "double", {
            avoidEscape: true,
        }],

        semi: ["error", "always"],
        indent: "off",
        "object-shorthand": ["error"],
        "deprecation/deprecation": "error",

        "import/no-internal-modules": ["error", {
            forbid: ["@fern-ui/*/**", "@fern-docs/*/**"],
        }],

        eqeqeq: ["error", "always", {
            null: "never",
        }],

        curly: "error",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "tailwindcss/no-custom-classname": "off",
        "@next/next/no-html-link-for-pages": "off",
        "@next/next/no-img-element": "off",
    },
}];