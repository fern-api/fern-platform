import { replaceBrokenBrTags } from "../replaceBrokenBrTags";

describe("replaceBrokenBrTags", () => {
    it("should replace <br> with <br />", () => {
        expect(replaceBrokenBrTags("<br>")).toBe("<br />");
        expect(replaceBrokenBrTags("<br/>")).toBe("<br />");
        expect(replaceBrokenBrTags("<br />")).toBe("<br />");
        expect(replaceBrokenBrTags("<br></br>")).toBe("<br />");
        expect(replaceBrokenBrTags("<br \n />")).toBe("<br />");
        expect(replaceBrokenBrTags("</br>")).toBe("");

        expect(replaceBrokenBrTags("<br></br>\n\n<br></br>")).toBe("<br />\n\n<br />");
    });
});
