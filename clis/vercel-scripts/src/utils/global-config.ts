import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const DARWIN_AUTH_PATH =
    "~/Library/Application Support/com.vercel.cli/auth.json";
const LINUX_AUTH_PATH = "~/.local/share/com.vercel.cli/auth.json";

function getAuthJson(): string | undefined {
    try {
        if (process.platform === "darwin") {
            return String(
                readFileSync(join(homedir(), DARWIN_AUTH_PATH.slice(1)))
            );
        } else if (process.platform === "linux") {
            return String(
                readFileSync(join(homedir(), LINUX_AUTH_PATH.slice(1)))
            );
        }
    } catch (_e) {
        // do nothing
    }
    return undefined;
}

export function getVercelTokenFromGlobalConfig(): string | undefined {
    const authJson = getAuthJson();

    if (authJson == null) {
        return undefined;
    }
    try {
        const auth = JSON.parse(authJson);
        return auth.token;
    } catch (_e) {
        return undefined;
    }
}
