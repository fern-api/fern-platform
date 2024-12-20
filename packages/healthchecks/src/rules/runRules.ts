/* eslint-disable no-console */
import { FdrClient } from "@fern-api/fdr-sdk";
import { AllPagesLoadRule } from "./all-pages-load";
import { SearchSlugsCorrectRule } from "./search-slugs-correct";

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
    message?: string;
}

function getAllRules(): Rule[] {
    return [new AllPagesLoadRule(), new SearchSlugsCorrectRule()];
}

const FDR_CLIENT = new FdrClient({ environment: "https://registry.buildwithfern.com", token: process.env.FERN_TOKEN });

export async function runRules({ url }: { url: string }): Promise<RuleResult[]> {
    const rules = getAllRules();
    const results: RuleResult[] = [];
    for (const rule of rules) {
        try {
            const result = await rule.run({
                url,
                fdr: FDR_CLIENT,
            });
            results.push(result);
        } catch (error) {
            console.error(`Error running rule ${rule.name}`, JSON.stringify(error));
        }
    }
    return results;
}
