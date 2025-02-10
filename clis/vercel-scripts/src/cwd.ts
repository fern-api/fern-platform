import { writeFileSync } from "fs";
import { join } from "path";

import { loggingExeca } from "./utils/loggingExeca.js";

let _cwd: string | undefined;

export async function cwd(): Promise<string> {
  if (_cwd) {
    return _cwd;
  }

  const result = await loggingExeca("Get git project root", "git", [
    "rev-parse",
    "--show-toplevel",
  ]);

  const cwd = String(result.stdout).trim();

  if (!cwd.startsWith("/")) {
    throw new Error("Could not detect git project root directory");
  }

  _cwd = cwd;

  console.log("Detected monorepo root directory:", cwd);

  return cwd;
}

export async function writefs(output: string, content: string): Promise<void> {
  writeFileSync(join(await cwd(), output), content);
}
