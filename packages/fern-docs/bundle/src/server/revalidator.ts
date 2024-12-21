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
    if (path.startsWith("/api/fern-docs")) {
      return path;
    }
    return `/static/${conformTrailingSlash(urljoin(this.domain, encodeURI(path)))}`;
  }

  async path(path: string): Promise<FernDocs.RevalidationResult> {
    const fullpath = this.getUrl(path);

    console.log(`Revalidating ${fullpath}`);
    try {
      await this.res.revalidate(fullpath);
      return { success: true, url: fullpath.replace(/^\/static/, "") };
    } catch (error) {
      console.error(`Failed to revalidate ${fullpath}:`, error);
      return {
        success: false,
        url: fullpath.replace(/^\/static/, ""),
        error: String(error),
      };
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
