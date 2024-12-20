import { getLatestVersionFromNpm, getLatestVersionFromPypi } from "../getLatestVersion";

describe("getLatestVersion", () => {
    it("npm", async () => {
        const version = await getLatestVersionFromNpm("lodash");
        expect(version).toEqual("4.17.21");
    });

    it("pypi", async () => {
        const version = await getLatestVersionFromPypi("qupid");
        expect(version).toEqual("0.1.0");
    });
});
