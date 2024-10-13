import { Options as ExecaOptions, Result, execa } from "execa";

export declare namespace loggingExeca {
    export interface Options extends ExecaOptions {
        doNotPipeOutput?: boolean;
        secrets?: string[];
        substitutions?: Record<string, string>;
    }

    export type ReturnValue = Result;
}

export async function loggingExeca(
    title: string,
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, ...execaOptions }: loggingExeca.Options = {},
): Promise<Result> {
    const allSubstitutions = secrets.reduce(
        (acc, secret) => ({
            ...acc,
            [secret]: "<redacted>",
        }),
        substitutions,
    );

    let logLine = [executable, ...args].join(" ");
    for (const [substitutionKey, substitutionValue] of Object.entries(allSubstitutions)) {
        logLine = logLine.replaceAll(substitutionKey, substitutionValue);
    }

    logCommand(title, logLine);
    const command = execa(executable, args, execaOptions);
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    return command;
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
