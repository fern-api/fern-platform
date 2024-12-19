export function obfuscateSecret(secret: string): string {
  if (secret.trimEnd().length === 0) {
    return secret;
  }
  if (secret.length < 28) {
    return secret.slice(0, 1) + "*".repeat(25) + secret.slice(-2);
  }
  return secret.slice(0, 12) + "...." + secret.slice(-12);
}
