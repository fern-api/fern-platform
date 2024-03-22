export interface Rule {
    name: string;
    description: string;
    run: (url: string) => Promise<RuleResult>;
}

export interface RuleResult {
    success: boolean;
    message: string;
}

function getAllRules(): Rule[] {
    return [];
}

export async function runRules(url: string): Promise<RuleResult[]> {
    const rules = getAllRules();
    const results = await Promise.all(rules.map((rule) => rule.run(url)));
    return results;
}
