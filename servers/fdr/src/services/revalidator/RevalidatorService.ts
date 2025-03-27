import { FernDocs } from "@fern-fern/fern-docs-sdk";

import { FdrApplication } from "../../app";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

export type RevalidatedPathsResponse = {
  successful: FernDocs.SuccessfulRevalidation[];
  failed: FernDocs.FailedRevalidation[];
  revalidationFailed: boolean;
};

export interface RevalidatorService {
  revalidate(params: {
    baseUrl: ParsedBaseUrl;
    app: FdrApplication;
  }): Promise<RevalidatedPathsResponse>;
}

export class RevalidatorServiceImpl implements RevalidatorService {
  // private readonly semaphore = new Semaphore(50);

  /**
   * NOTE on basepath revalidation:
   *
   * When the baseUrl.path is not null, the custom domain is re-written. Thus,
   * /api/revalidate-all does not exist on the root, but `/base/path/api/revalidate-all` does (rewritten via frontend middleware).
   *
   * Behind the scenes, the revalidation request is sent to the original domain, i.e. org.docs.buildwithfern.com.
   *
   * Example prefetch request:
   * https://custom-domain.com/path/_next/data/.../static/custom-domain.com/path.json is rewritten to:
   * https://org.docs.buildwithfern.com/path/_next/data/.../static/custom-domain.com/path.json
   *
   * So `/static/custom-domain.com/path` is the path we need to revalidate on org.docs.buildwithfern.com
   */

  public async revalidate({
    baseUrl,
    app,
  }: {
    baseUrl: ParsedBaseUrl;
    app?: FdrApplication;
  }): Promise<RevalidatedPathsResponse> {
    // let revalidationFailed = false;
    try {
      app?.logger.log("Revalidating paths at", baseUrl.toURL().toString());
      await fetch(
        `https://${baseUrl.hostname}${baseUrl.path || ""}/api/fern-docs/revalidate-all/v3`
      );
      return {
        successful: [],
        failed: [],
        revalidationFailed: false,
      };
    } catch (e) {
      app?.logger.error("Failed to revalidate paths", e);
      // revalidationFailed = true;
      console.log(e);
      return {
        successful: [],
        failed: [],
        revalidationFailed: true,
      };
    }

    // let revalidationFailed = false;
    // try {
    //     const client = new FernDocsClient({
    //         environment: baseUrl.toURL().toString(),
    //     });
    //     app?.logger.log("Revalidating paths at", baseUrl.toURL().toString());
    //     const page = await client.revalidation.revalidateAllV4({ limit: 100 });

    //     const successful: FernDocs.SuccessfulRevalidation[] = [];
    //     const failed: FernDocs.FailedRevalidation[] = [];

    //     for await (const result of page) {
    //         if (!result.success) {
    //             failed.push(result);
    //             app?.logger.error(`Revalidation failed for ${result.url}`, result.error);
    //         } else {
    //             successful.push(result);
    //         }
    //     }

    //     return {
    //         failed,
    //         successful,
    //         revalidationFailed: false,
    //     };
    // } catch (e) {
    //     app?.logger.error("Failed to revalidate paths", e);
    //     revalidationFailed = true;
    //     console.log(e);
    //     return { failed: [], successful: [], revalidationFailed: true };
    // }
  }
}
