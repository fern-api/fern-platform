import { Highlighter, getHighlighter } from "shiki";
import { DARK_THEME, LIGHT_THEME, highlightTokens } from "../fernShiki";

let highlighter: Highlighter;

beforeAll(async () => {
    highlighter = await getHighlighter({
        langs: ["plaintext"],
        themes: [LIGHT_THEME, DARK_THEME],
    });
});

describe("highlightTokens", () => {
    it("should highlight tokens", () => {
        const code = "const a = 1;";
        const rawLang = "plaintext";
        expect(highlightTokens(highlighter, code, rawLang)).toMatchSnapshot();
    });

    it("should transform diff notation", () => {
        const code = `
const a = 1; // [!code --]
const b = 2; // [!code ++]
`;
        const rawLang = "plaintext";
        expect(highlightTokens(highlighter, code, rawLang)).toMatchSnapshot();
    });
});
