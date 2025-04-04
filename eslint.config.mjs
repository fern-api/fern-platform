// @ts-check
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboConfig from "eslint-config-turbo/flat";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import vitest from "eslint-plugin-vitest";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default [
  {
    ignores: [
      "**/.storybook",
      "**/generated",
      "**/dist",
      "**/build",
      "**/.next",
      "**/storybook-static",
      "**/out",
      "**/lib",
      "**/node_modules",
      "fern/**",
      "**/__snapshots__",
      "**/*.config.ts",
      "**/*.config.mjs",
      "**/scripts/performance.ts",
    ],
  },
  ...turboConfig,
  ...tseslint.config(
    {
      ignores: [
        "**/generated",
        "**/dist",
        "**/build",
        "**/.next",
        "**/storybook-static",
        "**/out",
        "**/lib",
        "**/node_modules",
        "fern/**",
        "**/__snapshots__",
      ],
      plugins: {
        "unused-imports": unusedImports,
      },
      rules: {
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "error",
          {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
            destructuredArrayIgnorePattern: "^_",
            ignoreRestSiblings: true,
          },
        ],
      },
    },

    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          project: ["./tsconfig.eslint.json"],
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },

    ...compat.config({
      extends: ["next/core-web-vitals", "next/typescript"],
      settings: {
        next: {
          rootDir: [
            "packages/fern-docs/bundle",
            "packages/fern-dashboard",
            "packages/fern-docs/search-ui",
            "playwright/forward-proxy/nextjs-proxy",
          ],
        },
        react: {
          version: "19",
        },
      },
    }),

    {
      files: ["**/*.test.{ts,tsx}"],
      plugins: {
        vitest,
      },
      rules: {
        ...vitest.configs.recommended.rules,
        "@typescript-eslint/no-empty-function": "off",
      },
      settings: {
        vitest: {
          typecheck: true,
        },
      },
      languageOptions: {
        globals: {
          ...vitest.environments.env.globals,
        },
      },
    },

    {
      plugins: {
        "react-hooks": reactHooks,
      },
      rules: {
        "no-unused-vars": "off",
        "no-undef": "off",
        "no-empty": ["error", { allowEmptyCatch: true }],
        eqeqeq: ["error", "always", { null: "never" }],
        "@typescript-eslint/no-deprecated": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-function": [
          "error",
          {
            allow: [
              "private-constructors",
              "protected-constructors",
              "decoratedFunctions",
            ],
          },
        ],
        "@typescript-eslint/no-namespace": [
          "error",
          { allowDeclarations: true },
        ],
        "@next/next/no-html-link-for-pages": "off",
        "react-hooks/exhaustive-deps": [
          "warn",
          {
            additionalHooks: "(useMemoOne|useCallbackOne)",
          },
        ],
        "@typescript-eslint/no-floating-promises": "error",
      },
    },

    {
      rules: {
        // TODO: remove these:
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/no-duplicate-type-constituents": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-redundant-type-constituents": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/no-unnecessary-type-parameters": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/prefer-find": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/prefer-regexp-exec": "off",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/require-await": "off",
        "import/no-anonymous-default-export": "off",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
      },
    },
    {
      files: [
        "packages/fern-docs/**/*",
        "packages/fern-dashboard/**/*",
        "packages/commons/**/*",
        "packages/scripts/**/*",
        "packages/healthchecks/**/*",
        "packages/template-resolver/**/*",
      ],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-base-to-string": "off",
      },
    },
    {
      files: ["packages/parsers/**/*"],
      rules: {
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-invalid-void-type": "off",
      },
    },
    {
      files: ["servers/fern-bot/**/*"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/return-await": "off",
        "@typescript-eslint/prefer-promise-reject-errors": "off",
        "@typescript-eslint/no-deprecated": "off",
      },
    },
    {
      files: [
        "packages/fern-docs/search-server/src/algolia/records/archive/**/*",
      ],
      rules: {
        "@typescript-eslint/no-base-to-string": "off",
      },
    },
    {
      files: ["servers/fdr/src/**/*"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-base-to-string": "off",
        "@typescript-eslint/no-explicit-any": "off",
        eqeqeq: "off",
      },
    }
  ),
  eslintConfigPrettier,
];
