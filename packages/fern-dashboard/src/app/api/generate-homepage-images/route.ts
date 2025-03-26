import { NextRequest, NextResponse } from "next/server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import chromium from "@sparticuz/chromium";
import puppeteer, { Browser, Page } from "puppeteer-core";
import sharp from "sharp";
import { setTimeout } from "timers/promises";

import { getS3Client } from "./s3";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
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

  const screenshotPngBuffer = await page.screenshot();

  const screenshotAvifBuffer = await sharp(screenshotPngBuffer)
    .avif({ quality: 50 })
    .toBuffer();

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: "dev2-docs-homepage-images",
      Key: getS3KeyForHomepageScreenshot({ url, theme }),
      Body: screenshotAvifBuffer,
      ContentType: "image/avif",
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
  return `${encodeURIComponent(url)}-${theme}.avif`;
}
