import { execa } from "execa";
import { writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { FernGeneratorCli } from "../configuration/generated";
import * as serializers from "../configuration/generated/serialization";

export function testGenerateReference({
    fixtureName,
    config,
}: {
    fixtureName: string;
    config: FernGeneratorCli.ReferenceConfig;
}): void {
    // eslint-disable-next-line vitest/valid-title
    describe(fixtureName, () => {
        it("generate readme", async () => {
            const file = await tmp.file();
            const json = JSON.stringify(
                await serializers.ReferenceConfig.jsonOrThrow(config),
                undefined,
                2
            );
            await writeFile(file.path, json);

            const args = [
                path.join(__dirname, "../../dist/cli.cjs"),
                "generate-reference",
                "--config",
                file.path,
            ];
            const { stdout } = await execa("node", args);
            expect(stdout).toMatchSnapshot();
        });
    });
}
