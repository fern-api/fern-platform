import { FernDocsClient } from "@fern-fern/fern-docs-sdk";
import { Vercel, VercelClient } from "@fern-fern/vercel";
import { logCommand } from "./exec.js";

const BANNED_DOMAINS = ["vercel.app", "buildwithfern.com", "ferndocs.com"];

export class FernDocsRevalidator {
    private vercel: VercelClient;
    private project: string;
    private teamId: string;
    constructor({ token, project, teamId }: { token: string; project: string; teamId: string }) {
        this.vercel = new VercelClient({ token });
        this.project = project;
        this.teamId = teamId;
    }

    private async *getProductionDomains(): AsyncGenerator<Vercel.GetProjectDomainsResponseDomainsItem, void, unknown> {
        let cursor: number | undefined = undefined;
        do {
            const res = await this.vercel.projects.getProjectDomains(this.project, {
                teamId: this.teamId,
                production: "true",
                verified: "true",
                limit: 50,
                order: "ASC",
                since: cursor ? cursor + 1 : undefined,
            });

            for (const domain of res.domains.filter((domain) => !BANNED_DOMAINS.includes(domain.apexName))) {
                yield domain;
            }
            cursor = res.pagination.next;
        } while (cursor);
    }

    async getDomains(): Promise<string[]> {
        const domains: string[] = [];
        for await (const domain of this.getProductionDomains()) {
            domains.push(domain.name);
        }
        return domains.sort();
    }

    async getPreviewUrls(deploymentUrl: string): Promise<{ url: string; name: string }[]> {
        const url = new URL("/api/fern-docs/preview", deploymentUrl);

        const urls: { url: string; name: string }[] = [];

        for await (const domain of this.getProductionDomains()) {
            url.searchParams.set("host", domain.name);
            urls.push({ url: url.toString(), name: domain.name });
        }

        return urls.sort((a, b) => a.name.localeCompare(b.name));
    }

    async revalidateAll(): Promise<void> {
        logCommand("Revalidating all docs");

        const summary: Record<string, { success: number; failed: number }> = {};
        const failedDomains: string[] = [];

        for await (const domain of this.getProductionDomains()) {
            // eslint-disable-next-line no-console
            console.log(`Revalidating ${domain.name}...`);

            const client = new FernDocsClient({
                // TODO: handle docs with basepath
                environment: `https://${domain.name}`,
            });

            try {
                const results = await client.revalidation.revalidateAllV4({ limit: 100 });

                const revalidationSummary = (summary[domain.name] = { success: 0, failed: 0 });
                for await (const result of results) {
                    if (!result.success) {
                        // eslint-disable-next-line no-console
                        console.warn(`[${domain.name}] Failed to revalidate ${result.url}: ${result.error}`);
                        revalidationSummary.failed++;
                    } else {
                        revalidationSummary.success++;
                    }
                }
                summary[domain.name] = revalidationSummary;
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Failed to revalidate ${domain.name}: ${error}`);
                failedDomains.push(domain.name);
            }
        }

        // eslint-disable-next-line no-console
        logCommand("Revalidation summary");
        Object.entries(summary).forEach(([domain, { success, failed }]) => {
            // eslint-disable-next-line no-console
            console.log(`- ${domain}: ${success} successful, ${failed} failed`);
        });
        failedDomains.forEach((domain) => {
            // eslint-disable-next-line no-console
            console.error(`- ${domain}: Failed to revalidate`);
        });
    }
}
