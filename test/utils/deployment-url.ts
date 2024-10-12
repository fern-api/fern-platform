export function getDeploymentOrigin(): string {
    let origin = process.env.DEPLOYMENT_URL ?? "https://app-staging.buildwithfern.com";
    if (!origin.startsWith("http")) {
        origin = `${origin.includes("localhost") ? "http" : "https"}://${origin}`;
    }
    return origin;
}
