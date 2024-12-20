export function algoliaAppId(): string {
  return getEnvVariable("ALGOLIA_APP_ID");
}

export function algoliaWriteApiKey(): string {
  return getEnvVariable("ALGOLIA_WRITE_API_KEY");
}

export function algoliaSearchApikey(): string {
  return getEnvVariable("ALGOLIA_SEARCH_API_KEY");
}

export function fernToken(): string {
  return getEnvVariable("FERN_TOKEN");
}

export function fdrEnvironment(): string {
  return getEnvVariable("NEXT_PUBLIC_FDR_ORIGIN");
}

export function qstashToken(): string {
  return getEnvVariable("QSTASH_TOKEN");
}

export function qstashCurrentSigningKey(): string {
  return getEnvVariable("QSTASH_CURRENT_SIGNING_KEY");
}

export function qstashNextSigningKey(): string {
  return getEnvVariable("QSTASH_NEXT_SIGNING_KEY");
}

export function turbopufferApiKey(): string {
  return getEnvVariable("TURBOPUFFER_API_KEY");
}

export function anthropicApiKey(): string {
  return getEnvVariable("ANTHROPIC_API_KEY");
}

export function openaiApiKey(): string {
  return getEnvVariable("OPENAI_API_KEY");
}

function getEnvVariable(key: string) {
  const env = process.env[key];
  if (env == null) {
    console.error(`${key} is not defined`);
  }
  return env ?? "";
}
