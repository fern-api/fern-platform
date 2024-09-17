const fs = require("fs");

if (!process.env.VERCEL_TOKEN) {
    console.error("VERCEL_TOKEN is required");
    process.exit(1);
}

if (!process.env.VERCEL_ORG_ID) {
    console.error("VERCEL_ORG_ID is required");
    process.exit(1);
}

const BASE_URL = "https://api.vercel.com";

const PROJECT = "app.buildwithfern.com";
const DENY_LIST = [PROJECT, "fdr-ete-test.buildwithfern.com"];

async function fetchDomainsPage(since) {
    let uri = `${BASE_URL}/v9/projects/${PROJECT}/domains?limit=50&teamId=${process.env.VERCEL_ORG_ID}&withGitRepoInfo=false&production=true&redirects=false&order=ASC`;
    uri = since ? `${params}&since=${since + 1}` : uri;

    const res = await fetch(uri, {
        headers: { Authorization: "Bearer " + process.env.VERCEL_TOKEN },
    });
    return res.json();
}

async function fetchDomains() {
    let domains = [];
    let next;

    do {
        const body = await fetchDomainsPage(next);

        domains = domains.concat(body.domains);
        next = body.pagination.next;
    } while (next);

    return domains;
}

async function main() {
    let domains = new Set();

    const projectDomains = await fetchDomains();

    projectDomains.forEach((domain) => {
        if (!DENY_LIST.includes(domain.name) && !domain.name.endsWith("vercel.app")) {
            domains.add(domain.name);
        }
    });

    domains = Array.from(domains).sort();

    for (const domain of domains) {
        const start = Date.now();
        const res = await fetch(`https://${domain}/api/fern-docs/revalidate-all/v3`);
        const duration = Date.now() - start;
        const body = await res.json();
        console.log(
            `${res.status === 200 ? "✅" : "❌"} | ${domain} | Response: ${res.status} | Success = ${body.successfulRevalidations.length} | Failed = ${body.failedRevalidations.length} | Duration = ${duration}ms`,
        );
    }

    /**
     * Write the domains to a file
     */
    fs.writeFileSync("domains.txt", domains.join("\n"));
    w;
}

main();
