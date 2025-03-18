import { getOryAuthorizationUrl } from "./ory";

describe("OAuth2Client", () => {
  it("should create an appropriate redirect url", () => {
    const url = getOryAuthorizationUrl(
      {
        type: "oauth2",
        partner: "ory",
        environment: "https://example.com/oauth2",
        scope: "a b",
        clientId: "testing-client-id",
        clientSecret: "testing-client-secret",
        "api-key-injection-enabled": true,
      },
      {
        state: "https://example.com/redirect",
      }
    );
    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://example.com");
    expect(parsed.pathname).toBe("/oauth2/auth");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("client_id")).toBe("testing-client-id");
    expect(parsed.searchParams.get("scope")).toBe("a b");
  });
});
