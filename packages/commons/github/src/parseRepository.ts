export function parseRepository(name: string): { owner: string; repo: string } {
    const values = name.split("/");
    if (values.length === 2 && values[0] != null && values[1] != null) {
        return {
            owner: values[0],
            repo: values[1],
        };
    }
    throw new Error(`Failed to parse GitHub repostiory ${name}`);
}
