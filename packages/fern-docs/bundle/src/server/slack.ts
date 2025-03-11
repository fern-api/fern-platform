import { after } from "next/server";

import { WebClient } from "@slack/web-api";
import { kv } from "@vercel/kv";

export function postToEngineeringNotifs(message: string) {
  return after(async () => {
    if (!process.env.SLACK_TOKEN) {
      return;
    }

    // deduplicate messages by checking the last message
    const lastMessage = await kv.get("slack-last-message");

    if (lastMessage === message) {
      return;
    }

    await kv.set("slack-last-message", message, {
      ex: 60, // expires every 60 seconds
    });

    const webClient = new WebClient(process.env.SLACK_TOKEN);
    await webClient.chat.postMessage({
      channel: "#engineering-notifs",
      text: message,
    });
  });
}
