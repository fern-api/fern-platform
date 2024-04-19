import { FdrClient } from "@fern-api/fdr-sdk";

export interface RuleArgs {
    url: string;
    fdr: FdrClient;
}

export interface Rule {
    name: string;
    description: string;
    run: ({ url, fdr }: RuleArgs) => Promise<RuleResult>;
}

export interface RuleResult {
    success: boolean;
    message: string;
}

function getAllRules(): Rule[] {
    return [];
}

export async function runRules({ url, stack }: { url: string; stack: "dev" | "prod" }): Promise<RuleResult[]> {
    const rules = getAllRules();
    const results = await Promise.all(
        rules.map((rule) =>
            rule.run({
                url,
                fdr: stack === "dev" ? new FdrClient({ environment: "" }) : new FdrClient({ environment: "" }),
            }),
        ),
    );
    return results;
}
