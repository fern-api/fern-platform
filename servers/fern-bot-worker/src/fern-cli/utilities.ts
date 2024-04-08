import { addPrefixToString } from "@fern-api/core-utils";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { findUp } from "find-up";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import path from "path";
import { z } from "zod";
import { FERN_DIRECTORY, GENERATORS_CONFIGURATION_FILENAME, PROJECT_CONFIG_FILENAME } from "./constants";
import { GeneratorsConfigurationSchema } from "./schemas";

export async function getFernDirectory(workingDirectory: AbsoluteFilePath): Promise<AbsoluteFilePath | undefined> {
    const fernDirectoryStr = await findUp(FERN_DIRECTORY, { type: "directory", cwd: workingDirectory });
    if (fernDirectoryStr == null) {
        return undefined;
    }
    const absolutePathToFernDirectory = AbsoluteFilePath.of(fernDirectoryStr);

    if (await doesPathExist(join(absolutePathToFernDirectory, RelativeFilePath.of(PROJECT_CONFIG_FILENAME)))) {
        return absolutePathToFernDirectory;
    } else {
        return undefined;
    }
}

// TODO: Move this from the fern-cli package to the core-utils package and share the logic via a library
export async function getPathToGeneratorsConfiguration(workingDirectory: AbsoluteFilePath): Promise<AbsoluteFilePath> {
    const absolutePathToFernDirectory = (await getFernDirectory(workingDirectory)) ?? AbsoluteFilePath.of("/");
    return join(absolutePathToFernDirectory, RelativeFilePath.of(GENERATORS_CONFIGURATION_FILENAME));
}

export async function loadRawGeneratorsConfiguration(
    workingDirectory: AbsoluteFilePath,
): Promise<GeneratorsConfigurationSchema | undefined> {
    const filepath = await getPathToGeneratorsConfiguration(workingDirectory);
    if (!(await doesPathExist(filepath))) {
        return undefined;
    }
    const contentsStr = await readFile(filepath);
    const contentsParsed = yaml.load(contentsStr.toString());
    return validateSchema({
        schema: GeneratorsConfigurationSchema,
        value: contentsParsed,
        filepathBeingParsed: filepath,
    });
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
        return addPrefixToString({
            content: message,
            prefix: "  - ",
        });
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
