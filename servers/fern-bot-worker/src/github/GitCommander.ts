import * as io from "@actions/io";
import execa from "execa";

const tagsRefSpec = "+refs/tags/*:refs/tags/*";

// GitCommander is taken from a few GH Actions
// Namely: https://github.com/peter-evans/create-pull-request/blob/main/src/git-command-manager.ts
// TBD if IO works outside of the Actions ecosystem
export class GitCommander {
    private gitPath: string;
    private workingDirectory: string;
    private token: string;
    // Git options used when commands require an identity
    private identityGitOptions?: string[];

    private constructor(workingDirectory: string, gitPath: string, token: string) {
        this.workingDirectory = workingDirectory;
        this.gitPath = gitPath;
        this.token = token;
    }

    static async create(workingDirectory: string, token: string): Promise<GitCommander> {
        const gitPath = await io.which("git", true);
        return new GitCommander(workingDirectory, gitPath, token);
    }

    setIdentityGitOptions(identityGitOptions: string[]): void {
        this.identityGitOptions = identityGitOptions;
    }

    async checkout(ref: string, startPoint?: string, options?: string[]): Promise<void> {
        const args = ["checkout", "--progress"];
        if (startPoint) {
            args.push("-B", ref, startPoint);
        } else if (options) {
            args.push(...options);
            args.push(ref);
        } else {
            args.push(ref);
        }
        // https://github.com/git/git/commit/a047fafc7866cc4087201e284dc1f53e8f9a32d5
        args.push("--");
        await this.exec(args);
    }

    async cherryPick(options?: string[], allowAllExitCodes = false): Promise<GitOutput> {
        const args = ["cherry-pick"];
        if (this.identityGitOptions) {
            args.unshift(...this.identityGitOptions);
        }

        if (options) {
            args.push(...options);
        }

        return await this.exec(args, allowAllExitCodes);
    }

    async commit(options?: string[], allowAllExitCodes = false): Promise<GitOutput> {
        const args = ["commit"];
        if (this.identityGitOptions) {
            args.unshift(...this.identityGitOptions);
        }

        if (options) {
            args.push(...options);
        }

        return await this.exec(args, allowAllExitCodes);
    }

    async config(configKey: string, configValue: string, globalConfig?: boolean, add?: boolean): Promise<void> {
        const args: string[] = ["config", globalConfig ? "--global" : "--local"];
        if (add) {
            args.push("--add");
        }
        args.push(...[configKey, configValue]);
        await this.exec(args);
    }

    async configExists(configKey: string, configValue = ".", globalConfig?: boolean): Promise<boolean> {
        const output = await this.exec(
            ["config", globalConfig ? "--global" : "--local", "--name-only", "--get-regexp", configKey, configValue],
            true,
        );
        return output.exitCode === 0;
    }

    async fetch(refSpec: string[], remoteName?: string, options?: string[]): Promise<void> {
        const args = ["-c", "protocol.version=2", "fetch"];
        if (!refSpec.some((x) => x === tagsRefSpec)) {
            args.push("--no-tags");
        }

        args.push("--progress", "--no-recurse-submodules");

        if (options) {
            args.push(...options);
        }

        if (remoteName) {
            args.push(remoteName);
        } else {
            args.push("origin");
        }
        for (const arg of refSpec) {
            args.push(arg);
        }

        await this.exec(args);
    }

    async getConfigValue(configKey: string, configValue = "."): Promise<string> {
        const output = await this.exec(["config", "--local", "--get-regexp", configKey, configValue]);
        return output.stdout.trim().split(`${configKey} `)[1];
    }

    getGitDirectory(): Promise<string> {
        return this.revParse("--git-dir");
    }

    getWorkingDirectory(): string {
        return this.workingDirectory;
    }

    setWorkingDirectory(workingDirectory: string): void {
        this.workingDirectory = workingDirectory;
    }

    async hasDiff(options?: string[]): Promise<boolean> {
        const args = ["diff", "--quiet"];
        if (options) {
            args.push(...options);
        }
        const output = await this.exec(args, true);
        return output.exitCode === 1;
    }

    async isDirty(untracked: boolean, pathspec?: string[]): Promise<boolean> {
        const pathspecArgs = pathspec ? ["--", ...pathspec] : [];
        // Check untracked changes
        const sargs = ["--porcelain", "-unormal"];
        sargs.push(...pathspecArgs);
        if (untracked && (await this.status(sargs))) {
            return true;
        }
        // Check working index changes
        if (await this.hasDiff(pathspecArgs)) {
            return true;
        }
        // Check staged changes
        const dargs = ["--staged"];
        dargs.push(...pathspecArgs);
        if (await this.hasDiff(dargs)) {
            return true;
        }
        return false;
    }

    async push(options?: string[]): Promise<void> {
        const args = ["push"];
        if (options) {
            args.push(...options);
        }
        await this.exec(args);
    }

    async clone(cloneUrl: string, options?: string[]): Promise<void> {
        const args = ["clone", `https://${this.token}@${cloneUrl.replace("https://", "")}`];
        if (options) {
            args.push(...options);
        }
        await this.exec(args);
    }

    async add(options?: string[]): Promise<void> {
        const args = ["add"];
        if (options) {
            args.push(...options);
        }
        await this.exec(args);
    }

    async revList(commitExpression: string[], options?: string[]): Promise<string> {
        const args = ["rev-list"];
        if (options) {
            args.push(...options);
        }
        args.push(...commitExpression);
        const output = await this.exec(args);
        return output.stdout.trim();
    }

    async revParse(ref: string, options?: string[]): Promise<string> {
        const args = ["rev-parse"];
        if (options) {
            args.push(...options);
        }
        args.push(ref);
        const output = await this.exec(args);
        return output.stdout.trim();
    }

    async stashPush(options?: string[]): Promise<boolean> {
        const args = ["stash", "push"];
        if (options) {
            args.push(...options);
        }
        const output = await this.exec(args);
        return output.stdout.trim() !== "No local changes to save";
    }

    async stashPop(options?: string[]): Promise<void> {
        const args = ["stash", "pop"];
        if (options) {
            args.push(...options);
        }
        await this.exec(args);
    }

    async status(options?: string[]): Promise<string> {
        const args = ["status"];
        if (options) {
            args.push(...options);
        }
        const output = await this.exec(args);
        return output.stdout.trim();
    }

    async symbolicRef(ref: string, options?: string[]): Promise<string> {
        const args = ["symbolic-ref", ref];
        if (options) {
            args.push(...options);
        }
        const output = await this.exec(args);
        return output.stdout.trim();
    }

    async tryConfigUnset(configKey: string, configValue = ".", globalConfig?: boolean): Promise<boolean> {
        const output = await this.exec(
            ["config", globalConfig ? "--global" : "--local", "--unset", configKey, configValue],
            true,
        );
        return output.exitCode === 0;
    }

    async tryGetRemoteUrl(): Promise<string> {
        const output = await this.exec(["config", "--local", "--get", "remote.origin.url"], true);

        if (output.exitCode !== 0) {
            return "";
        }

        const stdout = output.stdout.trim();
        if (stdout.includes("\n")) {
            return "";
        }

        return stdout;
    }

    async exec(args: string[], allowAllExitCodes = false): Promise<GitOutput> {
        const result = new GitOutput();

        const env: NodeJS.ProcessEnv = {};
        for (const key of Object.keys(process.env)) {
            env[key] = process.env[key];
        }

        const options = {
            cwd: this.workingDirectory,
            env,
            ignoreReturnCode: allowAllExitCodes,
        };

        const { stderr, stdout, exitCode } = await execa(`"${this.gitPath}"`, args, options);
        result.exitCode = exitCode;
        result.stdout = stdout;
        result.stderr = stderr;
        return result;
    }

    async tryFetch(remote: string, branch: string): Promise<boolean> {
        try {
            await this.fetch([`${branch}:refs/remotes/${remote}/${branch}`], remote, ["--force"]);
            return true;
        } catch {
            return false;
        }
    }
}

class GitOutput {
    stdout = "";
    stderr = "";
    exitCode = 0;
}
