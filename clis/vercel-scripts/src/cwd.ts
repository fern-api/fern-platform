import { writeFileSync } from "fs";
import { join } from "path";
import { exec } from "./utils/exec.js";

let _cwd: string | undefined;

export function cwd(): string {
    if (_cwd) {
        return _cwd;
    }

    const cwd = exec("Get git project root", "git rev-parse --show-toplevel", {
        stdio: "pipe",
    }).trim();

    if (!cwd.startsWith("/")) {
        throw new Error("Could not detect git project root directory");
    }

    _cwd = cwd;

    // eslint-disable-next-line no-console
    console.log("Detected monorepo root directory:", cwd);

    return cwd;
}

export function writefs(output: string, content: string): void {
    writeFileSync(join(cwd(), output), content);
}
