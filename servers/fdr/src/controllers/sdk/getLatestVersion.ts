import latestVersion from "latest-version";

export async function getLatestVersionFromNpm(packageName: string): Promise<string | undefined> {
    return await latestVersion(packageName, {
        version: "prerelease",
    });
}

export async function getLatestVersionFromPypi(packageName: string): Promise<string | undefined> {
    const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);

    if (response.ok) {
        // Extract the latest version from the response data
        return ((await response.json()) as any).data.info.version;
    }
}
