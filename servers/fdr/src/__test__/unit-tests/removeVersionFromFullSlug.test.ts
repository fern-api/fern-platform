import { FdrAPI } from "@fern-api/fdr-sdk";

import { NavigationContext } from "../../services/algolia/NavigationContext";

describe("removeVersionFromFullSlug", () => {
  it("should remove version from beginning of full slug", () => {
    const fullSlug = ["v2", "full-slug", "sub-slug", "v2"];
    const result = new NavigationContext(
      {
        type: "versioned",
        id: FdrAPI.IndexSegmentId("some navigation context id") as any,
        searchApiKey: "search api key",
        version: {
          id: FdrAPI.VersionId("some id") as any,
          urlSlug: "v2",
        },
      },
      []
    ).withFullSlug(fullSlug);

    expect(result.path).toBe("full-slug/sub-slug/v2");
  });
});
