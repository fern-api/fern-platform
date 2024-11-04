import { execa } from "execa";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { FernGeneratorCli } from "../configuration/generated";
import * as serializers from "../configuration/generated/serialization";

const FIXTURES_PATH = path.join(__dirname, "fixtures");

export function testGenerateReadme({
    fixtureName,
    config,
    originalReadme,
}: {
    fixtureName: string;
    config: FernGeneratorCli.ReadmeConfig;
    originalReadme?: string;
}): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("generate readme", async () => {
            const file = await tmp.file();
            const json = JSON.stringify(await serializers.ReadmeConfig.jsonOrThrow(config), undefined, 2);
            await writeFile(file.path, json);

            const args = [path.join(__dirname, "../../dist/cli.cjs"), "generate", "readme", "--config", file.path];
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
