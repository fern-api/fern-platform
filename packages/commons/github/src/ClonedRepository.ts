/* tslint:disable:no-unused-variable */
import { lstat, readFile } from "fs/promises";
import path from "path";
import { SimpleGit } from "simple-git";
import { README_FILEPATH } from "./constants";

// ClonedRepository is a repository that has been successfully cloned to the local file system
// and is ready to be used.
export class ClonedRepository {
    private _git: SimpleGit;
    private clonePath: string;

    constructor({ git, clonePath }: { git: SimpleGit; clonePath: string }) {
        this._git = git;
        this.clonePath = clonePath;
    }

    public async getReadme(): Promise<string | undefined> {
        return await this.readFile({ relativeFilePath: README_FILEPATH });
    }

    private async readFile({ relativeFilePath }: { relativeFilePath: string }): Promise<string | undefined> {
        const absoluteFilePath = path.join(this.clonePath, relativeFilePath);
        if (!(await doesPathExist(absoluteFilePath))) {
            return undefined;
        }
        return await readFile(absoluteFilePath, "utf-8");
    }
}

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
