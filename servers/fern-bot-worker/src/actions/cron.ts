export async function updateOpenApiSpecs(): Promise<void> {
    // Need to store:
    // 1. OpenAPI spec hosting URL
    // 2. The org and repo it belongs to
    // 3. Where the spec lives in the repo
    //
    // Need to do:
    // 1. Get all specs
    // 2. For each spec:
    //    a. Download the spec from the hosting URL
    //    b. Pull the org's repo
    //    c. Update the spec in the repo
    //    d. Push the changes
    //    e. Open a PR
}
