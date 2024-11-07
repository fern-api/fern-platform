import { execa } from "execa";

let teardown = false;

export async function setup() {
    await execa("pnpm", ["docker:local"], { stdio: "inherit" });
    await execa("docker-compose", ["-f", "docker-compose.ete.yml", "up", "-d"], { stdio: "inherit" });
    await sleep(10000);
    return async () => {
        if (teardown) {
            throw new Error("teardown called twice");
        }
        teardown = true;
        await execa("docker-compose", ["-f", "docker-compose.ete.yml", "down"], { stdio: "inherit" });
        return new Promise<void>((resolve) => {
            resolve();
        });
    };
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
