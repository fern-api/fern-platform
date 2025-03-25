import { NextRequest, NextResponse } from "next/server";

import { writeFile } from "fs/promises";
import { chromium } from "playwright";

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
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(new URL(path ?? "", `https://${domain}`).toString(), {
      waitUntil: "load",
    });

    const screenshotBuffer = await page.screenshot();
    await browser.close();

    // TODO put in aws
    await writeFile(`${domain}.png`, screenshotBuffer);

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error taking screenshot:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
