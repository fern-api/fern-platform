import { NextRequest } from "next/server";

import { kv } from "@vercel/kv";
import { uniq } from "es-toolkit/array";

import { withoutStaging } from "@fern-docs/utils";

import { getMetadata } from "@/server/docs-loader";

export async function POST(request: NextRequest) {
  // if (
  //   request.headers.get("x-vercel-signature") !==
  //   process.env.DEPLOYMENT_PROMOTED_WEBHOOK_SECRET
  // ) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  console.log(await request.json());

  const promises: Promise<Response>[] = [];

  const domains = uniq((await kv.smembers("domains")).map(withoutStaging));

  for (const domain of domains) {
    promises.push(
      getMetadata(domain).then((metadata) =>
        fetch(
          `https://${metadata.domain}${metadata.basePath}/api/fern-docs/revalidate`,
          { cache: "no-cache" }
        )
      )
    );
  }

  const results = await Promise.allSettled(promises);
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(domains[index], result.value.status);
    } else {
      console.error(domains[index], result.reason);
    }
  });

  return new Response("OK", { status: 200 });
}
