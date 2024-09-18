import { writeFile } from "fs/promises";
import { cwd } from "node:process";
import { resolve } from "node:url";
import prettier from "prettier";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { VercelProjectsSchema } from "./schema.js";

async function writeJsonSchema(filepath: string): Promise<void> {
    const jsonSchema = zodToJsonSchema(VercelProjectsSchema, "VercelProjects");
    const jsonSchemaStr = JSON.stringify(jsonSchema);
    const config = (await prettier.resolveConfig(filepath)) ?? undefined;
    const jsonSchemaFormatted = await prettier.format(jsonSchemaStr, { ...config, filepath });
    await writeFile(filepath, jsonSchemaFormatted);
}

void yargs(hideBin(process.argv))
    .scriptName("projects-schema")
    .strict()
    .command(
        "write <filepath>",
        "Write JSON schema to file",
        (argv) => argv.positional("filepath", { type: "string", demandOption: true }),
        (args) => writeJsonSchema(resolve(cwd() + "/", args.filepath)),
    )
    .demandCommand()
    .showHelpOnFail(true)
    .parse();
