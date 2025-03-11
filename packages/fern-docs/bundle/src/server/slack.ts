import { after } from "next/server";

import { WebClient } from "@slack/web-api";

export function postToEngineeringNotifs(message: string) {
  return after(async () => {
    if (!process.env.SLACK_TOKEN) {
      return;
    }

    const webClient = new WebClient(process.env.SLACK_TOKEN);
    await webClient.chat.postMessage({
      channel: "#engineering-notifs",
      text: message,
    });
  });
}
