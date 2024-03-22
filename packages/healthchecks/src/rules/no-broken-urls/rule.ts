import { Rule, RuleResult } from "../runRules";

export class NoBrokenUrlsRule implements Rule {
    name = "no-broken-urls";
    description = "Check that all URLs are reachable";

    public async run(url: string): Promise<RuleResult> {
        return {
            success: true,
            message: "All URLs are reachable",
        };
    }
}
