/* eslint-disable no-console */
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { createFailedDocLoadIncident } from "./createIncident";
import { getAllFernDocsWebsites } from "./getDocsURLs";
import { RuleResult, runRules } from "./rules/runRules";

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
                })
                .option("generateIncident", {
                    boolean: true,
                    default: false,
                }),
        async (argv) => {
            const urls = argv.url != null ? [argv.url] : await getAllFernDocsWebsites();
            const promiseResults: Promise<RuleResult[]>[] = [];
            urls.forEach((url) => {
                promiseResults.push(runRules({ url }));
            });
            const results: RuleResult[] = (await Promise.all(promiseResults)).flat();
            console.log(`Successful Rules: ${results.filter((result) => result.success).length}`);
            const failedResults: RuleResult[] = results.filter((result) => !result.success);
            console.log(`Failed Rules: ${failedResults.length}`);
            if (failedResults.length && argv.generateIncident) {
                const incidentResponse = await createFailedDocLoadIncident(failedResults);
                console.log(
                    `Generated incident ${incidentResponse.incident.reference}. Access here ${incidentResponse.incident.permalink}`,
                );
            }
            process.exit(failedResults.length ? 1 : 0);
        },
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
