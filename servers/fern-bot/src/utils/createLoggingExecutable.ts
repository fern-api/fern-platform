import { Result } from "execa";

import { loggingExeca } from "./loggingExeca";

export type LoggingExecutable = (
  args?: string[],
  options?: loggingExeca.Options
) => Promise<Result>;

export declare namespace createLoggingExecutable {
  export interface Options extends loggingExeca.Options {}
}

export function createLoggingExecutable(
  executable: string,
  { ...loggingExecaOptions }: createLoggingExecutable.Options = {}
): LoggingExecutable {
  return (args, commandOptions) =>
    loggingExeca(executable, args, {
      ...loggingExecaOptions,
      ...commandOptions,
    });
}
