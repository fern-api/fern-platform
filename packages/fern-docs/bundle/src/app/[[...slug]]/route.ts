import { MARKDOWN_PATTERN, RSS_PATTERN } from "@/server/patterns";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { handleChangelog } from "./changelog";
import { handleLLMSFullTxt } from "./llms-full.txt";
import { handleLLMSTxt } from "./llms.txt";
import { handleMarkdown } from "./markdown";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug?: string[] } }
): Promise<NextResponse> {
  const slug = params.slug ?? [];
  const lastSlug = slug[slug.length - 1];
  console.log(params);

  if (!lastSlug) {
    notFound();
  }

  if (lastSlug === "llms.txt") {
    return handleLLMSTxt(req, {
      params: { slug: params.slug?.slice(0, -1) },
    });
  }

  if (lastSlug === "llms-full.txt") {
    return handleLLMSFullTxt(req, {
      params: { slug: params.slug?.slice(0, -1) },
    });
  }

  if (lastSlug.match(MARKDOWN_PATTERN)) {
    return handleMarkdown(req, {
      params: {
        slug: [...slug.slice(0, -1), lastSlug.replace(MARKDOWN_PATTERN, "")],
      },
    });
  }

  const match = lastSlug.match(RSS_PATTERN);
  if (match) {
    return handleChangelog(req, {
      params: {
        slug: [...slug.slice(0, -1), lastSlug.replace(RSS_PATTERN, "")],
        format: match[1] as "rss" | "atom" | "json" | undefined,
      },
    });
  }

  return notFound();
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "X-Robots-Tag": "noindex",
      Allow: "OPTIONS, GET",
    },
  });
}
