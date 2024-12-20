/* eslint-disable turbo/no-undeclared-env-vars */
import { noop } from "ts-essentials";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { checkReleaseBlockers } from "./checkReleaseBlockers";

void yargs(hideBin(process.argv))
  .scriptName(process.env.CLI_NAME ?? "fern-scripts")
  .strict()
  .command(
    "check-docs-release-blockers",
    "Check that there are no release blockers for docs",
    noop,
    async () => {
      await checkReleaseBlockers("release-blockers-docs.yml");
    }
  )
  .demandCommand()
  .showHelpOnFail(true)
  .parse();
