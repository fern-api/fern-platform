import { NextRequest } from "next/server";

import { kv } from "@vercel/kv";
import urlJoin from "url-join";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";

import { getMetadata } from "@/server/docs-loader";

export async function POST(_request: NextRequest) {
  // if (
  //   request.headers.get("x-vercel-signature") !==
  //   process.env.DEPLOYMENT_PROMOTED_WEBHOOK_SECRET
  // ) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  const promises: Promise<Response>[] = [];

  const domains = await kv.smembers("domains");

  for (const domain of domains) {
    getMetadata(domain).then((metadata) => {
      promises.push(
        fetch(
          urlJoin(
            withDefaultProtocol(metadata.domain),
            metadata.basePath ?? "",
            `/api/fern-docs/revalidate`
          ),
          {
            method: "GET",
          }
        )
      );
    });
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
