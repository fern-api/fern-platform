import { buildAuthHeaders } from "./auth-headers";

describe("auth-headers", () => {
  it("should construct proper basic auth encoding", () => {
    const header = buildAuthHeaders(
      { type: "basicAuth", usernameName: "", passwordName: "" },
      { basicAuth: { username: "abc", password: "def" } },
      { redacted: false }
    );

    const encodedToken = header.Authorization?.replace("Basic ", "");

    expect(encodedToken).not.toBeUndefined();
    if (encodedToken) {
      expect(atob(encodedToken)).toEqual("abc:def");
    }
  });

  it("should construct obfuscate auth encoding when redacted", () => {
    const header = buildAuthHeaders(
      { type: "basicAuth", usernameName: "", passwordName: "" },
      { basicAuth: { username: "abc", password: "def" } },
      { redacted: true }
    );

    const encodedToken = header.Authorization?.replace("Basic ", "");

    expect(encodedToken).not.toBeUndefined();
    if (encodedToken) {
      expect(atob(encodedToken)).toEqual(`abc:d${"*".repeat(25)}ef`);
    }
  });
});
