import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

export async function loadConfig<T>({ absolutePathToConfig }: { absolutePathToConfig: AbsoluteFilePath }): Promise<T> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    return JSON.parse(rawContents);
}
