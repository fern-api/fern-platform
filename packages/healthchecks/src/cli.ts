import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import { getAllFernDocsWebsites } from "./getDocsURLs";
import { printResults } from "./printResults";
import { RuleResult, runRules } from "./rules/runRules";

void yargs(hideBin(process.argv))
  // eslint-disable-next-line turbo/no-undeclared-env-vars
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
      const urls =
        argv.url != null ? [argv.url] : await getAllFernDocsWebsites();
      let failure = false;
      const resultsWithUrl: { url: string; results: RuleResult[] }[] = [];
      for (const url of urls) {
        console.log(`Running rules for ${url}.`);
        try {
          const results = await runRules({ url });
          resultsWithUrl.push({ url, results });
          for (const result of results) {
            if (!result.success) {
              failure = true;
            }
          }
        } catch (err) {
          console.error(`Failed to run rules for ${url}.`, err);
        }
      }
      printResults(resultsWithUrl);
      process.exit(failure ? 1 : 0);
    }
  )
  .demandCommand()
  .showHelpOnFail(true)
  .parse();
