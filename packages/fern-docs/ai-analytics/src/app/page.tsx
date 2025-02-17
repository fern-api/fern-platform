import { Conversation, Message } from "../../utils/types";
import { MessageTableClient } from "./MessageTable";

export const maxDuration = 300;

interface APIMessage {
  role: string;
  content: string | { text: string; type: string }[];
}

const BRAINTRUST_PROJECT_ID = "9f4a7638-9f59-47f7-8cca-d6c9f4d0e270";

interface ChatLog {
  created: string;
  [key: string]: any;
}

async function fetchChatLogs(
  projectId: string,
  apiKey: string,
  threshold: Date
) {
  const url = "https://api.braintrust.dev/btql";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  let allResults: ChatLog[] = [];
  let cursor: string | null = null;
  let continueLoading = true;

  while (continueLoading) {
    const cursorClause: string = cursor ? ` | cursor: '${cursor}'` : "";
    const body = {
      query: `select: * | from: project_logs('${projectId}') | limit: 300${cursorClause}`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    const jsonData = await response.json();

    if (!jsonData.data || jsonData.data.length === 0) {
      break;
    }

    // Check if any results are before our threshold date
    const hasPreThresholdResults = jsonData.data.some((item: ChatLog) => {
      const date = new Date(item.created);
      return date < threshold;
    });

    // If we found pre-threshold results, filter them out and stop
    if (hasPreThresholdResults) {
      const filteredResults = jsonData.data.filter((item: ChatLog) => {
        const date = new Date(item.created);
        return date >= threshold;
      });
      allResults = [...allResults, ...filteredResults];
      continueLoading = false;
    } else {
      allResults = [...allResults, ...jsonData.data];
    }

    // Update cursor for next iteration
    cursor = jsonData.cursor;

    // If no cursor is returned, we've reached the end
    if (!cursor) {
      break;
    }
  }

  return allResults;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const daysBack = params.daysBack ? parseInt(params.daysBack) : 1;
  const thresholdDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysBack);
  const chatLogs = await fetchChatLogs(
    BRAINTRUST_PROJECT_ID,
    process.env.BRAINTRUST_API_KEY || "",
    thresholdDate
  );

  const processedData: Conversation[] = [];

  for (const convo of chatLogs) {
    if (convo.input !== null && convo.output !== null) {
      try {
        let domain = "";
        convo.input.forEach((msg: APIMessage) => {
          // find domain from preamble
          if (msg.role === "system") {
            if (typeof msg.content === "string") {
              if (msg.content && msg.content.includes("elevenlabs.io")) {
                domain = "elevenlabs.io";
              } else {
                domain = "buildwithfern.com";
              }
            }
          }
        });

        const cleanedInput = convo.input
          .map((msg: APIMessage) => {
            if (msg.role === "user") {
              if (typeof msg.content === "string") {
                return {
                  role: "user",
                  content: msg.content,
                };
              }
              return {
                role: "user",
                content: msg.content[0].text,
              };
            } else {
              return msg;
            }
          })
          .filter(
            (msg: Message) => msg.role !== "system" && msg.role !== "tool"
          );
        cleanedInput.push(convo.output.message);
        processedData.push({
          domain,
          content: cleanedInput,
          created: new Date(convo.created),
          conversationId: convo.id,
          timeToFirstToken: convo.metrics.time_to_first_token,
          conversationDuration: convo.metrics.end - convo.metrics.start,
          promptTokens: convo.metrics.prompt_tokens,
          completionTokens: convo.metrics.completion_tokens,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-white"
      style={{ color: "black" }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">
            Showing conversations since {thresholdDate.toLocaleDateString()}
          </h1>
          <h6>
            To modify the date range, add <code>?daysBack=X</code> to the URL.
          </h6>
          <br />
        </div>
        <MessageTableClient initialData={processedData} />
      </div>
    </main>
  );
}
