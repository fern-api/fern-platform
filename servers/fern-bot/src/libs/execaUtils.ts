import execa from "execa";
import tmp from "tmp-promise";
import { writeFile } from "fs/promises";

export async function runScript({
    commands,
    workingDir,
    reject,
}: {
    commands: string[];
    workingDir: string;
    reject?: boolean;
}): Promise<execa.ExecaChildProcess<string>> {
    const scriptFile = await tmp.file();
    await writeFile(scriptFile.path, [`cd ${workingDir}`, ...commands].join("\n"));
    return await execa("bash", [scriptFile.path], { reject, all: true });
}
