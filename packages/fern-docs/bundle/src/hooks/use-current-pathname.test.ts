import { parseServerSidePathname } from "./use-current-pathname";

describe("parseServerSidePathname", () => {
  it("should return the slug", () => {
    expect(
      parseServerSidePathname(
        "/canary.ferndocs.com/buildwithfern.com/static/%2Flearn%2Fsdks%2Fcapabilities%2Fwebsockets"
      )
    ).toEqual("/learn/sdks/capabilities/websockets");
  });

  it("should return the pathname if it's not a server-side pathname", () => {
    expect(parseServerSidePathname("/api-app-run-logs")).toEqual(
      "/api-app-run-logs"
    );
  });

  it("should return /~explorer if the pathname is an explorer route", () => {
    expect(
      parseServerSidePathname(
        "/canary.ferndocs.com/buildwithfern.com/explorer/%2Fapi%2Ftest"
      )
    ).toEqual("/api/test/~explorer");
  });
});
