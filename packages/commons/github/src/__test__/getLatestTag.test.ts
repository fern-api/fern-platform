import { getLatestTag } from "../getLatestTag";

describe("getLatestTag", () => {
  it("tag", async () => {
    const version = await getLatestTag("lodash/lodash");
    expect(version).toEqual("4.17.21");
  });
});
