import { exec } from "./utils/exec.js";

export function cwd(): string {
    const cwd = exec("Get git project root", "git rev-parse --show-toplevel", {
        stdio: "pipe",
    }).trim();

    if (!cwd.startsWith("/")) {
        throw new Error("Could not detect git project root directory");
    }

    // eslint-disable-next-line no-console
    console.log("Detected monorepo root directory:", cwd);

    return cwd;
}
