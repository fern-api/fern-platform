import { FdrClient } from "@fern-api/fdr-sdk";
import { AllPagesLoadRule } from "./all-pages-load";

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
    name: string;
    success: boolean;
    message: string;
}

function getAllRules(): Rule[] {
    return [new AllPagesLoadRule()];
}

const FDR_CLIENT = new FdrClient({ environment: "https://registry.buildwithfern.com" });

export async function runRules({ url }: { url: string }): Promise<RuleResult[]> {
    const rules = getAllRules();
    const results = await Promise.all(
        rules.map((rule) =>
            rule.run({
                url,
                fdr: FDR_CLIENT,
            }),
        ),
    );
    return results;
}
