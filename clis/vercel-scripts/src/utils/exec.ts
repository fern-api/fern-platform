import { execFileSync, ExecSyncOptions } from "child_process";

export function exec(title: string, command: string | string[], opts?: ExecSyncOptions): string {
    const cmd = Array.isArray(command) ? command : command.split(" ");
    if (!cmd[0]) {
        throw new Error(`Empty command in ${title}`);
    }

    logCommand(title, command);
    return String(
        execFileSync(cmd[0], cmd.slice(1), {
            stdio: "inherit",
            ...opts,
            env: { ...process.env, ...opts?.env },
        }),
    );
}

export function prettyCommand(command: string | string[]): string {
    if (Array.isArray(command)) {
        command = command.join(" ");
    }
    return command.replace(/ -- .*/, " -- …");
}

/**
 * @param {string} title
 * @param {string | string[]} [command]
 */
export function logCommand(title: string, command?: string | string[]): void {
    if (command) {
        const pretty = prettyCommand(command);
        // eslint-disable-next-line no-console
        console.log(`\n\x1b[1;4m${title}\x1b[0m\n> \x1b[1m${pretty}\x1b[0m\n`);
    } else {
        // eslint-disable-next-line no-console
        console.log(`\n\x1b[1;4m${title}\x1b[0m\n`);
    }
}

export function booleanArg(args: string[], name: string): boolean {
    const index = args.indexOf(name);
    if (index === -1) {
        return false;
    }
    args.splice(index, 1);
    return true;
}

export function namedValueArg(args: string[], name: string): string | undefined {
    const index = args.indexOf(name);
    if (index === -1) {
        return undefined;
    }
    return args.splice(index, 2)[1];
}
