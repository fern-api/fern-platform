import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

import { fernToken_admin, getFdrOrigin } from "./env-variables";

const uncachedGetDocsUrlMetadata = async (
  domain: string
): Promise<{
  url: string;
  org: string;
  isPreview: boolean;
}> => {
  try {
    const response = await fetch(
      `${getFdrOrigin()}/v2/registry/docs/metadata-for-url`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${fernToken_admin()}`,
        },
        body: JSON.stringify({ url: domain }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Invalid docs url metadata (response is not ok) ${response.status} ${response.statusText}`
      );
    }

    const body = await response.json();
    if (typeof body !== "object" || body == null) {
      throw new Error("Invalid docs url metadata (body is not an object)");
    }
    if (typeof body.url !== "string") {
      throw new Error("Invalid docs url metadata (url is not a string)");
    }
    if (typeof body.org !== "string") {
      throw new Error("Invalid docs url metadata (org is not a string)");
    }
    if (typeof body.isPreviewUrl !== "boolean") {
      throw new Error(
        "Invalid docs url metadata (isPreviewUrl is not a boolean)"
      );
    }
    return {
      url: body.url,
      org: body.org,
      isPreview: body.isPreviewUrl,
    };
  } catch (error) {
    console.error("Failed to get docs url metadata", {
      cause: error,
    });
    notFound();
  }
};

export const getDocsUrlMetadata = (domain: string) => {
  const get = unstable_cache(
    uncachedGetDocsUrlMetadata,
    ["docs-url-metadata"],
    { tags: [domain, "getDocsUrlMetadata"] }
  );
  return get(domain);
};
