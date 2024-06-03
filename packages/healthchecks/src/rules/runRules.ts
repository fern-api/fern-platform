/* eslint-disable no-console */
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
    url: string
}

function getAllRules(): Rule[] {
    return [new AllPagesLoadRule()];
}

const FDR_CLIENT = new FdrClient({ environment: "https://registry.buildwithfern.com" });

export async function runRules({ url }: { url: string }): Promise<RuleResult[]> {
    const rules = getAllRules();
    const rulePromises: Promise<RuleResult>[] = [];
    for (const rule of rules) {
        try {
            const rulePromise = rule.run({
                url,
                fdr: FDR_CLIENT,
            });
            rulePromises.push(rulePromise);
        } catch (error) {
            console.error(`Error running rule ${rule.name}`);
        }
    }
    return await Promise.all(rulePromises);
}
