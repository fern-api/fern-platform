import { Options as ExecaOptions, Result, execa } from "execa";

export declare namespace loggingExeca {
  export interface Options extends ExecaOptions {
    doNotPipeOutput?: boolean;
    secrets?: string[];
    substitutions?: Record<string, string>;
  }
}

export async function loggingExeca(
  executable: string,
  args: string[] = [],
  {
    doNotPipeOutput = false,
    secrets = [],
    substitutions = {},
    ...execaOptions
  }: loggingExeca.Options = {}
): Promise<Result> {
  const allSubstitutions = secrets.reduce(
    (acc, secret) => ({
      ...acc,
      [secret]: "<redacted>",
    }),
    substitutions
  );

  let logLine = [executable, ...args].join(" ");
  for (const [substitutionKey, substitutionValue] of Object.entries(
    allSubstitutions
  )) {
    logLine = logLine.replaceAll(substitutionKey, substitutionValue);
  }

  console.log(`+ ${logLine}`);
  const command = execa(executable, args, execaOptions);
  if (!doNotPipeOutput) {
    command.stdout?.pipe(process.stdout);
    command.stderr?.pipe(process.stderr);
  }
  return command;
}
