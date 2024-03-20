/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
    root: true,
    extends: ["@fern-api/eslint-config"],
    plugins: [],
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ["src/client/generated"],
    rules: {
        "jest/expect-expect": "off",
        "jest/valid-expect": "off",
        "jest/no-standalone-expect": "off",
        "jest/no-conditional-expect": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "@typescript-eslint/no-base-to-string": "off",
    },
};
