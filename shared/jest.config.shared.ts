import { Config } from "jest";

const config: Config = {
    testMatch: ["**/__test__/**/*.test.ts{,x}"],
    transform: {
        "\\.[jt]sx?$": ["babel-jest", { rootMode: "upward" }],
    },
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es|next-mdx-remote|@mdx-js|estree-util-|estree-util-build-jsx|)"],
};

export default config;
