import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";

import { FernGeneratorCli } from "./generated";

export async function loadReadmeConfig({
  absolutePathToConfig,
}: {
  absolutePathToConfig: AbsoluteFilePath;
}): Promise<FernGeneratorCli.ReadmeConfig> {
  const rawContents = await readFile(absolutePathToConfig, "utf8");
  return JSON.parse(rawContents);
}
