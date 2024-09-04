import { AbsoluteFilePath, cwd, doesPathExist, resolve } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import fs from "fs";
import { mkdir, readFile } from "fs/promises";
import path from "path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { FernGeneratorCli } from "./configuration/generated";
import { loadConfig } from "./configuration/loadConfig";
import { MockGenerator } from "./mock/MockGenerator";
import { ReadmeGenerator } from "./readme/ReadmeGenerator";
import { ReadmeParser } from "./readme/ReadmeParser";
import { ReferenceGenerator } from "./reference/ReferenceGenerator";

void yargs(hideBin(process.argv))
    .scriptName(process.env.CLI_NAME ?? "generator-cli")
    .strict()
    .command(
        "generate readme",
        "Generate a README.md using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true,
                })
                .option("original-readme", {
                    string: true,
                    required: false,
                })
                .option("output", {
                    string: true,
                    required: false,
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = cwd();
            const readmeConfig = await loadConfig<FernGeneratorCli.ReadmeConfig>({
                absolutePathToConfig: resolve(wd, argv.config),
            });
            const generator = new ReadmeGenerator({
                readmeParser: new ReadmeParser(),
                readmeConfig,
                originalReadme: argv.originalReadme != null ? await readFile(argv.originalReadme, "utf8") : undefined,
            });
            await generator.generateReadme({
                output: await createWriteStream(argv.output),
            });
            process.exit(0);
        },
    )
    .command(
        ["generate reference", "generate-reference"], // The latter is deprecated, but kept for backwards compatibility.
        "Generate an SDK reference (`reference.md`) using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true,
                })
                .option("output", {
                    string: true,
                    required: false,
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = cwd();
            const referenceConfig = await loadConfig<FernGeneratorCli.ReferenceConfig>({
                absolutePathToConfig: resolve(wd, argv.config),
            });
            const generator = new ReferenceGenerator({
                referenceConfig,
            });
            await generator.generate({
                output: await createWriteStream(argv.output),
            });
            process.exit(0);
        },
    )
    .command(
        "generate mock",
        "Generate a .mock directory using the provided configuration file.",
        (argv) =>
            argv
                .option("config", {
                    string: true,
                    required: true,
                })
                .option("output", {
                    string: true,
                    required: false,
                    describe: "The filepath to deposit the generated .mock directory (e.g. ./path/to/output)",
                }),
        async (argv) => {
            if (argv.config == null) {
                process.stderr.write("missing required arguments; please specify the --config flag\n");
                process.exit(1);
            }
            const wd = AbsoluteFilePath.of(cwd());
            const mockConfig = await loadConfig<FernGeneratorCli.MockConfig>({
                absolutePathToConfig: resolve(wd, argv.config),
            });
            const generator = new MockGenerator({
                logger: CONSOLE_LOGGER,
                mockConfig,
            });
            await generator.generate({
                output: argv.output != null ? resolve(wd, argv.output) : wd,
            });
            process.exit(0);
        },
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();

async function createWriteStream(outputPath: string | undefined): Promise<fs.WriteStream> {
    return outputPath != null
        ? await createWriteStreamFromFile(resolve(cwd(), outputPath))
        : (process.stdout as unknown as fs.WriteStream);
}

async function createWriteStreamFromFile(filepath: AbsoluteFilePath): Promise<fs.WriteStream> {
    if (!doesPathExist(filepath)) {
        await mkdir(path.dirname(filepath), { recursive: true });
    }
    return fs.createWriteStream(filepath);
}
