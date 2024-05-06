/* eslint-disable no-console */
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { getAllFernDocsWebsites } from "./getDocsURLs";
import { runRules } from "./rules/runRules";

void yargs(hideBin(process.argv))
    .scriptName(process.env.CLI_NAME ?? "fern-healthchecks")
    .strict()
    .command(
        "docs run",
        "Run healthchecks on a deployed docs website",
        (argv) =>
            argv
                .option("url", {
                    string: true,
                    requred: false,
                })
                .option("stack", {
                    string: true,
                    default: false,
                    requred: true,
                }),
        async (argv) => {
            const urls = argv.url != null ? [argv.url] : await getAllFernDocsWebsites();
            let failure = false;
            for (const url of urls) {
                console.log(`Running rules for ${url}...`);
                const results = await runRules({ url });
                for (const result of results) {
                    if (result.success) {
                        console.log(`:white_check_mark:  Rule ${result.name} passed`);
                    } else {
                        failure = true;
                        console.log(`:redx:  Rule ${result.name} failed. ${result.message}`);
                    }
                }
            }
            process.exit(failure ? 1 : 0);
        },
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
