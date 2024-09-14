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

const PROJECTS = ["app.buildwithfern.com", "app.ferndocs.com", "app-slash.ferndocs.com"];
const DENY_LIST = [...PROJECTS, "fdr-ete-test.buildwithfern.com"];

const ADDITIONAL_DOMAINS = [
    "buildwithfern.com", // buildwithfern.com/learn
    "octo.ai", // octo.ai/docs/
];

async function fetchDomainsPage(project, since) {
    let uri = `${BASE_URL}/v9/projects/${project}/domains?limit=50&teamId=${process.env.VERCEL_ORG_ID}&withGitRepoInfo=false&production=true&redirects=false&order=ASC`;
    uri = since ? `${uri}&since=${since + 1}` : uri;

    const res = await fetch(uri, {
        headers: { Authorization: "Bearer " + process.env.VERCEL_TOKEN },
    });
    return res.json();
}

async function fetchDomains(project) {
    let domains = [];
    let next;

    do {
        const body = await fetchDomainsPage(project, next);

        domains = domains.concat(body.domains);
        next = body.pagination.next;
    } while (next);

    return domains;
}

async function main() {
    let domains = new Set(ADDITIONAL_DOMAINS);

    for (const project of PROJECTS) {
        const projectDomains = await fetchDomains(project);

        projectDomains.forEach((domain) => {
            if (!DENY_LIST.includes(domain.name) && !domain.name.endsWith("vercel.app")) {
                domains.add(domain.name);
            }
        });
    }

    domains = Array.from(domains).sort();

    /**
     * Write the domains to a file
     */
    fs.writeFileSync("domains.txt", domains.join("\n"));

    /**
     * Write the preview markdown to a file, if DEPLOYMENT_URL is set
     */
    if (process.env.PR_PREVIEW && process.env.PR_PREVIEW !== "false") {
        fs.writeFileSync(
            "preview.txt",
            `## PR Preview\n\n${domains.map((d) => `- [ ] [${d}](${deploymentUrl}/api/fern-docs/preview?host=${d})`).join("\n")}`,
        );
    }
}

main();
