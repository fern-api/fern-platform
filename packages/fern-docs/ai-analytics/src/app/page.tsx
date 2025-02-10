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

export default async function Home() {
  const url = "https://api.braintrust.dev/btql";
  const headers = {
    Authorization: `Bearer ${process.env.BRAINTRUST_API_KEY}`,
    "Content-Type": "application/json",
  };
  const body = {
    query: `select: * | from: project_logs('${BRAINTRUST_PROJECT_ID}') | limit: 100`,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  const jsonData = await response.json();
  const data = jsonData.data;

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
  console.log(processedData);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="container mx-auto px-4 py-8">
        <MessageTableClient initialData={processedData} />
      </div>
    </main>
  );
}
