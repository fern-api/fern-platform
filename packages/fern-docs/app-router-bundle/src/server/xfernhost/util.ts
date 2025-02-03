export function cleanHost(host: string | null | undefined): string | undefined {
  if (typeof host !== "string") {
    return undefined;
  }

  host = host.trim();

  // host should not be localhost
  if (host.includes("localhost")) {
    return undefined;
  }

  // host should not be an ip address
  if (host.match(/\d+\.\d+\.\d+\.\d+/)) {
    return undefined;
  }

  // strip `http://` or `https://` from the host, if present
  if (host.includes("://")) {
    host = host.split("://")[1];
  }

  // strip trailing slash from the host, if present
  if (host?.endsWith("/")) {
    host = host.slice(0, -1);
  }

  if (host === "") {
    return undefined;
  }

  return host;
}
