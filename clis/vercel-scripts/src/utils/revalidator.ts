import { Vercel, VercelClient } from "@fern-fern/vercel";

const BANNED_DOMAINS = ["vercel.app", "buildwithfern.com", "ferndocs.com"];

type RevalidatePathResult = RevalidatePathSuccessResult | RevalidatePathErrorResult;

interface RevalidatePathSuccessResult {
    success: true;
    url: string;
}

interface RevalidatePathErrorResult {
    success: false;
    url: string;
    message: string;
}

type RevalidateAllResponse = {
    total: number;
    data: RevalidatePathResult[];
};

export class DocsRevalidator {
    private vercel: VercelClient;
    private project: string;
    private teamId: string;
    constructor({ token, project, teamId }: { token: string; project: string; teamId: string }) {
        this.vercel = new VercelClient({ token });
        this.project = project;
        this.teamId = teamId;
    }

    private async *getProductionDomains(): AsyncGenerator<Vercel.GetProjectDomainsResponseDomainsItem> {
        let cursor: number | undefined = undefined;
        do {
            const res = await this.vercel.projects.getProjectDomains(this.project, {
                teamId: this.teamId,
                production: "true",
                verified: "true",
                limit: 50,
                order: "ASC",
                since: cursor,
            });

            yield* res.domains.filter((domain) => !BANNED_DOMAINS.includes(domain.apexName));
            cursor = res.pagination.next;
        } while (cursor);
    }

    async getDomains(): Promise<string[]> {
        const domains: string[] = [];
        for await (const domain of this.getProductionDomains()) {
            domains.push(domain.name);
        }
        return domains;
    }

    async getPreviewUrls(deploymentUrl: string): Promise<{ url: string; name: string }[]> {
        const url = new URL("/api/fern-docs/preview", deploymentUrl);

        const urls: { url: string; name: string }[] = [];

        for await (const domain of this.getProductionDomains()) {
            url.searchParams.set("host", domain.name);
            urls.push({ url: url.toString(), name: domain.name });
        }

        return urls;
    }

    async revalidateAll(): Promise<void> {
        for await (const domain of this.getProductionDomains()) {
            // eslint-disable-next-line no-console
            console.log(`Revalidating ${domain.name}...`);

            const url = new URL(`https://${domain.name}/api/fern-docs/revalidate-all/v4`);
            url.searchParams.set("limit", "50");

            let total: number | undefined;
            let offset = 0;

            do {
                url.searchParams.set("offset", String(offset));
                const res = (await (await fetch(url)).json()) as RevalidateAllResponse;
                if (res.total === 0) {
                    break;
                }

                if (total === undefined) {
                    total = res.total;
                } else if (total !== res.total) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `[${domain.name}] Total changed while revalidating from ${total} to ${res.total}. This is probably due to a docs regeneration. Skipping...`,
                    );
                }

                offset += res.data.length;

                res.data.forEach((result) => {
                    if (!result.success) {
                        // eslint-disable-next-line no-console
                        console.warn(`[${domain.name}] Failed to revalidate ${result.url}: ${result.message}`);
                    }
                });

                // eslint-disable-next-line no-console
                console.log(`[${domain.name}] Revalidated ${offset}/${total} paths...`);
            } while (offset < total);
        }
    }
}
