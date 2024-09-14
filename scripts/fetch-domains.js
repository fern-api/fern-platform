const fs = require("fs");

const BASE_URL = "https://api.vercel.com";
const TEAM_ID = "team_6FKOM5nw037hv8g2mTk3gaH7";
const PROJECT_NAME = "app.buildwithfern.com";

const DENY_LIST = ["app.buildwithfern.com", "fdr-ete-test.buildwithfern.com"];

function retrieveDomainsUri(since) {
    const params = `${BASE_URL}/v9/projects/${PROJECT_NAME}/domains?limit=50&teamId=${TEAM_ID}&withGitRepoInfo=false&production=true&redirects=false&order=ASC`;
    return since ? `${params}&since=${since}` : params;
}

async function main() {
    const domains = [];

    let next;

    do {
        let res = await fetch(retrieveDomainsUri(next), {
            headers: { Authorization: "Bearer " + process.env.VERCEL_TOKEN },
        });

        let body = await res.json();
        body.domains.map((domain) => {
            if (!DENY_LIST.includes(domain.name)) {
                domains.push(domain.name);
            }
        });
        next = body.pagination.next;
    } while (next);

    fs.writeFileSync("domains.txt", domains.join("\n"));
}

main();
