import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

void yargs(hideBin(process.argv))
    .scriptName(process.env.CLI_NAME ?? "fern-healthchecks")
    .strict()
    .command(
        "run",
        "Run healthchecks on a deployed docs website",
        (argv) =>
            argv
                .option("url", {
                    string: true,
                    default: false,
                    requred: true,
                })
                .option("stack", {
                    string: true,
                    default: false,
                    requred: true,
                }),
        async (argv) => {
            await checkRootPackage({
                shouldFix: argv.url,
            });
        },
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
