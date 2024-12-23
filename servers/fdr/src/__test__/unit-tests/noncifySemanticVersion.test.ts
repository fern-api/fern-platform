import { noncifySemanticVersion } from "../../db/generators/noncifySemanticVersion";

describe("noncify semantic release versions", () => {
  it("test", () => {
    expect(noncifySemanticVersion("1.2.3")).toEqual(
      "00001-00002-00003-15-00000"
    );

    expect(noncifySemanticVersion("1.2.3-rc0")).toEqual(
      "00001-00002-00003-12-00000"
    );

    expect(noncifySemanticVersion("100.20.23")).toEqual(
      "00100-00020-00023-15-00000"
    );
  });
});
