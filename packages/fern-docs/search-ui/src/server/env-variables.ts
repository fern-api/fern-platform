import "server-only";

export function algoliaAppId(): string {
  return getEnvVariable("ALGOLIA_APP_ID");
}

export function algoliaWriteApiKey(): string {
  return getEnvVariable("ALGOLIA_WRITE_API_KEY");
}

export function algoliaSearchApikey(): string {
  return getEnvVariable("ALGOLIA_SEARCH_API_KEY");
}

export function fernToken_admin(): string {
  return getEnvVariable("FERN_TOKEN");
}

export function fdrEnvironment(): string {
  return getEnvVariable("FDR_ENVIRONMENT");
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

function assertNonNullable<T>(
  value: T,
  key: string
): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(`${key} is not defined`);
  }
}

function getEnvVariable(key: string) {
  const env = process.env[key];
  assertNonNullable(env, key);
  return env;
}
