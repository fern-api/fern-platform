/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable turbo/no-undeclared-env-vars */
import timer, { Timings } from "@szmarczak/http-timer";
import axios from "axios";
import { IncomingMessage } from "http";
import https from "https";
import { parseStringPromise } from "xml2js";

const transport = {
  request: function httpsWithTimer(
    url: string | URL,
    options: https.RequestOptions,
    callback: (res: IncomingMessage) => void
  ) {
    const request = https.request(url, options, callback);
    timer(request);
    return request;
  },
};

const SITES = [
  //   {
  //     hostname: "nominal.ferndocs.app",
  //     sitemapUrl: "https://nominal.ferndocs.app/sitemap.xml",
  //     token: process.env.NOMINAL_FERN_TOKEN!,
  //   },
  //   {
  //     hostname: "docs.nominal.io",
  //     sitemapUrl: "https://nominal.ferndocs.app/sitemap.xml",
  //     token: process.env.NOMINAL_FERN_TOKEN!,
  //   },
  {
    hostname: "secure.docs.propexo.com",
    sitemapUrl: "https://secure.docs.propexo.ferndocs.app/sitemap.xml",
    token: process.env.PROPEXO_FERN_TOKEN!,
  },
  {
    hostname: "secure.docs.propexo.ferndocs.app",
    sitemapUrl: "https://secure.docs.propexo.ferndocs.app/sitemap.xml",
    token: process.env.PROPEXO_FERN_TOKEN!,
  },
];

interface SiteMetrics {
  site: string;
  timeToFirstByte: Metrics;
  contentDownload: Metrics;
  totalDuration: Metrics;
  errorRate: number;
}

interface Metrics {
  average: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

async function fetchSitemapUrls(
  hostname: string,
  sitemapUrl: string,
  token: string
): Promise<string[]> {
  const response = await axios.get(sitemapUrl, {
    headers: { Cookie: `fern_token=${token}` },
  });
  const parsed = await parseStringPromise(response.data);
  return parsed.urlset.url.map((u: any) => {
    const url = new URL(u.loc[0]);
    url.hostname = hostname;
    return url.toString();
  });
}

async function measureUrl(
  url: string,
  token: string
): Promise<{
  timings: Timings;
  ok: boolean;
} | null> {
  try {
    const response = await axios.get(url, {
      headers: { Cookie: `fern_token=${token}` },
      timeout: 10_000,
      transport,
      validateStatus: () => true, // do not throw on bad status codes
    });
    return {
      timings: response.request.timings as Timings,
      ok: response.status === 200 || response.status === 304,
    };
  } catch (_) {
    console.error(`Error fetching ${url}`);
    return null;
  }
}

function calculateSiteMetrics(
  times: {
    timings: Timings;
    ok: boolean;
  }[]
): Omit<SiteMetrics, "site"> {
  const successfulTimes = times.filter((t) => t.ok);
  const errors = times.length - successfulTimes.length;
  const errorRate = errors / times.length;

  const timeToFirstByteValues = successfulTimes
    .map((t) => t.timings.phases.firstByte ?? 0)
    .sort((a, b) => a - b);
  const contentDownloadValues = successfulTimes
    .map((t) => t.timings.phases.download ?? 0)
    .sort((a, b) => a - b);
  const totalDurationValues = successfulTimes
    .map((t) => t.timings.phases.total ?? 0)
    .sort((a, b) => a - b);

  const calculateAverage = (values: number[]) =>
    values.reduce((sum, val) => sum + val, 0) / values.length || 0;
  const calculatePercentile = (values: number[], percentile: number) =>
    values[Math.floor(values.length * percentile)] || 0;

  const metrics = {
    timeToFirstByte: {
      average: calculateAverage(timeToFirstByteValues),
      p75: calculatePercentile(timeToFirstByteValues, 0.75),
      p90: calculatePercentile(timeToFirstByteValues, 0.9),
      p95: calculatePercentile(timeToFirstByteValues, 0.95),
      p99: calculatePercentile(timeToFirstByteValues, 0.99),
    },
    contentDownload: {
      average: calculateAverage(contentDownloadValues),
      p75: calculatePercentile(contentDownloadValues, 0.75),
      p90: calculatePercentile(contentDownloadValues, 0.9),
      p95: calculatePercentile(contentDownloadValues, 0.95),
      p99: calculatePercentile(contentDownloadValues, 0.99),
    },
    totalDuration: {
      average: calculateAverage(totalDurationValues),
      p75: calculatePercentile(totalDurationValues, 0.75),
      p90: calculatePercentile(totalDurationValues, 0.9),
      p95: calculatePercentile(totalDurationValues, 0.95),
      p99: calculatePercentile(totalDurationValues, 0.99),
    },
    errorRate,
  };

  return metrics;
}

async function testSite(site: {
  hostname: string;
  sitemapUrl: string;
  token: string;
}): Promise<SiteMetrics> {
  console.time(`[${site.hostname}]`);
  const urls = await fetchSitemapUrls(
    site.hostname,
    site.sitemapUrl,
    site.token
  );
  console.log(`[${site.hostname}]`, urls.length);
  const times: {
    timings: Timings;
    ok: boolean;
  }[] = [];

  const BATCH_SIZE = 50;
  const allRequests: (() => Promise<void>)[] = [];

  for (let i = 0; i < 10; i++) {
    for (const url of urls) {
      allRequests.push(async () => {
        const data = await measureUrl(url, site.token);
        if (data != null) {
          times.push(data);
        }
      });
    }
  }

  for (let i = 0; i < allRequests.length; i += BATCH_SIZE) {
    const batch = allRequests.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((request) => request()));
    console.timeLog(
      `[${site.hostname}]`,
      `Finished batch ${i / BATCH_SIZE + 1}`
    );
  }

  const metrics = calculateSiteMetrics(times);
  console.timeEnd(`[${site.hostname}]`);
  console.log(`[${site.hostname}]`, metrics);
  return { site: site.hostname, ...metrics };
}

async function main() {
  const allResults = await Promise.all(SITES.map(testSite));

  console.log("Final Results:", JSON.stringify(allResults, null, 2));
}

main().catch(console.error);
