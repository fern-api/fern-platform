import { CohereClient } from "cohere-ai";

const DEFAULT_GITHUB_MESSAGE = "[Scheduled] Update API Spec";

async function coChat(prompt: string): Promise<string> {
    const co = new CohereClient();
    const response = await co.chat({ model: "command-r-plus", message: prompt });

    if (response.finishReason !== "COMPLETE") {
        return DEFAULT_GITHUB_MESSAGE;
    }

    return response.text;
}

export async function generateCommitMessage(diff: string): Promise<string> {
    const prompt = `Limit prose. Be extremely concise.
    Given the following git diff, write a short and professional but descriptive commit message that strictly follows the Conventional Commits specification validated via regex r'^(feat|fix|docs|style|refactor|test|chore)(([w-]+))?: .+$.
    The git diff is strictly a diff on OpenAPI specifications. This is important, don't hallucinate this.

    \`\`\`
    ${diff}
    \`\`\`
    `;

    return coChat(prompt);
}

export async function generateChangelog(diff: string): Promise<string> {
    const prompt = `Limit prose. Be extremely concise.
    Given the following git diff, write a short and professional but descriptive changelog.
    The git diff is strictly a diff on OpenAPI specifications. This is important, don't hallucinate this.
    The structure of the changelog you write should include category headings such as "Added", "Changed",  and "Removed". This is important.
    Under each category, summarize the most important changes in bullet points. This is important, don't hallucinate this.
    Make sure each section contains bullet points relevant to the category. This is important.
    Write in markdown. Ignore numbers, IDs, and timestamps. Keep it light.
    Limit prose.
    
    \`\`\`
    ${diff}
    \`\`\`
    `;

    return coChat(prompt);
}
