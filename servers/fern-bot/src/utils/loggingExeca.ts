import execa, { ExecaReturnValue } from "execa";

export declare namespace loggingExeca {
    export interface Options extends execa.Options {
        doNotPipeOutput?: boolean;
        secrets?: string[];
        substitutions?: Record<string, string>;
    }

    export type ReturnValue = ExecaReturnValue;
}

export async function loggingExeca(
    executable: string,
    args: string[] = [],
    { doNotPipeOutput = false, secrets = [], substitutions = {}, ...execaOptions }: loggingExeca.Options = {},
): Promise<ExecaReturnValue> {
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

<<<<<<< HEAD
    console.debug(`+ ${logLine}`);
=======
    console.log(`+ ${logLine}`);
>>>>>>> ed23f63d7 (feat(proxy): Add ability to call gRPC endpoints)
    const command = execa(executable, args, execaOptions);
    if (!doNotPipeOutput) {
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
    }
    return command;
}
