import execa from "execa";
import path from "path";

const FIXTURES_PATH = path.join(__dirname, "fixtures");

export function testGenerateReference({
    fixtureName,
    referenceConfigFilename,
}: {
    fixtureName: string;
    referenceConfigFilename: string;
}): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("generate reference file", async () => {
            const absolutePathToReferenceConfig = getAbsolutePathToFixtureFile({
                fixtureName,
                filepath: referenceConfigFilename,
            });
            const args = [
                path.join(__dirname, "../../dist/cli.cjs"),
                "generate-reference",
                "--config",
                absolutePathToReferenceConfig,
            ];

            const { stdout } = await execa("node", args);
            expect(stdout).toMatchSnapshot();
        });
    });
}

function getAbsolutePathToFixtureFile({ fixtureName, filepath }: { fixtureName: string; filepath: string }): string {
    return path.join(FIXTURES_PATH, fixtureName, filepath);
}
