import { inject } from "vitest";
import { getClient } from "./util";

it("revalidates a custom docs domain", async () => {
    const fdr = getClient({ authed: true, url: inject("url") });

    const resp = await fdr.docs.v2.read.listAllDocsUrls();

    if (!resp.ok) {
        throw new Error("Failed to list all docs urls");
    }

    const { urls } = resp.body;

    expect(urls.length).toBe(0);
});
