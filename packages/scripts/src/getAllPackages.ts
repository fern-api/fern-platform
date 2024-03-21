import execa from "execa";
import path from "path";

export interface Package {
    name: string;
    location: string;
}

export async function getAllPackages({ since = false }: { since?: boolean } = {}): Promise<Package[]> {
    const args = ["workspaces", "list", "--json"];
    if (since) {
        args.push("--since", "--recursive");
    }

    const { stdout } = await execa("pnpm", args);
    const trimmedStdout = stdout.trim();

    if (trimmedStdout === "") {
        return [];
    }

    return trimmedStdout.split("\n").reduce<Package[]>((packages, line) => {
        const parsed = JSON.parse(line) as Package;
        if (parsed.location !== ".") {
            packages.push({
                name: parsed.name,
                location: path.resolve(__dirname, "../../..", parsed.location),
            });
        }
        return packages;
    }, []);
}
