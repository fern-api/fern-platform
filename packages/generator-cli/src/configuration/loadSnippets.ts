import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Snippets } from "@fern-fern/generator-exec-sdk/serialization";
import { readFile } from "fs/promises";

export async function loadSnippets({
    absolutePathToConfig,
}: {
    absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorExec.Snippets> {
    const rawContents = await readFile(absolutePathToConfig, "utf8");
    return Snippets.parseOrThrow(JSON.parse(rawContents));
}
