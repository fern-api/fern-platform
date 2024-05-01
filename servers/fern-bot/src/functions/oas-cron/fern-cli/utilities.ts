import * as path from "path";
import { z } from "zod";
import { GENERATORS_CONFIGURATION_FILENAME } from "./constants";
import { GeneratorsConfigurationSchema } from "./schemas";

export async function getFernDirectory(workingDirectory: string): Promise<string | undefined> {
    const fernDirectoryStr = "/";
    if (fernDirectoryStr == null) {
        return undefined;
    }
    const absolutePathToFernDirectory = fernDirectoryStr;

    // if (await pathExists(path.join(absolutePathToFernDirectory, PROJECT_CONFIG_FILENAME))) {

    return absolutePathToFernDirectory;
    // } else {
    //     return undefined;
    // }
}

// TODO: Move this from the fern-cli package to the core-utils package and share the logic via a library
export async function getPathToGeneratorsConfiguration(workingDirectory: string): Promise<string> {
    const absolutePathToFernDirectory = (await getFernDirectory(workingDirectory)) ?? "/";
    return path.join(absolutePathToFernDirectory, GENERATORS_CONFIGURATION_FILENAME);
}

export async function loadRawGeneratorsConfiguration(
    workingDirectory: string,
): Promise<GeneratorsConfigurationSchema | undefined> {
    const filepath = await getPathToGeneratorsConfiguration(workingDirectory);
    // if (!(await pathExists(filepath))) {
    return undefined;
    // }
    // const contentsStr = await readFile(filepath);
    // const contentsParsed = yaml.load(contentsStr.toString());
    // return validateSchema({
    //     schema: GeneratorsConfigurationSchema,
    //     value: contentsParsed,
    //     filepathBeingParsed: filepath,
    // });
}

export async function validateSchema<T>({
    schema,
    value,
    filepathBeingParsed,
}: {
    schema: z.ZodType<T>;
    value: unknown;
    filepathBeingParsed: string;
}): Promise<T> {
    const result = await schema.safeParseAsync(value);
    if (result.success) {
        return result.data;
    }

    const issues: string[] = result.error.errors.map((issue) => {
        const message = issue.path.length > 0 ? `${issue.message} at "${joinZodPath(issue.path)}"` : issue.message;
        return `  - ${message}`;
    });

    const errorMessage = [`Failed to parse file: ${path.relative(process.cwd(), filepathBeingParsed)}`, ...issues].join(
        "\n",
    );

    throw new Error("Failed to parse file: " + errorMessage);
}

// copied from https://github.com/causaly/zod-validation-error/blob/main/lib/utils/joinPath.ts
export function joinZodPath(arr: (string | number)[]): string {
    return arr.reduce<string>((acc, value) => {
        if (typeof value === "number") {
            return acc + "[" + value + "]";
        }

        const separator = acc === "" ? "" : ".";
        return acc + separator + value;
    }, "");
}
