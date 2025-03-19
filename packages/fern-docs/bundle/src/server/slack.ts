import { after } from "next/server";

import { WebClient } from "@slack/web-api";
import { getEnv } from "@vercel/functions";

export function postToEngineeringNotifs(
  message: string,
  thread?: {
    message: string;
    mrkdwn: boolean;
  }
) {
  return after(async () => {
    console.log("posting to engineering notifs:", message, thread);

    if (!process.env.SLACK_TOKEN) {
      return;
    }

    const { VERCEL_DEPLOYMENT_ID, VERCEL_ENV } = getEnv();

    if (!VERCEL_ENV || VERCEL_ENV === "development") {
      // don't log on dev
      return;
    }

    const webClient = new WebClient(process.env.SLACK_TOKEN);
    const result = await webClient.chat.postMessage({
      channel: "#engineering-notifs",
      text: message,
    });

    if (result.ts && VERCEL_DEPLOYMENT_ID) {
      await webClient.chat.postMessage({
        thread_ts: result.ts,
        channel: "#engineering-notifs",
        text: `View deployment logs: https://vercel.com/buildwithfern/prod.ferndocs.com/${VERCEL_DEPLOYMENT_ID.slice(4)}/logs`,
        unfurl_links: true,
      });
    }

    if (result.ts && thread) {
      await webClient.chat.postMessage({
        channel: "#engineering-notifs",
        text: thread.message,
        thread_ts: result.ts,
        mrkdwn: thread.mrkdwn,
      });
    }
  });
}
