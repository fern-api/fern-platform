import { sanitizeBreaks } from "../sanitize-breaks";

describe("sanitizeBreaks", () => {
  it("should replace <br> with <br />", () => {
    expect(sanitizeBreaks("<br>")).toBe("<br />");
    expect(sanitizeBreaks("<br/>")).toBe("<br />");
    expect(sanitizeBreaks("<br />")).toBe("<br />");
    expect(sanitizeBreaks("<br></br>")).toBe("<br />");
    expect(sanitizeBreaks("<br \n />")).toBe("<br />");
    expect(sanitizeBreaks("</br>")).toBe("");

    expect(sanitizeBreaks("<br></br>\n\n<br></br>")).toBe("<br />\n\n<br />");
  });
});
