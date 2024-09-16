module.exports = {
    "**/*.ts{,x}": ["eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js", "pnpm format"],
    "**/*.{js,json,yml,html,css,less,scss,md}": "pnpm format",
    "**/package.json": () => "pnpm install --immutable",
};
