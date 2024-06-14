import { AbsoluteFilePath } from "@fern-api/fs-utils";
import simpleGit from "simple-git";
import tmp from "tmp-promise";
import { ClonedRepository } from "./ClonedRepository";
import { parseRepository } from "./parseRepository";

/**
 * Clones the repository to the local file system.
 * @param githubRepository a string that can be parsed into a RepositoryReference (e.g. 'owner/repo')
 */
export async function cloneRepository({
    githubRepository,
    installationToken,
}: {
    githubRepository: string;
    installationToken: string;
}): Promise<ClonedRepository> {
    const repositoryReference = parseRepository(githubRepository);
    const url = repositoryReference.getAuthedCloneUrl(installationToken);
    const dir = await tmp.dir();
    const clonePath = AbsoluteFilePath.of(dir.path);
    const git = simpleGit(clonePath);
    await git.clone(url, ".");

    return new ClonedRepository({
        git,
        clonePath,
    });
}
