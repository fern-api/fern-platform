import { createAnthropic } from "@ai-sdk/anthropic";
import { createCohere } from "@ai-sdk/cohere";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV1 } from "@ai-sdk/provider";

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const cohere = createCohere({
    apiKey: process.env.COHERE_API_KEY,
});

type Model =
    | "gpt-4o"
    | "gpt-4o-mini"
    | "command-r-plus"
    | "command-r"
    | "claude-3-opus"
    | "claude-3-5-sonnet"
    | "claude-3-5-haiku";

const models: Record<Model, LanguageModelV1> = {
    "gpt-4o": openai.languageModel("gpt-4o"),
    "gpt-4o-mini": openai.languageModel("gpt-4o-mini"),
    "command-r-plus": cohere.languageModel("command-r-plus"),
    "command-r": cohere.languageModel("command-r"),
    "claude-3-opus": anthropic.languageModel("claude-3-opus-latest"),
    "claude-3-5-sonnet": anthropic.languageModel("claude-3-5-sonnet-latest"),
    "claude-3-5-haiku": anthropic.languageModel("claude-3-5-haiku-latest"),
} as const;

export { models };
