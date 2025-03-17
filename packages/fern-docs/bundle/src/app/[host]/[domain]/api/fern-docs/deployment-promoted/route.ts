import { NextRequest } from "next/server";

import { getEnv } from "@vercel/functions";
import { kv } from "@vercel/kv";
import { uniq } from "es-toolkit/array";

import { withoutStaging } from "@fern-docs/utils";

import { getMetadata } from "@/server/docs-loader";
import { batchQueue } from "@/server/queue";

export async function POST(request: NextRequest) {
  const { VERCEL_ENV, VERCEL_DEPLOYMENT_ID } = getEnv();

  if (VERCEL_ENV !== "production") {
    throw new Error(
      "Deployment promoted webhook is only available in production"
    );
  }

  // if (
  //   request.headers.get("x-vercel-signature") !==
  //   process.env.DEPLOYMENT_PROMOTED_WEBHOOK_SECRET
  // ) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  console.debug(
    "x-vercel-signature",
    request.headers.get("x-vercel-signature")
  );
  console.debug(await request.json());

  const domains = uniq((await kv.smembers("domains")).map(withoutStaging));

  const settledMetadata = await Promise.allSettled(domains.map(getMetadata));

  const rejectedMetadata = settledMetadata.filter(
    (result) => result.status === "rejected"
  );

  if (rejectedMetadata.length > 0) {
    console.error(
      `Failed to get metadata for ${rejectedMetadata.length} out of ${domains.length} domains`
    );
    rejectedMetadata.forEach((result) => {
      console.error(result.reason);
    });
  }

  const metadatas = settledMetadata
    .filter((result) => result.status === "fulfilled")
    .map((fulfilled) => fulfilled.value);

  await batchQueue({
    queueName: `domain-promoted.${VERCEL_DEPLOYMENT_ID}`,
    parallelism: 10, // slow down the rate of requests to better balance the load on Vercel
    endpoint: "/api/fern-docs/revalidate?reindex=false",
    requests: metadatas.map((metadata) => ({
      host: metadata.domain,
      domain: metadata.domain,
      basepath: metadata.basePath,
      deduplicationId: `revalidate.${VERCEL_DEPLOYMENT_ID}.${metadata.domain}`,
    })),
    method: "GET",
    retries: 1,
    disableVercelPreviewDeployment: true,
  });

  return new Response("OK", { status: 200 });
}
