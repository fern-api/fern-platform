import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import execa from "execa";
import path from "path";

const FIXTURES_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

export function testGenerateReadme({
    fixtureName,
    featuresConfigFilename,
    readmeConfigFilename,
    snippetsFilename,
}: {
    fixtureName: string;
    featuresConfigFilename: string;
    readmeConfigFilename: string;
    snippetsFilename: string;
}): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("generate readme", async () => {
            const absolutePathToFeaturesConfig = getAbsolutePathToFixtureFile({
                fixtureName,
                filepath: featuresConfigFilename,
            });
            const absolutePathToReadmeConfig = getAbsolutePathToFixtureFile({
                fixtureName,
                filepath: readmeConfigFilename,
            });
            const absolutePathToSnippets = getAbsolutePathToFixtureFile({
                fixtureName,
                filepath: snippetsFilename,
            });
            const { stdout } = await execa(
                "node",
                [
                    path.join(__dirname, "../../dist/cli.cjs"),
                    "generate readme",
                    "--readme-config",
                    absolutePathToReadmeConfig,
                    "--feature-config",
                    absolutePathToFeaturesConfig,
                    "--snippets",
                    absolutePathToSnippets,
                ],
                {
                    reject: false,
                },
            );
            expect(stdout).toMatchSnapshot();
        });
    });
}

function getAbsolutePathToFixtureFile({
    fixtureName,
    filepath,
}: {
    fixtureName: string;
    filepath: string;
}): AbsoluteFilePath {
    return join(FIXTURES_PATH, RelativeFilePath.of(fixtureName), RelativeFilePath.of(filepath));
}
