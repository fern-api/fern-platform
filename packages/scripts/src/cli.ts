import { noop } from "lodash-es";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";
import { checkReleaseBlockers } from "./checkReleaseBlockers";
import { checkRootPackage } from "./checkRootPackage";

void yargs(hideBin(process.argv))
    .scriptName(process.env.CLI_NAME ?? "fern-scripts")
    .strict()
    .command(
        "check-root-package",
        "Check (or fix) the package.json of the root package",
        (argv) =>
            argv.option("fix", {
                boolean: true,
                default: false,
            }),
        async (argv) => {
            await checkRootPackage({
                shouldFix: argv.fix,
            });
        },
    )
    .command("check-docs-release-blockers", "Check that there are no release blockers for docs", noop, async () => {
        await checkReleaseBlockers("release-blockers-docs.yml");
    })
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
