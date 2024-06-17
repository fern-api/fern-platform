import { cloneRepository } from "../cloneRepository";

describe("cloneRepository", () => {
    it("fern-api/fern", async () => {
        const repository = await cloneRepository({
            githubRepository: "github.com/fern-api/fern",
            installationToken: undefined,
        });
        const readme = await repository.getReadme();
        expect(readme).contains("Fern");
    });
    it("invalid installation token", async () => {
        expect(async () => {
            await cloneRepository({
                githubRepository: "https://github.com/fern-api/does-not-exist",
                installationToken: "xyz",
            });
        }).toThrow(Error);
    });
    it("repository does not exist", async () => {
        expect(async () => {
            await cloneRepository({
                githubRepository: "https://github.com/fern-api/does-not-exist",
                installationToken: undefined,
            });
        }).toThrow(Error);
    });
});
