import { NextRequest, NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import chromium from "@sparticuz/chromium";
import puppeteer, { Browser, Page } from "puppeteer-core";
import sharp from "sharp";
import { setTimeout } from "timers/promises";

import { FdrAPI } from "@fern-api/fdr-sdk";
import { FernVenusApi } from "@fern-api/venus-api-sdk";

import { getFdrClient } from "../../services/fdr";
import { getS3Client } from "../../services/s3";
import { getVenusClient } from "../../services/venus";
import { parseAuthHeader } from "./parseAuthHeader";

export const maxDuration = 60;

const IMAGE_FILETYPE = "avif";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  let token: string;
  try {
    const parsedAuthHeader = parseAuthHeader(authHeader);
    token = parsedAuthHeader.token;
  } catch (e) {
    console.error("Failed to parse auth header", e);
    return NextResponse.json({}, { status: 401 });
  }

  const { domain, path } = await req.json();

  if (domain == null) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }
  if (typeof domain !== "string") {
    return NextResponse.json(
      { error: "domain must be a string" },
      { status: 400 }
    );
  }
  if (path != null && typeof path !== "string") {
    return NextResponse.json(
      { error: "path must be a null | string" },
      { status: 400 }
    );
  }

  const fdr = getFdrClient({ token });
  const tokenInfo = await fdr.docs.v2.read.getDocsUrlMetadata({
    url: FdrAPI.Url(new URL(path ?? "", `https://${domain}`).toString()),
  });
  if (!tokenInfo.ok) {
    console.error("Failed to load docs URL metadata", tokenInfo.error);
    throw new Error("Failed to load docs URL metadata");
  }
  const orgId = tokenInfo.body.org;

  const venus = getVenusClient({ token });
  const isMember = await venus.organization.isMember(
    FernVenusApi.OrganizationId(orgId)
  );
  if (!isMember.ok) {
    console.error("Failed to load org membership for user", isMember.error);
    throw new Error("Failed to load org membership for user");
  }
  if (!isMember.body) {
    return NextResponse.json(
      { error: "User does not have access to url" },
      { status: 403 }
    );
  }

  try {
    let browser: Browser;

    if (process.env.NODE_ENV === "production") {
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 700, deviceScaleFactor: 2 });

    const url = new URL(path ?? "", `https://${domain}`).toString();

    await takeScreenshotAndWriteToAws({ page, url, theme: "light" });
    await takeScreenshotAndWriteToAws({ page, url, theme: "dark" });

    await browser.close();
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

type Theme = "light" | "dark";

async function takeScreenshotAndWriteToAws({
  page,
  url,
  theme,
}: {
  page: Page;
  url: string;
  theme: Theme;
}) {
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: theme },
  ]);

  await page.goto(url.toString(), {
    waitUntil: "load",
  });

  // wait for icons and images to load
  await setTimeout(3_000);

  const screenshotBuffer = await page.screenshot();

  // this must stay in sync with the IMAGE_FILETYPE constant
  const compressedScreenshotBuffer = await sharp(screenshotBuffer)
    [IMAGE_FILETYPE]({ quality: 50 })
    .toBuffer();

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: "dev2-docs-homepage-images",
      Key: getS3KeyForHomepageScreenshot({ url, theme }),
      Body: compressedScreenshotBuffer,
      ContentType: `image/${IMAGE_FILETYPE}`,
      ACL: "private",
    })
  );
}

// NOTE: DO NOT CHANGE THIS LOGIC as this is the only source of truth for the
// homepage screenshot s3 key (i.e. keys are not stored in a db anywhere).
function getS3KeyForHomepageScreenshot({
  url,
  theme,
}: {
  url: string;
  theme: Theme;
}) {
  return `${encodeURIComponent(url)}-${theme}.${IMAGE_FILETYPE}`;
}
