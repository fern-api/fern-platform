import { AbsoluteFilePath, RelativeFilePath, doesPathExist, join } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import { SimpleGit } from "simple-git";
import { README_FILEPATH } from "./constants";

// ClonedRepository is a repository that has been successfully cloned to the local file system
// and is ready to be used.
export class ClonedRepository {
    private git: SimpleGit;
    private clonePath: AbsoluteFilePath;

    constructor({ git, clonePath }: { git: SimpleGit; clonePath: AbsoluteFilePath }) {
        this.git = git;
        this.clonePath = clonePath;
    }

    public async getReadme(): Promise<string | undefined> {
        return await this.readFile({ relativeFilePath: RelativeFilePath.of(README_FILEPATH) });
    }

    private async readFile({ relativeFilePath }: { relativeFilePath: RelativeFilePath }): Promise<string | undefined> {
        const absoluteFilePath = join(this.clonePath, relativeFilePath);
        if (!doesPathExist(join(absoluteFilePath))) {
            return undefined;
        }
        return await readFile(absoluteFilePath, "utf-8");
    }
}
