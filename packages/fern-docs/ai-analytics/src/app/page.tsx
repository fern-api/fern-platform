import { MessageTableClient } from "./MessageTable";

interface APIMessage {
  role: string;
  content: string | { text: string; type: string }[];
}

interface Message {
  role: string;
  content: string;
}

interface DomainMessages {
  domain: string;
  content: Message[];
}

const BRAINTRUST_PROJECT_ID = "9f4a7638-9f59-47f7-8cca-d6c9f4d0e270";

interface ChatLog {
  created: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

async function fetchCountsByDomainAfterThreshold(thresholdDate: Date) {
  const url = "https://api.braintrust.dev/btql";
  const headers = {
    Authorization: `Bearer ${process.env.BRAINTRUST_API_KEY}`,
    "Content-Type": "application/json",
  };

  const domains = ["elevenlabs.io", "buildwithfern.com"];
  const counts: { [key: string]: number } = {};
  for (const domain of domains) {
    const body = {
      query: `measures: count(1) as count | from: project_logs('${BRAINTRUST_PROJECT_ID}') | 
        filter: created > '${thresholdDate.toISOString()}' and input LIKE '%${domain}%'
        `,
    };
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const jsonData = await response.json();
    counts[domain] = jsonData.data[0].count;
  }
  return counts;
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
  searchParams: { [key: string]: string | undefined };
}) {
  const params = await searchParams;
  const daysBack = params.daysBack ? parseInt(params.daysBack) : 1;
  const thresholdDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * daysBack);
  const chatLogs = await fetchChatLogs(
    BRAINTRUST_PROJECT_ID,
    process.env.BRAINTRUST_API_KEY || "",
    thresholdDate
  );
  // const counts = await fetchCountsByDomainAfterThreshold(thresholdDate);

  const data = chatLogs;

  const processedData: DomainMessages[] = [];

  for (const convo of data) {
    if (convo.input !== null && convo.output !== null) {
      let domain = "";
      convo.input.forEach((msg: APIMessage) => {
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
        .filter((msg: Message) => msg.role !== "system" && msg.role !== "tool");
      cleanedInput.push(convo.output.message);
      processedData.push({ domain, content: cleanedInput });
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
        </div>
        <MessageTableClient initialData={processedData} />
      </div>
    </main>
  );
}
