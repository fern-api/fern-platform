module.exports = {
    root: true,
    extends: ["custom/server"],
    parserOptions: {
        project: "tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ["src/generated"],
};
