type Environment = "preview" | "production";

function isValidEnvironment(environment: string): environment is Environment {
  return environment === "preview" || environment === "production";
}

export function assertValidEnvironment(
  environment: string
): asserts environment is Environment {
  if (!isValidEnvironment(environment)) {
    throw new Error(`Invalid environment: ${environment}`);
  }
}
