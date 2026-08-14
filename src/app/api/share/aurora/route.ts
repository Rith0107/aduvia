import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const maxDuration = 60;
export const runtime = "nodejs";

chromium.setGraphicsMode = false;

const MAX_SVG_LENGTH = 4_000_000;

function validDimension(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 512 && value <= 2048;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null) as { height?: unknown; svg?: unknown; width?: unknown } | null;
  if (!body || !validDimension(body.width) || !validDimension(body.height) || typeof body.svg !== "string" || !body.svg.startsWith("data:image/svg+xml") || body.svg.length > MAX_SVG_LENGTH) {
    return Response.json({ error: "Invalid share artwork." }, { status: 400 });
  }

  const browser = await puppeteer.launch({
    args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
    defaultViewport: { deviceScaleFactor: 1, height: body.height, width: body.width },
    executablePath: await chromium.executablePath(),
    headless: "shell",
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden;background:transparent}img{display:block;width:100%;height:100%}</style></head><body><img alt="" src=${JSON.stringify(body.svg)}></body></html>`, { waitUntil: "domcontentloaded" });
    await page.$eval("img", async (image) => {
      if (image.complete) return;
      await Promise.race([
        image.decode().catch(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
      ]);
    });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ captureBeyondViewport: false, omitBackground: true, type: "png" });
    return new Response(Buffer.from(png), {
      headers: {
        "cache-control": "private, no-store",
        "content-type": "image/png",
      },
    });
  } finally {
    await browser.close();
  }
}
