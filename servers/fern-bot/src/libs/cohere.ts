import { CohereClient } from "cohere-ai";

const DEFAULT_GITHUB_MESSAGE = "[Scheduled] Update API Spec";

async function coChat(prompt: string, preamble: string): Promise<string> {
    const co = new CohereClient();
    const response = await co.chat({ model: "command-r-plus", message: prompt, preamble });

    if (response.finishReason !== "COMPLETE") {
        return DEFAULT_GITHUB_MESSAGE;
    }

    return response.text;
}

export async function generateCommitMessage(diff: string): Promise<string> {
    const prompt = `Limit prose. Be extremely concise.
    Given the following git diff, write a short and professional but descriptive commit message that strictly follows the Conventional Commits specification validated via regex r'^(feat|fix|docs|style|refactor|test|chore)(([w-]+))?: .+$.
    The commit message should be a summary of all the changes and should provide as much detail as possible to give context to the changes, while remaining short and concise. This is important, don't hallucinate this.
    The git diff is strictly a diff on OpenAPI specifications. This is important, don't hallucinate this.

    \`\`\`
    ${diff}
    \`\`\`
    `;

    const preamble =
        "You are an OpenAPI expert working on a project. You have made some changes to the OpenAPI specification. You need to write a commit message that follows the Conventional Commits specification.";

    return coChat(prompt, preamble);
}

export async function generateChangelog(diff: string): Promise<string> {
    const prompt = `Limit prose. Be extremely concise.
    Given the following git diff, write a short and professional but descriptive changelog.
    The git diff is strictly a diff on OpenAPI specifications. This is important, don't hallucinate this.
    The changelog should follow the template below. This is important, don't hallucinate this:
        <summary of all the changes, be specific and concise>
        ## Added
        <summarize the most important changes that were added in bullet points>
        ## Removed
        <summarize the most important changes that were removed in bullet points>
        ## Changed
        <summarize the most important changes that were changed in bullet points>
    
    The summary of all the changes should provide as much detail as possible to give context to the changes, while remaining short and concise. This is important, don't hallucinate this.
    Notice the category headings of "Added", "Changed",  and "Removed". This is important.
    Under each category, summarize the most important changes in bullet points. This is important, don't hallucinate this.
    Make sure each section contains bullet points relevant to the category. This is important.
    Write in markdown. Keep it light. Limit prose.
    
    \`\`\`
    ${diff}
    \`\`\`
    `;

    const preamble =
        "You are an OpenAPI expert working on a project. You have made some changes to the OpenAPI specification. You need to write a changelog explaining your changes in a user-friendly, understandable way.";

    return coChat(prompt, preamble);
}
