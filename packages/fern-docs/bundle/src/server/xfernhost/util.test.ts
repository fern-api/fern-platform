import { cleanHost } from "./util";

describe("cleanHost", () => {
  it("handles comma-separated domains by taking the first one", () => {
    expect(cleanHost("example.com,another.com")).toBe("example.com");
    expect(cleanHost("first.domain.com, second.domain.com")).toBe(
      "first.domain.com"
    );
    expect(cleanHost("api.test.com,www.test.com,test.com")).toBe(
      "api.test.com"
    );
  });
});
