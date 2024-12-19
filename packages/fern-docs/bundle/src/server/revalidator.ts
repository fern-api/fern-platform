import type { FernDocs } from "@fern-fern/fern-docs-sdk";
import type { NextApiResponse } from "next";
import urljoin from "url-join";
import { conformTrailingSlash } from "./trailingSlash";

export class Revalidator implements Revalidator {
  constructor(
    private res: NextApiResponse,
    private domain: string
  ) {}

  getUrl(path: string): string {
    return conformTrailingSlash(urljoin(this.domain, encodeURI(path)));
  }

  async path(path: string): Promise<FernDocs.RevalidationResult> {
    const url = this.getUrl(path);
    // eslint-disable-next-line no-console
    console.log(`Revalidating ${url}`);
    try {
      await this.res.revalidate(`/static/${url}`);
      return { success: true, url };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to revalidate ${url}:`, error);
      return { success: false, url, error: String(error) };
    }
  }

  async batch(paths: string[]): Promise<FernDocs.RevalidationResult[]> {
    const results: FernDocs.RevalidationResult[] = await Promise.all(
      paths.map(async (path): Promise<FernDocs.RevalidationResult> => {
        return this.path(path);
      })
    );
    return results;
  }
}
