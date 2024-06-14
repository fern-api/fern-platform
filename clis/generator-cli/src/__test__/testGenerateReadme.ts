import execa from "execa";
import path from "path";

const FIXTURES_PATH = path.join(__dirname, "fixtures");

export function testGenerateReadme({
    fixtureName,
    readmeConfigFilename,
    originalReadme,
}: {
    fixtureName: string;
    readmeConfigFilename: string;
    originalReadme?: string;
}): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("generate readme", async () => {
            const absolutePathToReadmeConfig = getAbsolutePathToFixtureFile({
                fixtureName,
                filepath: readmeConfigFilename,
            });
            const args = [
                path.join(__dirname, "../../dist/cli.cjs"),
                "generate",
                "readme",
                "--config",
                absolutePathToReadmeConfig,
            ];
            if (originalReadme != null) {
                args.push(
                    ...["--original-readme", getAbsolutePathToFixtureFile({ fixtureName, filepath: originalReadme })],
                );
            }
            const { stdout } = await execa("node", args);
            expect(stdout).toMatchSnapshot();
        });
    });
}

function getAbsolutePathToFixtureFile({ fixtureName, filepath }: { fixtureName: string; filepath: string }): string {
    return path.join(FIXTURES_PATH, fixtureName, filepath);
}
