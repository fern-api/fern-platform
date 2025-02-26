// cost functions, taken from braintrust
// https://github.com/braintrustdata/braintrust-proxy/blob/43d55b2c7755c8e332a3e0bc957d1c137a2a0a98/packages/proxy/schema/models.ts#L54
export const SONNET35_INPUT_COST_PER_MIL_TOKENS = 3;
export const SONNET35_OUTPUT_COST_PER_MIL_TOKENS = 15;

// TODO: need to figure out the extensions for some of these domains
export const DOMAINS = [
  "elevenlabs.io",
  "buildwithfern.com",
  "openrouter.ai",
  "accelbooks.ai",
  //   "fern.docs.buildwithfern.com",
  //   "fern.docs.staging.buildwithfern.com",
  "alchemy",
  "adobe",
  "firefly",
  "webflow-ai",
  "openledger.com",
  "flagright.com",
  "cohere-test",
  "payroc",
  "aai-try-ai",
  "explo",
  "ava-labs",
  "taxcloud",
  "anduril",
  "circle-fin",
  "nansen.ai",
  "chrt",
  "explorium",
];
